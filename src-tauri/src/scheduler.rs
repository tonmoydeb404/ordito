use crate::commands;
use crate::models::{CommandGroup, Schedule};
use crate::notification::NotificationManager;
use crate::state::AppState;
use chrono::{DateTime, Utc};
use cron::Schedule as CronSchedule;
use std::collections::HashMap;
use std::str::FromStr;
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

                    // Determine schedule type early to avoid borrow issues later
                    let is_command = schedule.command_id.is_some();
                    let item_type = if is_command { "command" } else { "group" };

                    // Check if this is a group schedule or command schedule
                    if is_command {
                        // Execute specific command
                        let command = {
                            let groups = state.lock().unwrap();
                            get_schedule_command(&schedule, &groups).cloned()
                        };

                        if let Some(cmd) = command {
                            log::info!(
                                "⏰ Executing scheduled command: {} ({})",
                                cmd.label,
                                schedule.cron_expression
                            );

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
                            get_schedule_group(&schedule, &groups).map(|g| g.title.clone())
                        };

                        if let Some(group_title) = group_name {
                            log::info!(
                                "⏰ Executing scheduled group: {} ({})",
                                group_title,
                                schedule.cron_expression
                            );

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

                    // Calculate next execution using cron
                    if let Some(next_time) =
                        Self::calculate_next_execution(&schedule.cron_expression, now)
                    {
                        // Check if max executions reached
                        if let Some(max_runs) = schedule.max_executions {
                            if schedule.execution_count >= max_runs {
                                schedule.is_active = false;
                                schedules_to_update.push((id, schedule));
                                log::info!(
                                    "✅ Scheduled {} completed (max executions reached)",
                                    item_type
                                );
                                continue;
                            }
                        }

                        schedule.next_execution = next_time;
                        schedules_to_update.push((id, schedule));
                    } else {
                        // Invalid cron expression, deactivate schedule
                        log::warn!(
                            "⚠️ Invalid cron expression for schedule {}: {}",
                            id,
                            schedule.cron_expression
                        );
                        schedule.is_active = false;
                        schedules_to_update.push((id, schedule));
                    }
                }

                // Check if we need to save before processing updates
                let need_to_save = !schedules_to_update.is_empty();

                {
                    let mut schedules = schedules.lock().unwrap();
                    for (id, updated_schedule) in schedules_to_update {
                        schedules.insert(id, updated_schedule);
                    }
                }

                // Save updated schedules to disk
                if need_to_save {
                    let state: State<AppState> = app_handle.state();
                    let schedule_state: State<crate::state::ScheduleState> = app_handle.state();
                    let groups = state.lock().unwrap();
                    let mut persistent_schedules = schedule_state.lock().unwrap();

                    // Update persistent storage with current schedules
                    let current_schedules = schedules.lock().unwrap();
                    *persistent_schedules = current_schedules.clone();
                    drop(current_schedules);

                    if let Err(e) =
                        crate::storage::save_data(&app_handle, &groups, &persistent_schedules)
                    {
                        log::error!("Failed to save schedule updates: {}", e);
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
        // Validate cron expression
        Self::validate_cron_expression(&schedule.cron_expression)?;

        let id = Uuid::new_v4().to_string();
        schedule.id = id.clone();

        // Calculate initial next execution
        schedule.next_execution =
            Self::calculate_next_execution(&schedule.cron_expression, Utc::now())
                .ok_or("Failed to calculate next execution time")?;

        let mut schedules = self.schedules.lock().unwrap();
        schedules.insert(id.clone(), schedule);

        log::info!(
            "📅 Added cron schedule: {} ({})",
            id,
            schedules.get(&id).unwrap().cron_expression
        );
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
        // Validate cron expression
        Self::validate_cron_expression(&updated_schedule.cron_expression)?;

        let mut schedules = self.schedules.lock().unwrap();
        if schedules.contains_key(id) {
            updated_schedule.id = id.to_string();

            // Recalculate next execution with new cron expression
            updated_schedule.next_execution =
                Self::calculate_next_execution(&updated_schedule.cron_expression, Utc::now())
                    .ok_or("Failed to calculate next execution time")?;

            schedules.insert(id.to_string(), updated_schedule);
            log::info!(
                "📝 Updated cron schedule: {} ({})",
                id,
                schedules.get(id).unwrap().cron_expression
            );
            Ok(())
        } else {
            Err("Schedule not found".to_string())
        }
    }

    pub fn toggle_schedule(&self, id: &str) -> Result<bool, String> {
        let mut schedules = self.schedules.lock().unwrap();
        if let Some(schedule) = schedules.get_mut(id) {
            schedule.is_active = !schedule.is_active;
            log::info!(
                "🔄 Toggled schedule: {} (active: {})",
                id,
                schedule.is_active
            );
            Ok(schedule.is_active)
        } else {
            Err("Schedule not found".to_string())
        }
    }

    pub fn load_schedules(&self, schedules_data: HashMap<String, Schedule>) {
        let mut schedules = self.schedules.lock().unwrap();
        *schedules = schedules_data;
        log::info!("📥 Loaded {} cron schedules", schedules.len());
    }

    /// Calculate next execution time using cron expression
    fn calculate_next_execution(cron_expr: &str, _from: DateTime<Utc>) -> Option<DateTime<Utc>> {
        let schedule = CronSchedule::from_str(cron_expr).ok()?;
        schedule.upcoming(Utc).next()
    }

    /// Validate cron expression
    fn validate_cron_expression(cron_expr: &str) -> Result<(), String> {
        CronSchedule::from_str(cron_expr)
            .map_err(|e| format!("Invalid cron expression '{}': {}", cron_expr, e))?;
        Ok(())
    }
}

/// Helper function to get the group for a schedule
fn get_schedule_group<'a>(
    schedule: &Schedule,
    groups: &'a HashMap<String, CommandGroup>,
) -> Option<&'a CommandGroup> {
    groups.get(&schedule.group_id)
}

/// Helper function to get specific command for a schedule
fn get_schedule_command<'a>(
    schedule: &Schedule,
    groups: &'a HashMap<String, CommandGroup>,
) -> Option<&'a crate::models::CommandItem> {
    if let Some(command_id) = &schedule.command_id {
        groups
            .get(&schedule.group_id)?
            .commands
            .iter()
            .find(|cmd| cmd.id == *command_id)
    } else {
        None
    }
}
