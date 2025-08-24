use crate::error::{OrditoError, Result};
use crate::models::*;
use crate::services::{CommandService, NotificationService};
use crate::storage::StorageHandle;
use chrono::{DateTime, Utc};
use cron::Schedule;
use std::collections::HashMap;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{Mutex, RwLock};
use tokio::time::interval;
use tracing::{debug, error, info, warn};
use uuid::Uuid;

#[derive(Debug)]
pub struct SchedulerService {
    storage: StorageHandle,
    command_service: Arc<CommandService>,
    notification_service: Option<Arc<NotificationService>>,
    running_schedules: Arc<RwLock<HashMap<Uuid, ScheduleRunner>>>,
    is_running: Arc<Mutex<bool>>,
}

#[derive(Debug)]
struct ScheduleRunner {
    schedule: crate::models::Schedule,
    cron_schedule: Schedule,
    last_check: DateTime<Utc>,
}

impl SchedulerService {
    pub fn new(storage: StorageHandle, command_service: Arc<CommandService>) -> Self {
        Self {
            storage,
            command_service,
            notification_service: None,
            running_schedules: Arc::new(RwLock::new(HashMap::new())),
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    pub fn set_notification_service(&mut self, notification_service: Arc<NotificationService>) {
        self.notification_service = Some(notification_service);
    }

    pub async fn start(&self) -> Result<()> {
        let mut is_running = self.is_running.lock().await;
        if *is_running {
            return Ok(());
        }

        info!("Starting scheduler service");
        *is_running = true;
        drop(is_running);

        self.load_schedules().await?;

        let service_clone = self.clone();
        tokio::spawn(async move {
            service_clone.run_scheduler_loop().await;
        });

        // Start warning notification loop (checks every 5 minutes for upcoming schedules)
        let warning_service_clone = self.clone();
        tokio::spawn(async move {
            warning_service_clone.run_warning_loop().await;
        });

        Ok(())
    }

    pub async fn stop(&self) -> Result<()> {
        info!("Stopping scheduler service");
        let mut is_running = self.is_running.lock().await;
        *is_running = false;
        Ok(())
    }

    pub async fn get_schedules(&self) -> Result<Vec<crate::models::Schedule>> {
        let storage = self.storage.read().await;
        Ok(storage.get_config().schedules.clone())
    }

    pub async fn get_schedule_by_id(&self, id: Uuid) -> Result<Option<crate::models::Schedule>> {
        let storage = self.storage.read().await;
        Ok(storage
            .get_config()
            .schedules
            .iter()
            .find(|s| s.id == id)
            .cloned())
    }

    pub async fn create_schedule(
        &self,
        request: CreateScheduleRequest,
    ) -> Result<crate::models::Schedule> {
        info!("Creating schedule: {}", request.name);

        crate::utils::validate_cron_expression(&request.cron_expression)?;

        let mut schedule =
            crate::models::Schedule::new(request.name, request.cron_expression.clone());
        schedule.description = request.description;
        schedule.command_id = request.command_id;
        schedule.group_id = request.group_id;
        schedule.max_executions = request.max_executions;

        let next_execution = self.calculate_next_execution(&request.cron_expression)?;
        schedule.next_execution = Some(next_execution);

        let mut storage = self.storage.write().await;
        let config = storage.get_config_mut();

        if config.schedules.iter().any(|s| s.name == schedule.name) {
            return Err(OrditoError::Scheduler(
                "Schedule with this name already exists".to_string(),
            ));
        }

        config.schedules.push(schedule.clone());
        storage.save().await?;

        self.add_schedule_runner(&schedule).await?;

        debug!("Schedule created with ID: {}", schedule.id);
        Ok(schedule)
    }

    pub async fn update_schedule(
        &self,
        request: UpdateScheduleRequest,
    ) -> Result<crate::models::Schedule> {
        info!("Updating schedule: {}", request.id);

        let mut storage = self.storage.write().await;

        // First check for name conflicts
        if let Some(name) = &request.name {
            let config = storage.get_config();
            let name_exists = config
                .schedules
                .iter()
                .any(|s| s.id != request.id && s.name == *name);
            if name_exists {
                return Err(OrditoError::Scheduler(
                    "Schedule with this name already exists".to_string(),
                ));
            }
        }

        let config = storage.get_config_mut();
        let schedule = config
            .schedules
            .iter_mut()
            .find(|s| s.id == request.id)
            .ok_or_else(|| OrditoError::Scheduler("Schedule not found".to_string()))?;

        if let Some(name) = request.name {
            schedule.name = name;
        }

        if let Some(description) = request.description {
            schedule.description = Some(description);
        }

        if let Some(cron_expression) = request.cron_expression {
            crate::utils::validate_cron_expression(&cron_expression)?;
            schedule.cron_expression = cron_expression.clone();
            schedule.next_execution = Some(self.calculate_next_execution(&cron_expression)?);
        }

        if let Some(command_id) = request.command_id {
            schedule.command_id = Some(command_id);
        }

        if let Some(group_id) = request.group_id {
            schedule.group_id = Some(group_id);
        }

        if let Some(is_enabled) = request.is_enabled {
            schedule.is_enabled = is_enabled;
        }

        if let Some(max_executions) = request.max_executions {
            schedule.max_executions = Some(max_executions);
        }

        schedule.update();

        let updated_schedule = schedule.clone();
        storage.save().await?;

        self.update_schedule_runner(&updated_schedule).await?;

        debug!("Schedule updated: {}", updated_schedule.id);
        Ok(updated_schedule)
    }

    pub async fn delete_schedule(&self, id: Uuid) -> Result<()> {
        info!("Deleting schedule: {}", id);

        let mut storage = self.storage.write().await;
        let config = storage.get_config_mut();

        let initial_len = config.schedules.len();
        config.schedules.retain(|s| s.id != id);

        if config.schedules.len() == initial_len {
            return Err(OrditoError::Scheduler("Schedule not found".to_string()));
        }

        storage.save().await?;

        self.remove_schedule_runner(id).await;

        debug!("Schedule deleted: {}", id);
        Ok(())
    }

    pub async fn toggle_schedule(&self, id: Uuid) -> Result<crate::models::Schedule> {
        info!("Toggling schedule: {}", id);

        let mut storage = self.storage.write().await;
        let config = storage.get_config_mut();

        let schedule = config
            .schedules
            .iter_mut()
            .find(|s| s.id == id)
            .ok_or_else(|| OrditoError::Scheduler("Schedule not found".to_string()))?;

        schedule.is_enabled = !schedule.is_enabled;
        schedule.update();

        let updated_schedule = schedule.clone();
        storage.save().await?;

        self.update_schedule_runner(&updated_schedule).await?;

        debug!(
            "Schedule toggled: {} (enabled: {})",
            id, updated_schedule.is_enabled
        );
        Ok(updated_schedule)
    }

    pub async fn get_next_executions(&self, limit: usize) -> Result<Vec<(Uuid, DateTime<Utc>)>> {
        let running_schedules = self.running_schedules.read().await;
        let mut executions: Vec<_> = running_schedules
            .iter()
            .filter_map(|(id, runner)| {
                if runner.schedule.is_enabled && runner.schedule.should_execute() {
                    runner.schedule.next_execution.map(|next| (*id, next))
                } else {
                    None
                }
            })
            .collect();

        executions.sort_by_key(|(_, next)| *next);
        executions.truncate(limit);

        Ok(executions)
    }

    async fn load_schedules(&self) -> Result<()> {
        let storage = self.storage.read().await;
        let schedules = storage.get_config().schedules.clone();
        drop(storage);

        for schedule in schedules {
            if let Err(e) = self.add_schedule_runner(&schedule).await {
                error!("Failed to load schedule {}: {}", schedule.name, e);
            }
        }

        info!(
            "Loaded {} schedules",
            self.running_schedules.read().await.len()
        );
        Ok(())
    }

    async fn add_schedule_runner(&self, schedule: &crate::models::Schedule) -> Result<()> {
        let cron_schedule = Schedule::from_str(&schedule.cron_expression)
            .map_err(|e| OrditoError::CronExpression(format!("Invalid cron expression: {}", e)))?;

        let runner = ScheduleRunner {
            schedule: schedule.clone(),
            cron_schedule,
            last_check: Utc::now(),
        };

        let mut running_schedules = self.running_schedules.write().await;
        running_schedules.insert(schedule.id, runner);

        debug!("Added schedule runner for: {}", schedule.name);
        Ok(())
    }

    async fn update_schedule_runner(&self, schedule: &crate::models::Schedule) -> Result<()> {
        self.remove_schedule_runner(schedule.id).await;
        self.add_schedule_runner(schedule).await
    }

    async fn remove_schedule_runner(&self, schedule_id: Uuid) {
        let mut running_schedules = self.running_schedules.write().await;
        running_schedules.remove(&schedule_id);
        debug!("Removed schedule runner for: {}", schedule_id);
    }

    async fn run_scheduler_loop(&self) {
        let mut interval = interval(Duration::from_secs(60)); // Check every minute

        loop {
            let is_running = *self.is_running.lock().await;
            if !is_running {
                break;
            }

            interval.tick().await;

            if let Err(e) = self.check_and_execute_schedules().await {
                error!("Error in scheduler loop: {}", e);
            }
        }

        info!("Scheduler loop stopped");
    }

    async fn check_and_execute_schedules(&self) -> Result<()> {
        let now = Utc::now();
        let mut schedules_to_execute = Vec::new();

        {
            let mut running_schedules = self.running_schedules.write().await;

            for (_id, runner) in running_schedules.iter_mut() {
                if !runner.schedule.is_enabled || !runner.schedule.should_execute() {
                    continue;
                }

                let mut upcoming = runner.cron_schedule.upcoming(chrono_tz::UTC).take(1);
                if let Some(next) = upcoming.next() {
                    if next <= now && runner.last_check < next {
                        schedules_to_execute.push(runner.schedule.clone());
                        runner.last_check = now;
                    }
                }
            }
        }

        for schedule in schedules_to_execute {
            if let Err(e) = self.execute_schedule(&schedule).await {
                error!("Failed to execute schedule {}: {}", schedule.name, e);
            }
        }

        Ok(())
    }

    async fn execute_schedule(&self, schedule: &crate::models::Schedule) -> Result<()> {
        info!("Executing schedule: {}", schedule.name);

        let execution_start = Utc::now();
        let mut execution_success = false;
        let mut error_message = String::new();

        let execution_result: Result<()> = if let Some(command_id) = schedule.command_id {
            match self.command_service.execute_command(command_id, true).await {
                Ok(_) => Ok(()),
                Err(e) => Err(e),
            }
        } else if let Some(group_id) = schedule.group_id {
            match self
                .command_service
                .execute_command_group(group_id, true)
                .await
            {
                Ok(_) => Ok(()),
                Err(e) => Err(e),
            }
        } else {
            warn!(
                "Schedule {} has no command or group to execute",
                schedule.name
            );
            return Ok(());
        };

        match execution_result {
            Ok(_) => {
                execution_success = true;
                debug!("Schedule executed successfully: {}", schedule.name);
            }
            Err(e) => {
                error_message = e.to_string();
                error!("Failed to execute schedule {}: {}", schedule.name, e);
            }
        }

        // Update schedule state
        {
            let mut storage = self.storage.write().await;
            let config = storage.get_config_mut();

            if let Some(schedule_mut) = config.schedules.iter_mut().find(|s| s.id == schedule.id) {
                schedule_mut.mark_executed();
                schedule_mut.next_execution =
                    Some(self.calculate_next_execution(&schedule_mut.cron_expression)?);
            }

            storage.save().await?;
        }

        {
            let mut running_schedules = self.running_schedules.write().await;
            if let Some(runner) = running_schedules.get_mut(&schedule.id) {
                runner.schedule.execution_count += 1;
                runner.schedule.last_executed = Some(execution_start);
            }
        }

        // Send notification (check settings first)
        if let Some(notification_service) = &self.notification_service {
            let storage = self.storage.read().await;
            let show_notifications = storage.get_config().settings.show_notifications;
            let schedule_success = storage
                .get_config()
                .settings
                .notification_settings
                .schedule_success;
            let schedule_failure = storage
                .get_config()
                .settings
                .notification_settings
                .schedule_failure;
            drop(storage);

            if show_notifications {
                let execution_time = execution_start.format("%H:%M:%S").to_string();

                if execution_success && schedule_success {
                    if let Err(e) =
                        notification_service.send_schedule_success(&schedule.name, &execution_time)
                    {
                        warn!("Failed to send success notification: {}", e);
                    }
                } else if !execution_success && schedule_failure {
                    if let Err(e) =
                        notification_service.send_schedule_failure(&schedule.name, &error_message)
                    {
                        warn!("Failed to send failure notification: {}", e);
                    }
                }
            }
        }

        if execution_success {
            Ok(())
        } else {
            Err(OrditoError::Scheduler(error_message))
        }
    }

    async fn run_warning_loop(&self) {
        let mut interval = interval(Duration::from_secs(300)); // Check every 5 minutes

        loop {
            let is_running = *self.is_running.lock().await;
            if !is_running {
                break;
            }

            interval.tick().await;

            if let Err(e) = self.check_and_send_warnings().await {
                error!("Error in warning loop: {}", e);
            }
        }

        info!("Warning loop stopped");
    }

    async fn check_and_send_warnings(&self) -> Result<()> {
        let notification_service = match &self.notification_service {
            Some(service) => service,
            None => return Ok(()), // No notification service, skip warnings
        };

        let now = Utc::now();
        let warning_threshold = now + chrono::Duration::minutes(10);

        let running_schedules = self.running_schedules.read().await;

        for (_id, runner) in running_schedules.iter() {
            if !runner.schedule.is_enabled || !runner.schedule.should_execute() {
                continue;
            }

            if let Some(next_execution) = runner.schedule.next_execution {
                // Check if execution is within 10 minutes and we haven't sent a warning recently
                if next_execution <= warning_threshold && next_execution > now {
                    // Check if we've already sent a warning for this execution time
                    // (Simple check: if last execution was more than 1 hour ago, we can send warning)
                    let should_send_warning = runner
                        .schedule
                        .last_executed
                        .map(|last| (now - last).num_hours() >= 1)
                        .unwrap_or(true);

                    if should_send_warning {
                        // Check settings before sending warning
                        let storage = self.storage.read().await;
                        let show_notifications = storage.get_config().settings.show_notifications;
                        let schedule_warnings = storage
                            .get_config()
                            .settings
                            .notification_settings
                            .schedule_warnings;
                        drop(storage);

                        if show_notifications && schedule_warnings {
                            let next_execution_time = next_execution.format("%H:%M:%S").to_string();

                            if let Err(e) = notification_service
                                .send_schedule_warning(&runner.schedule.name, &next_execution_time)
                            {
                                warn!("Failed to send warning notification: {}", e);
                            }
                        }
                    }
                }
            }
        }

        Ok(())
    }

    fn calculate_next_execution(&self, cron_expression: &str) -> Result<DateTime<Utc>> {
        let schedule = Schedule::from_str(cron_expression)
            .map_err(|e| OrditoError::CronExpression(format!("Invalid cron expression: {}", e)))?;

        let mut upcoming = schedule.upcoming(chrono_tz::UTC).take(1);
        upcoming
            .next()
            .map(|dt| dt.with_timezone(&Utc))
            .ok_or_else(|| OrditoError::CronExpression("No next execution time".to_string()))
    }
}

impl Clone for SchedulerService {
    fn clone(&self) -> Self {
        Self {
            storage: self.storage.clone(),
            command_service: self.command_service.clone(),
            notification_service: self.notification_service.clone(),
            running_schedules: self.running_schedules.clone(),
            is_running: self.is_running.clone(),
        }
    }
}
