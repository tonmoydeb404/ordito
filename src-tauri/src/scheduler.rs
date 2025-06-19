use crate::commands;
use crate::models::{CommandGroup, RecurrencePattern, Schedule};
use crate::notification::NotificationManager;
use crate::state::AppState;
use chrono::{DateTime, Datelike, Duration, Utc};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, State};
use tokio::time::{sleep, Duration as TokioDuration};
use uuid::Uuid;

#[derive(Clone)]
pub struct SchedulerManager {
    schedules: Arc<Mutex<HashMap<String, Schedule>>>,
    app_handle: AppHandle,
    is_running: Arc<Mutex<bool>>,
}

impl SchedulerManager {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            schedules: Arc::new(Mutex::new(HashMap::new())),
            app_handle,
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    pub async fn start(&self) -> Result<(), String> {
        let mut is_running = self.is_running.lock().unwrap();
        if *is_running {
            return Err("Scheduler is already running".to_string());
        }
        *is_running = true;
        drop(is_running);

        let schedules = Arc::clone(&self.schedules);
        let app_handle = self.app_handle.clone();
        let is_running_flag = Arc::clone(&self.is_running);

        tokio::spawn(async move {
            log::info!("📅 Scheduler started");

            while *is_running_flag.lock().unwrap() {
                let now = Utc::now();
                let mut schedules_to_execute = Vec::new();
                let mut schedules_to_update = Vec::new();

                {
                    let schedules = schedules.lock().unwrap();
                    for (id, schedule) in schedules.iter() {
                        if schedule.next_execution <= now && schedule.is_active {
                            schedules_to_execute.push((id.clone(), schedule.clone()));
                        }
                    }
                }

                for (id, mut schedule) in schedules_to_execute {
                    let state: State<AppState> = app_handle.state();

                    // Check if this is a group schedule (no specific command_id) or command schedule
                    if schedule.is_command_schedule() {
                        // Execute specific command
                        let command = {
                            let groups = state.lock().unwrap();
                            schedule.get_command(&groups).cloned()
                        };

                        if let Some(cmd) = command {
                            log::info!("⏰ Executing scheduled command: {}", cmd.label);

                            let result = if cmd.is_detached.unwrap_or(false) {
                                commands::execute::execute_command_detached(cmd.cmd).await
                            } else {
                                commands::execute::execute_command(cmd.cmd).await
                            };

                            match result {
                                Ok(_) => {
                                    NotificationManager::show_success(
                                        &app_handle,
                                        "Scheduled Command",
                                        &format!("'{}' executed successfully", cmd.label),
                                    );
                                    schedule.last_execution = Some(now);
                                    schedule.execution_count += 1;
                                }
                                Err(e) => {
                                    NotificationManager::show_error(
                                        &app_handle,
                                        "Scheduled Command Failed",
                                        &format!("'{}': {}", cmd.label, e),
                                    );
                                }
                            }
                        } else {
                            log::warn!("⚠️ Command not found for schedule: {}", id);
                        }
                    } else {
                        // Execute entire group
                        let group_name = {
                            let groups = state.lock().unwrap();
                            schedule.get_group(&groups).map(|g| g.title.clone())
                        };

                        if let Some(group_title) = group_name {
                            log::info!("⏰ Executing scheduled group: {}", group_title);

                            let result = commands::execute::execute_group_commands(
                                state,
                                schedule.group_id.clone(),
                            )
                            .await;

                            match result {
                                Ok(results) => {
                                    // Count successes and failures
                                    let (success_count, error_count) =
                                        results.iter().fold((0, 0), |(s, e), (_, output)| {
                                            if output.starts_with("Error:") {
                                                (s, e + 1)
                                            } else {
                                                (s + 1, e)
                                            }
                                        });

                                    if error_count == 0 {
                                        NotificationManager::show_success(
                                            &app_handle,
                                            "Scheduled Group",
                                            &format!(
                                                "Group '{}' executed successfully ({} commands)",
                                                group_title, success_count
                                            ),
                                        );
                                    } else {
                                        NotificationManager::show_warning(
                                            &app_handle,
                                            "Scheduled Group Partial Success",
                                            &format!(
                                                "Group '{}': {} succeeded, {} failed",
                                                group_title, success_count, error_count
                                            ),
                                        );
                                    }

                                    schedule.last_execution = Some(now);
                                    schedule.execution_count += 1;
                                }
                                Err(e) => {
                                    NotificationManager::show_error(
                                        &app_handle,
                                        "Scheduled Group Failed",
                                        &format!("Group '{}': {}", group_title, e),
                                    );
                                }
                            }
                        } else {
                            log::warn!("⚠️ Group not found for schedule: {}", id);
                        }
                    }

                    // Determine item type before moving schedule
                    let item_name = if schedule.is_command_schedule() {
                        "command"
                    } else {
                        "group"
                    };

                    // Calculate next execution time (same logic for both command and group schedules)
                    if let Some(next_time) = Self::calculate_next_execution(&schedule) {
                        schedule.next_execution = next_time;
                        schedules_to_update.push((id, schedule));
                    } else {
                        schedule.is_active = false;
                        schedules_to_update.push((id, schedule));
                        log::info!("✅ Scheduled {} completed", item_name);
                    }
                }

                {
                    let mut schedules = schedules.lock().unwrap();
                    for (id, updated_schedule) in schedules_to_update {
                        schedules.insert(id, updated_schedule);
                    }
                }

                sleep(TokioDuration::from_secs(60)).await;
            }

            log::info!("📅 Scheduler stopped");
        });

        Ok(())
    }

