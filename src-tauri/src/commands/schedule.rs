use crate::models::{RecurrencePattern, Schedule};
use crate::scheduler::SchedulerManager;
use chrono::{DateTime, Utc};
use tauri::State;

#[tauri::command]
pub async fn create_schedule(
    scheduler: State<'_, SchedulerManager>,
    group_id: String,
    command_id: String,
    scheduled_time: String,
    recurrence: String,
    max_executions: Option<u32>,
) -> Result<String, String> {
    let scheduled_time: DateTime<Utc> = scheduled_time
        .parse()
        .map_err(|e| format!("Invalid date format: {}", e))?;

    let recurrence_pattern = parse_recurrence_pattern(&recurrence)?;

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

    scheduler.add_schedule(schedule)
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
    id: String,
) -> Result<(), String> {
    scheduler.remove_schedule(&id)
}

#[tauri::command]
pub async fn update_schedule(
    scheduler: State<'_, SchedulerManager>,
    id: String,
    group_id: String,
    command_id: String,
    scheduled_time: String,
    recurrence: String,
    max_executions: Option<u32>,
) -> Result<(), String> {
    let scheduled_time: DateTime<Utc> = scheduled_time
        .parse()
        .map_err(|e| format!("Invalid date format: {}", e))?;

    let recurrence_pattern = parse_recurrence_pattern(&recurrence)?;

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

    scheduler.update_schedule(&id, updated_schedule)
}

#[tauri::command]
pub async fn toggle_schedule(
    scheduler: State<'_, SchedulerManager>,
    id: String,
) -> Result<bool, String> {
    scheduler.toggle_schedule(&id)
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
