use crate::commands;
use crate::error::lock_state;
use crate::models::Schedule;
use crate::state::{AppState, ScheduleState};
use crate::system::notification::NotificationManager;
use chrono::{DateTime, Local};
use cron::Schedule as CronSchedule;

use std::collections::HashMap;
use std::str::FromStr;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, State};
use tokio::time::{sleep, Duration as TokioDuration};
use uuid::Uuid;

#[derive(Clone)]
pub struct SchedulerManager {
    schedules: ScheduleState,
    app_handle: AppHandle,
    is_running: Arc<Mutex<bool>>,
}

impl SchedulerManager {
    pub fn new(app_handle: AppHandle, schedules: ScheduleState) -> Self {
        Self {
            schedules,
            app_handle,
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    pub async fn start(&self) -> Result<(), String> {
        {
            let mut is_running = lock_state(&self.is_running)?;
            if *is_running {
                return Err("Scheduler is already running".to_string());
            }
            *is_running = true;
        }

        let schedules = Arc::clone(&self.schedules);
        let app_handle = self.app_handle.clone();
        let is_running_flag = Arc::clone(&self.is_running);

        tokio::spawn(async move {
            log::info!("Scheduler started");

            while lock_state(&is_running_flag).map(|g| *g).unwrap_or(false) {
                let now = Local::now();
                let due_schedules = Self::collect_due_schedules(&schedules, now);

                if !due_schedules.is_empty() {
                    let updates =
                        Self::execute_due_schedules(&app_handle, due_schedules, now).await;
                    Self::apply_schedule_updates(&schedules, &app_handle, updates);
                }

                sleep(TokioDuration::from_secs(60)).await;
            }

            log::info!("Scheduler stopped");
        });

        Ok(())
    }

    pub fn stop(&self) {
        if let Ok(mut is_running) = self.is_running.lock() {
            *is_running = false;
        }
        log::info!("Scheduler stop requested");
    }

    pub fn add_schedule(&self, mut schedule: Schedule) -> Result<String, String> {
        Self::validate_cron_expression(&schedule.cron_expression)?;

        let id = Uuid::new_v4().to_string();
        schedule.id = id.clone();
        schedule.next_execution =
            Self::calculate_next_execution(&schedule.cron_expression, Local::now())
                .ok_or("Failed to calculate next execution time")?;

        let mut schedules = lock_state(&self.schedules)?;
        log::info!("Added cron schedule: {} ({})", id, schedule.cron_expression);
        schedules.insert(id.clone(), schedule);
        Ok(id)
    }

    pub fn remove_schedule(&self, id: &str) -> Result<(), String> {
        let mut schedules = lock_state(&self.schedules)?;
        schedules.remove(id).ok_or("Schedule not found")?;
        log::info!("Removed schedule: {}", id);
        Ok(())
    }

    pub fn get_schedules(&self) -> Vec<Schedule> {
        lock_state(&self.schedules)
            .map(|s| s.values().cloned().collect())
            .unwrap_or_default()
    }

    pub fn update_schedule(&self, id: &str, mut updated_schedule: Schedule) -> Result<(), String> {
        Self::validate_cron_expression(&updated_schedule.cron_expression)?;

        let mut schedules = lock_state(&self.schedules)?;
        if !schedules.contains_key(id) {
            return Err("Schedule not found".to_string());
        }

        updated_schedule.id = id.to_string();
        updated_schedule.next_execution =
            Self::calculate_next_execution(&updated_schedule.cron_expression, Local::now())
                .ok_or("Failed to calculate next execution time")?;

        log::info!("Updated cron schedule: {} ({})", id, updated_schedule.cron_expression);
        schedules.insert(id.to_string(), updated_schedule);
        Ok(())
    }

    pub fn toggle_schedule(&self, id: &str) -> Result<bool, String> {
        let mut schedules = lock_state(&self.schedules)?;
        let schedule = schedules.get_mut(id).ok_or("Schedule not found")?;
        schedule.is_active = !schedule.is_active;
        log::info!("Toggled schedule: {} (active: {})", id, schedule.is_active);
        Ok(schedule.is_active)
    }



    // --- Private helpers ---

    fn collect_due_schedules(
        schedules: &ScheduleState,
        now: DateTime<Local>,
    ) -> Vec<(String, Schedule)> {
        lock_state(schedules)
            .map(|s| {
                s.iter()
                    .filter(|(_, schedule)| schedule.is_active && schedule.next_execution <= now)
                    .map(|(id, schedule)| (id.clone(), schedule.clone()))
                    .collect()
            })
            .unwrap_or_default()
    }

    async fn execute_due_schedules(
        app_handle: &AppHandle,
        due_schedules: Vec<(String, Schedule)>,
        now: DateTime<Local>,
    ) -> Vec<(String, Schedule)> {
        let mut updates = Vec::new();

        for (id, mut schedule) in due_schedules {
            let is_command = schedule.command_id.is_some();

            if is_command {
                Self::execute_scheduled_command(app_handle, &mut schedule, now).await;
            } else {
                Self::execute_scheduled_group(app_handle, &mut schedule, now).await;
            }

            Self::advance_schedule(&mut schedule, now);
            updates.push((id, schedule));
        }

        updates
    }

    async fn execute_scheduled_command(
        app_handle: &AppHandle,
        schedule: &mut Schedule,
        now: DateTime<Local>,
    ) {
        let state: State<AppState> = app_handle.state();
        let command = {
            match lock_state(&state) {
                Ok(groups) => get_schedule_command(schedule, &groups).cloned(),
                Err(_) => None,
            }
        };

        if let Some(cmd) = command {
            log::info!("Executing scheduled command: {} ({})", cmd.label, schedule.cron_expression);

            let result = if cmd.is_detached.unwrap_or(false) {
                commands::execute::execute_command_detached(cmd.cmd).await
            } else {
                commands::execute::execute_command(cmd.cmd).await
            };

            match result {
                Ok(_) => {
                    NotificationManager::show(
                        app_handle,
                        "Scheduled Command",
                        &format!("'{}' executed successfully", cmd.label),
                    );
                    schedule.last_execution = Some(now);
                    schedule.execution_count += 1;
                }
                Err(e) => {
                    NotificationManager::show(
                        app_handle,
                        "Scheduled Command Failed",
                        &format!("'{}': {}", cmd.label, e),
                    );
                }
            }
        }
    }

    async fn execute_scheduled_group(
        app_handle: &AppHandle,
        schedule: &mut Schedule,
        now: DateTime<Local>,
    ) {
        let state: State<AppState> = app_handle.state();
        let group_name = {
            match lock_state(&state) {
                Ok(groups) => groups.get(&schedule.group_id).map(|g| g.title.clone()),
                Err(_) => None,
            }
        };

        let Some(group_title) = group_name else { return };

        log::info!("Executing scheduled group: {} ({})", group_title, schedule.cron_expression);

        match commands::execute::execute_group_commands(state, schedule.group_id.clone()).await {
            Ok(results) => {
                let (success_count, error_count) =
                    results.iter().fold((0, 0), |(s, e), (_, output)| {
                        if output.starts_with("Error:") { (s, e + 1) } else { (s + 1, e) }
                    });

                let msg = if error_count == 0 {
                    format!("Group '{}' executed ({} commands)", group_title, success_count)
                } else {
                    format!("Group '{}': {} ok, {} failed", group_title, success_count, error_count)
                };

                NotificationManager::show(app_handle, "Scheduled Group", &msg);
                schedule.last_execution = Some(now);
                schedule.execution_count += 1;
            }
            Err(e) => {
                NotificationManager::show(
                    app_handle,
                    "Scheduled Group Failed",
                    &format!("Group '{}': {}", group_title, e),
                );
            }
        }
    }

    fn advance_schedule(schedule: &mut Schedule, now: DateTime<Local>) {
        if let Some(max_runs) = schedule.max_executions {
            if schedule.execution_count >= max_runs {
                schedule.is_active = false;
                return;
            }
        }

        match Self::calculate_next_execution(&schedule.cron_expression, now) {
            Some(next) => schedule.next_execution = next,
            None => {
                log::warn!("Invalid cron for schedule {}, deactivating", schedule.id);
                schedule.is_active = false;
            }
        }
    }

    fn apply_schedule_updates(
        schedules: &ScheduleState,
        app_handle: &AppHandle,
        updates: Vec<(String, Schedule)>,
    ) {
        if updates.is_empty() {
            return;
        }

        if let Ok(mut locked) = schedules.lock() {
            for (id, schedule) in updates {
                locked.insert(id, schedule);
            }

            let state: State<AppState> = app_handle.state();
            let groups = match state.lock() {
                Ok(g) => g.clone(),
                Err(_) => return,
            };
            drop(state);

            if let Err(e) = crate::core::storage::save_data(app_handle, &groups, &locked) {
                log::error!("Failed to save schedule updates: {}", e);
            }
        }
    }

    fn calculate_next_execution(
        cron_expr: &str,
        _from: DateTime<Local>,
    ) -> Option<DateTime<Local>> {
        CronSchedule::from_str(cron_expr).ok()?.upcoming(Local).next()
    }

    fn validate_cron_expression(cron_expr: &str) -> Result<(), String> {
        CronSchedule::from_str(cron_expr)
            .map_err(|e| format!("Invalid cron expression '{}': {}", cron_expr, e))?;
        Ok(())
    }
}

fn get_schedule_command<'a>(
    schedule: &Schedule,
    groups: &'a HashMap<String, crate::models::CommandGroup>,
) -> Option<&'a crate::models::CommandItem> {
    let command_id = schedule.command_id.as_ref()?;
    groups
        .get(&schedule.group_id)?
        .commands
        .iter()
        .find(|cmd| cmd.id == *command_id)
}
