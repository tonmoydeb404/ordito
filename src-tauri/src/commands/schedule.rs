use crate::error::lock_state;
use crate::models::{CommandGroup, CronValidationResult, Schedule, ScheduleInfo};
use crate::core::scheduler::SchedulerManager;
use crate::state::{AppState, ScheduleState};
use crate::core::storage::save_data;
use chrono::{DateTime, Local};
use cron::Schedule as CronSchedule;
use std::collections::HashMap;
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
    validate_cron_expression(&cron_expression)?;
    validate_group_and_command(&group_state, &group_id, &command_id)?;

    let schedule = Schedule {
        id: String::new(),
        group_id,
        command_id,
        cron_expression,
        is_active: true,
        created_at: Local::now(),
        last_execution: None,
        next_execution: Local::now(),
        execution_count: 0,
        max_executions,
    };

    let schedule_id = scheduler.add_schedule(schedule.clone())?;

    let groups = lock_state(&group_state)?;
    let mut schedules = lock_state(&schedule_state)?;
    schedules.insert(schedule_id.clone(), schedule);
    save_data(&app_handle, &groups, &schedules)?;

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

    let groups = lock_state(&group_state)?;
    let mut schedules = lock_state(&schedule_state)?;
    schedules.remove(&id);
    save_data(&app_handle, &groups, &schedules)?;
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
    validate_cron_expression(&cron_expression)?;
    validate_group_and_command(&group_state, &group_id, &command_id)?;

    let updated_schedule = Schedule {
        id: id.clone(),
        group_id,
        command_id,
        cron_expression,
        is_active: true,
        created_at: Local::now(),
        last_execution: None,
        next_execution: Local::now(),
        execution_count: 0,
        max_executions,
    };

    scheduler.update_schedule(&id, updated_schedule.clone())?;

    let groups = lock_state(&group_state)?;
    let mut schedules = lock_state(&schedule_state)?;
    schedules.insert(id, updated_schedule);
    save_data(&app_handle, &groups, &schedules)?;
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

    let groups = lock_state(&group_state)?;
    let mut schedules = lock_state(&schedule_state)?;
    if let Some(schedule) = schedules.get_mut(&id) {
        schedule.is_active = is_active;
        save_data(&app_handle, &groups, &schedules)?;
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
    let schedule = schedules.iter().find(|s| s.id == id).ok_or("Schedule not found")?;
    let groups = lock_state(&group_state)?;
    Ok(build_schedule_info(schedule, &groups))
}

#[tauri::command]
pub async fn get_schedules_with_info(
    scheduler: State<'_, SchedulerManager>,
    group_state: State<'_, AppState>,
) -> Result<Vec<ScheduleInfo>, String> {
    let schedules = scheduler.get_schedules();
    let groups = lock_state(&group_state)?;
    Ok(schedules.iter().map(|s| build_schedule_info(s, &groups)).collect())
}

#[tauri::command]
pub async fn validate_cron_expression_command(
    cron_expression: String,
) -> Result<CronValidationResult, String> {
    match validate_cron_expression(&cron_expression) {
        Ok(_) => Ok(CronValidationResult {
            is_valid: true,
            error_message: None,
            next_executions: get_next_executions(&cron_expression, 5),
        }),
        Err(error) => Ok(CronValidationResult {
            is_valid: false,
            error_message: Some(error),
            next_executions: vec![],
        }),
    }
}

// --- Helpers ---

fn validate_cron_expression(cron_expr: &str) -> Result<(), String> {
    CronSchedule::from_str(cron_expr)
        .map_err(|e| format!("Invalid cron expression '{}': {}", cron_expr, e))?;
    Ok(())
}

fn validate_group_and_command(
    group_state: &State<'_, AppState>,
    group_id: &str,
    command_id: &Option<String>,
) -> Result<(), String> {
    let groups = lock_state(group_state)?;
    let group = groups
        .get(group_id)
        .ok_or_else(|| format!("Group '{}' not found", group_id))?;

    if let Some(cmd_id) = command_id {
        group
            .commands
            .iter()
            .find(|cmd| cmd.id == *cmd_id)
            .ok_or_else(|| format!("Command '{}' not found in group '{}'", cmd_id, group.title))?;
    }

    Ok(())
}

fn get_next_executions(cron_expr: &str, count: usize) -> Vec<DateTime<Local>> {
    CronSchedule::from_str(cron_expr)
        .map(|s| s.upcoming(Local).take(count).collect())
        .unwrap_or_default()
}

fn build_schedule_info(
    schedule: &Schedule,
    groups: &HashMap<String, CommandGroup>,
) -> ScheduleInfo {
    let display_name = get_schedule_display_name(schedule, groups);
    let schedule_type = if schedule.command_id.is_none() { "group" } else { "command" };

    ScheduleInfo {
        id: schedule.id.clone(),
        display_name,
        schedule_type: schedule_type.to_string(),
        group_id: schedule.group_id.clone(),
        command_id: schedule.command_id.clone(),
        cron_expression: schedule.cron_expression.clone(),
        is_active: schedule.is_active,
        next_execution: schedule.next_execution,
        last_execution: schedule.last_execution,
        execution_count: schedule.execution_count,
        max_executions: schedule.max_executions,
    }
}

fn get_schedule_display_name(
    schedule: &Schedule,
    groups: &HashMap<String, CommandGroup>,
) -> String {
    let Some(group) = groups.get(&schedule.group_id) else {
        return format!("[Unknown Group] ({})", schedule.cron_expression);
    };

    if schedule.command_id.is_none() {
        return format!("Group: {} ({})", group.title, schedule.cron_expression);
    }

    if let Some(cmd_id) = &schedule.command_id {
        if let Some(cmd) = group.commands.iter().find(|c| c.id == *cmd_id) {
            return format!("{} → {} ({})", group.title, cmd.label, schedule.cron_expression);
        }
    }

    format!("{} → [Unknown Command] ({})", group.title, schedule.cron_expression)
}
