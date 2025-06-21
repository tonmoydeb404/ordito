use crate::models::Schedule;
use crate::scheduler::SchedulerManager;
use crate::state::{AppState, ScheduleState};
use crate::storage::save_data;
use chrono::{DateTime, Local};
use cron::Schedule as CronSchedule;
use std::str::FromStr;
use tauri::State;

#[tauri::command]
pub async fn create_schedule(
    scheduler: State<'_, SchedulerManager>,
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    group_id: String,
    command_id: Option<String>,
    cron_expression: String,
    max_executions: Option<u32>,
) -> Result<String, String> {
    // Validate cron expression first
    validate_cron_expression(&cron_expression)?;

    // Validate that group exists and command exists if specified
    {
        let groups = group_state.lock().unwrap();
        let group = groups
            .get(&group_id)
            .ok_or_else(|| format!("Group with ID '{}' not found", group_id))?;

        if let Some(cmd_id) = &command_id {
            group
                .commands
                .iter()
                .find(|cmd| cmd.id == *cmd_id)
                .ok_or_else(|| {
                    format!(
                        "Command with ID '{}' not found in group '{}'",
                        cmd_id, group.title
                    )
                })?;

            log::info!(
                "Creating command schedule for '{}' in group '{}' with cron: {}",
                group
                    .commands
                    .iter()
                    .find(|cmd| cmd.id == *cmd_id)
                    .unwrap()
                    .label,
                group.title,
                cron_expression
            );
        } else {
            log::info!(
                "Creating group schedule for entire group '{}' with cron: {}",
                group.title,
                cron_expression
            );
        }
    }

    let schedule = Schedule {
        id: String::new(), // Will be set by SchedulerManager
        group_id,
        command_id,
        cron_expression,
        is_active: true,
        created_at: Local::now(),
        last_execution: None,
        next_execution: Local::now(), // Will be calculated by SchedulerManager
        execution_count: 0,
        max_executions,
    };

    let schedule_id = scheduler.add_schedule(schedule.clone())?;

    // Save to persistent storage
    {
        let groups = group_state.lock().unwrap();
        let mut schedules = schedule_state.lock().unwrap();
        schedules.insert(schedule_id.clone(), schedule);
        save_data(&app_handle, &groups, &schedules)?;
    }

    Ok(schedule_id)
}

#[tauri::command]
pub async fn get_schedules(
    scheduler: State<'_, SchedulerManager>,
) -> Result<Vec<Schedule>, String> {
    Ok(scheduler.get_schedules())
}

#[tauri::command]
pub async fn delete_schedule(
    scheduler: State<'_, SchedulerManager>,
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    id: String,
) -> Result<(), String> {
    scheduler.remove_schedule(&id)?;

    // Remove from persistent storage
    {
        let groups = group_state.lock().unwrap();
        let mut schedules = schedule_state.lock().unwrap();
        schedules.remove(&id);
        save_data(&app_handle, &groups, &schedules)?;
    }

    Ok(())
}

#[tauri::command]
pub async fn update_schedule(
    scheduler: State<'_, SchedulerManager>,
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    id: String,
    group_id: String,
    command_id: Option<String>,
    cron_expression: String,
    max_executions: Option<u32>,
) -> Result<(), String> {
    // Validate cron expression first
    validate_cron_expression(&cron_expression)?;

    // Validate that group exists and command exists if specified
    {
        let groups = group_state.lock().unwrap();
        let group = groups
            .get(&group_id)
            .ok_or_else(|| format!("Group with ID '{}' not found", group_id))?;

        if let Some(cmd_id) = &command_id {
            group
                .commands
                .iter()
                .find(|cmd| cmd.id == *cmd_id)
                .ok_or_else(|| {
                    format!(
                        "Command with ID '{}' not found in group '{}'",
                        cmd_id, group.title
                    )
                })?;

            log::info!(
                "Updating command schedule for '{}' in group '{}' with cron: {}",
                group
                    .commands
                    .iter()
                    .find(|cmd| cmd.id == *cmd_id)
                    .unwrap()
                    .label,
                group.title,
                cron_expression
            );
        } else {
            log::info!(
                "Updating group schedule for entire group '{}' with cron: {}",
                group.title,
                cron_expression
            );
        }
    }

    let updated_schedule = Schedule {
        id: id.clone(),
        group_id,
        command_id,
        cron_expression,
        is_active: true,
        created_at: Local::now(),
        last_execution: None,
        next_execution: Local::now(), // Will be recalculated by SchedulerManager
        execution_count: 0,
        max_executions,
    };

    scheduler.update_schedule(&id, updated_schedule.clone())?;

    // Update persistent storage
    {
        let groups = group_state.lock().unwrap();
        let mut schedules = schedule_state.lock().unwrap();
        schedules.insert(id, updated_schedule);
        save_data(&app_handle, &groups, &schedules)?;
    }

    Ok(())
}

#[tauri::command]
pub async fn toggle_schedule(
    scheduler: State<'_, SchedulerManager>,
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    id: String,
) -> Result<bool, String> {
    let is_active = scheduler.toggle_schedule(&id)?;

    // Update persistent storage
    {
        let groups = group_state.lock().unwrap();
        let mut schedules = schedule_state.lock().unwrap();
        if let Some(schedule) = schedules.get_mut(&id) {
            schedule.is_active = is_active;
            save_data(&app_handle, &groups, &schedules)?;
        }
    }

    Ok(is_active)
}

