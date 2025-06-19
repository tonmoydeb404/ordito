use crate::models::{RecurrencePattern, Schedule};
use crate::scheduler::SchedulerManager;
use crate::state::{AppState, ScheduleState};
use crate::storage::save_data;
use chrono::{DateTime, Utc};
use tauri::State;

#[tauri::command]
pub async fn create_schedule(
    scheduler: State<'_, SchedulerManager>,
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    group_id: String,
    command_id: Option<String>,
    scheduled_time: String,
    recurrence: String,
    max_executions: Option<u32>,
) -> Result<String, String> {
    let scheduled_time: DateTime<Utc> = scheduled_time
        .parse()
        .map_err(|e| format!("Invalid date format: {}", e))?;

    let recurrence_pattern = parse_recurrence_pattern(&recurrence)?;

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
                "Creating command schedule for '{}' in group '{}'",
                group
                    .commands
                    .iter()
                    .find(|cmd| cmd.id == *cmd_id)
                    .unwrap()
                    .label,
                group.title
            );
        } else {
            log::info!("Creating group schedule for entire group '{}'", group.title);
        }
    }

    let schedule = Schedule {
        id: String::new(),
        group_id,
        command_id,
        scheduled_time,
        recurrence: recurrence_pattern,
        is_active: true,
        created_at: Utc::now(),
        last_execution: None,
        next_execution: scheduled_time,
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
    scheduled_time: String,
    recurrence: String,
    max_executions: Option<u32>,
) -> Result<(), String> {
    let scheduled_time: DateTime<Utc> = scheduled_time
        .parse()
        .map_err(|e| format!("Invalid date format: {}", e))?;

    let recurrence_pattern = parse_recurrence_pattern(&recurrence)?;

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
                "Updating command schedule for '{}' in group '{}'",
                group
                    .commands
                    .iter()
                    .find(|cmd| cmd.id == *cmd_id)
                    .unwrap()
                    .label,
                group.title
            );
        } else {
            log::info!("Updating group schedule for entire group '{}'", group.title);
        }
    }

    let updated_schedule = Schedule {
        id: id.clone(),
        group_id,
        command_id,
        scheduled_time,
        recurrence: recurrence_pattern,
        is_active: true,
        created_at: Utc::now(),
        last_execution: None,
        next_execution: scheduled_time,
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
pub async fn get_schedules(
    scheduler: State<'_, SchedulerManager>,
) -> Result<Vec<Schedule>, String> {
    Ok(scheduler.get_schedules())
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
    let display_name = schedule.get_display_name(&groups);
    let schedule_type = if schedule.is_group_schedule() {
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
        is_active: schedule.is_active,
        next_execution: schedule.next_execution,
        last_execution: schedule.last_execution,
        execution_count: schedule.execution_count,
        recurrence: schedule.recurrence.clone(),
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
            let display_name = schedule.get_display_name(&groups);
            let schedule_type = if schedule.is_group_schedule() {
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
                is_active: schedule.is_active,
                next_execution: schedule.next_execution,
                last_execution: schedule.last_execution,
                execution_count: schedule.execution_count,
                recurrence: schedule.recurrence.clone(),
            }
        })
        .collect();

    Ok(schedule_infos)
}

// Helper struct for frontend to get enriched schedule information
#[derive(serde::Serialize)]
pub struct ScheduleInfo {
    pub id: String,
    pub display_name: String,
    pub schedule_type: String, // "group" or "command"
    pub group_id: String,
    pub command_id: Option<String>,
    pub is_active: bool,
    pub next_execution: DateTime<Utc>,
    pub last_execution: Option<DateTime<Utc>>,
    pub execution_count: u32,
    pub recurrence: RecurrencePattern,
}

fn parse_recurrence_pattern(recurrence: &str) -> Result<RecurrencePattern, String> {
    match recurrence.to_lowercase().as_str() {
        "once" => Ok(RecurrencePattern::Once),
        "daily" => Ok(RecurrencePattern::Daily),
        "weekly" => Ok(RecurrencePattern::Weekly),
        "monthly" => Ok(RecurrencePattern::Monthly),
        s if s.starts_with("custom:") => {
            let interval_str = s.strip_prefix("custom:").unwrap();
            let interval_minutes: u32 = interval_str
                .parse()
                .map_err(|_| "Invalid custom interval format")?;

            if interval_minutes == 0 {
                return Err("Custom interval must be greater than 0".to_string());
            }

            Ok(RecurrencePattern::Custom { interval_minutes })
        }
        _ => Err(format!("Invalid recurrence pattern: {}", recurrence)),
    }
}