    pub fn stop(&self) {
        let mut is_running = self.is_running.lock().unwrap();
        *is_running = false;
        log::info!("🛑 Scheduler stop requested");
    }

    pub fn add_schedule(&self, mut schedule: Schedule) -> Result<String, String> {
        let id = Uuid::new_v4().to_string();
        schedule.id = id.clone();

        schedule.next_execution =
            Self::calculate_next_execution(&schedule).ok_or("Invalid schedule configuration")?;

        let mut schedules = self.schedules.lock().unwrap();
        schedules.insert(id.clone(), schedule);

        log::info!("📅 Added schedule: {}", id);
        Ok(id)
    }

    pub fn remove_schedule(&self, id: &str) -> Result<(), String> {
        let mut schedules = self.schedules.lock().unwrap();
        schedules.remove(id).ok_or("Schedule not found")?;

        log::info!("🗑️ Removed schedule: {}", id);
        Ok(())
    }

    pub fn get_schedules(&self) -> Vec<Schedule> {
        let schedules = self.schedules.lock().unwrap();
        schedules.values().cloned().collect()
    }

    pub fn update_schedule(&self, id: &str, mut updated_schedule: Schedule) -> Result<(), String> {
        let mut schedules = self.schedules.lock().unwrap();
        if schedules.contains_key(id) {
            updated_schedule.id = id.to_string();
            updated_schedule.next_execution = Self::calculate_next_execution(&updated_schedule)
                .ok_or("Invalid schedule configuration")?;
            schedules.insert(id.to_string(), updated_schedule);
            log::info!("📝 Updated schedule: {}", id);
            Ok(())
        } else {
            Err("Schedule not found".to_string())
        }
    }

    pub fn toggle_schedule(&self, id: &str) -> Result<bool, String> {
        let mut schedules = self.schedules.lock().unwrap();
        if let Some(schedule) = schedules.get_mut(id) {
            schedule.is_active = !schedule.is_active;
            log::info!("🔄 Toggled schedule: {}", schedule.is_active);
            Ok(schedule.is_active)
        } else {
            Err("Schedule not found".to_string())
        }
    }

    pub fn load_schedules(&self, schedules_data: HashMap<String, Schedule>) {
        let mut schedules = self.schedules.lock().unwrap();
        *schedules = schedules_data;
        log::info!("📥 Loaded {} schedules", schedules.len());
    }

    fn calculate_next_execution(schedule: &Schedule) -> Option<DateTime<Utc>> {
        let now = Utc::now();

        if let Some(max_runs) = schedule.max_executions {
            if schedule.execution_count >= max_runs {
                return None;
            }
        }

        match &schedule.recurrence {
            RecurrencePattern::Once => {
                if schedule.execution_count == 0 && schedule.scheduled_time > now {
                    Some(schedule.scheduled_time)
                } else {
                    None
                }
            }
            RecurrencePattern::Daily => Some(Self::next_daily_execution(schedule, now)),
            RecurrencePattern::Weekly => Some(Self::next_weekly_execution(schedule, now)),
            RecurrencePattern::Monthly => Some(Self::next_monthly_execution(schedule, now)),
            RecurrencePattern::Custom { interval_minutes } => {
                Some(now + Duration::minutes(*interval_minutes as i64))
            }
        }
    }