#[tauri::command]
pub async fn get_schedule_info(
    scheduler: State<'_, SchedulerManager>,
    group_state: State<'_, AppState>,
    id: String,
) -> Result<ScheduleInfo, String> {
    let schedules = scheduler.get_schedules();
    let schedule = schedules
        .iter()
        .find(|s| s.id == id)
        .ok_or("Schedule not found")?;

    let groups = group_state.lock().unwrap();
    let display_name = get_schedule_display_name(schedule, &groups);
    let schedule_type = if is_group_schedule(schedule) {
        "group".to_string()
    } else {
        "command".to_string()
    };

    Ok(ScheduleInfo {
        id: schedule.id.clone(),
        display_name,
        schedule_type,
        group_id: schedule.group_id.clone(),
        command_id: schedule.command_id.clone(),
        cron_expression: schedule.cron_expression.clone(),
        is_active: schedule.is_active,
        next_execution: schedule.next_execution,
        last_execution: schedule.last_execution,
        execution_count: schedule.execution_count,
        max_executions: schedule.max_executions,
    })
}

#[tauri::command]
pub async fn get_schedules_with_info(
    scheduler: State<'_, SchedulerManager>,
    group_state: State<'_, AppState>,
) -> Result<Vec<ScheduleInfo>, String> {
    let schedules = scheduler.get_schedules();
    let groups = group_state.lock().unwrap();

    let schedule_infos: Vec<ScheduleInfo> = schedules
        .iter()
        .map(|schedule| {
            let display_name = get_schedule_display_name(schedule, &groups);
            let schedule_type = if is_group_schedule(schedule) {
                "group".to_string()
            } else {
                "command".to_string()
            };

            ScheduleInfo {
                id: schedule.id.clone(),
                display_name,
                schedule_type,
                group_id: schedule.group_id.clone(),
                command_id: schedule.command_id.clone(),
                cron_expression: schedule.cron_expression.clone(),
                is_active: schedule.is_active,
                next_execution: schedule.next_execution,
                last_execution: schedule.last_execution,
                execution_count: schedule.execution_count,
                max_executions: schedule.max_executions,
            }
        })
        .collect();

    Ok(schedule_infos)
}

#[tauri::command]
pub async fn validate_cron_expression_command(
    cron_expression: String,
) -> Result<CronValidationResult, String> {
    match validate_cron_expression(&cron_expression) {
        Ok(_) => {
            // Calculate next few execution times for preview
            let next_executions = get_next_executions(&cron_expression, 5);
            Ok(CronValidationResult {
                is_valid: true,
                error_message: None,
                next_executions,
            })
        }
        Err(error) => Ok(CronValidationResult {
            is_valid: false,
            error_message: Some(error),
            next_executions: vec![],
        }),
    }
}

/// Check if schedule is for a group (executes all commands in group)
fn is_group_schedule(schedule: &Schedule) -> bool {
    schedule.command_id.is_none()
}

/// Get display name for schedule (helper function)
fn get_schedule_display_name(
    schedule: &Schedule,
    groups: &std::collections::HashMap<String, crate::models::CommandGroup>,
) -> String {
    if let Some(group) = groups.get(&schedule.group_id) {
        if is_group_schedule(schedule) {
            format!("Group: {} ({})", group.title, schedule.cron_expression)
        } else if let Some(command_id) = &schedule.command_id {
            if let Some(command) = group.commands.iter().find(|cmd| cmd.id == *command_id) {
                format!(
                    "{} → {} ({})",
                    group.title, command.label, schedule.cron_expression
                )
            } else {
                format!(
                    "{} → [Unknown Command] ({})",
                    group.title, schedule.cron_expression
                )
            }
        } else {
            format!(
                "{} → [Unknown Command] ({})",
                group.title, schedule.cron_expression
            )
        }
    } else {
        format!("[Unknown Group] ({})", schedule.cron_expression)
    }
}

/// Validate cron expression
fn validate_cron_expression(cron_expr: &str) -> Result<(), String> {
    CronSchedule::from_str(cron_expr)
        .map_err(|e| format!("Invalid cron expression '{}': {}", cron_expr, e))?;
    Ok(())
}

/// Get next N execution times for cron expression (for preview)
fn get_next_executions(cron_expr: &str, count: usize) -> Vec<DateTime<Local>> {
    if let Ok(schedule) = CronSchedule::from_str(cron_expr) {
        schedule.upcoming(Local).take(count).collect()
    } else {
        vec![]
    }
}

// Helper struct for frontend to get enriched schedule information
#[derive(serde::Serialize)]
pub struct ScheduleInfo {
    pub id: String,
    pub display_name: String,
    pub schedule_type: String, // "group" or "command"
    pub group_id: String,
    pub command_id: Option<String>,
    pub cron_expression: String,
    pub is_active: bool,
    pub next_execution: DateTime<Local>,
    pub last_execution: Option<DateTime<Local>>,
    pub execution_count: u32,
    pub max_executions: Option<u32>,
}

// Helper struct for cron validation
#[derive(serde::Serialize)]
pub struct CronValidationResult {
    pub is_valid: bool,
    pub error_message: Option<String>,
    pub next_executions: Vec<DateTime<Local>>, // Preview of next execution times
}