    fn next_daily_execution(schedule: &Schedule, now: DateTime<Utc>) -> DateTime<Utc> {
        let scheduled_time = schedule.scheduled_time;
        let today_at_scheduled_time = now.date_naive().and_time(scheduled_time.time()).and_utc();

        if today_at_scheduled_time > now {
            today_at_scheduled_time
        } else {
            today_at_scheduled_time + Duration::days(1)
        }
    }

    fn next_weekly_execution(schedule: &Schedule, now: DateTime<Utc>) -> DateTime<Utc> {
        let scheduled_time = schedule.scheduled_time;
        let current_weekday = now.weekday();
        let target_weekday = scheduled_time.weekday();

        let days_until_target =
            if target_weekday.number_from_monday() >= current_weekday.number_from_monday() {
                target_weekday.number_from_monday() - current_weekday.number_from_monday()
            } else {
                7 - (current_weekday.number_from_monday() - target_weekday.number_from_monday())
            };

        let target_date = now.date_naive() + Duration::days(days_until_target as i64);
        let target_time = target_date.and_time(scheduled_time.time()).and_utc();

        if target_time > now {
            target_time
        } else {
            target_time + Duration::weeks(1)
        }
    }

    fn next_monthly_execution(schedule: &Schedule, now: DateTime<Utc>) -> DateTime<Utc> {
        let scheduled_time = schedule.scheduled_time;
        let current_month = now.month();
        let current_year = now.year();

        if let Some(this_month) =
            chrono::NaiveDate::from_ymd_opt(current_year, current_month, scheduled_time.day())
        {
            let this_month_time = this_month.and_time(scheduled_time.time()).and_utc();
            if this_month_time > now {
                return this_month_time;
            }
        }

        let (next_month, next_year) = if current_month == 12 {
            (1, current_year + 1)
        } else {
            (current_month + 1, current_year)
        };

        if let Some(next_month_date) =
            chrono::NaiveDate::from_ymd_opt(next_year, next_month, scheduled_time.day())
        {
            next_month_date.and_time(scheduled_time.time()).and_utc()
        } else {
            let last_day_of_month = chrono::NaiveDate::from_ymd_opt(next_year, next_month + 1, 1)
                .unwrap_or(chrono::NaiveDate::from_ymd_opt(next_year + 1, 1, 1).unwrap())
                - Duration::days(1);
            last_day_of_month.and_time(scheduled_time.time()).and_utc()
        }
    }
}

impl Schedule {
    /// Get specific command if this is a command schedule
    pub fn get_command<'a>(
        &self,
        groups: &'a HashMap<String, CommandGroup>,
    ) -> Option<&'a crate::models::CommandItem> {
        // Only return command if command_id is specified
        if let Some(command_id) = &self.command_id {
            groups
                .get(&self.group_id)?
                .commands
                .iter()
                .find(|cmd| cmd.id == *command_id)
        } else {
            None
        }
    }

    /// Get the group this schedule belongs to
    #[allow(dead_code)]
    pub fn get_group<'a>(
        &self,
        groups: &'a HashMap<String, CommandGroup>,
    ) -> Option<&'a CommandGroup> {
        groups.get(&self.group_id)
    }

    /// Check if this is a group schedule (executes all commands in group)
    #[allow(dead_code)]
    pub fn is_group_schedule(&self) -> bool {
        self.command_id.is_none()
    }

    /// Check if this is a command schedule (executes specific command)
    #[allow(dead_code)]
    pub fn is_command_schedule(&self) -> bool {
        self.command_id.is_some()
    }

    /// Get display name for this schedule
    #[allow(dead_code)]
    pub fn get_display_name(&self, groups: &HashMap<String, CommandGroup>) -> String {
        if let Some(group) = self.get_group(groups) {
            if self.is_group_schedule() {
                format!("Group: {}", group.title)
            } else if let Some(command) = self.get_command(groups) {
                format!("{} → {}", group.title, command.label)
            } else {
                format!("{} → [Unknown Command]", group.title)
            }
        } else {
            "[Unknown Group]".to_string()
        }
    }
}
