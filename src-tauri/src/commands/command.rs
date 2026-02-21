use crate::models::CommandItem;
use crate::error::lock_state;
use crate::state::{AppState, ScheduleState};
use crate::core::storage::save_data;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub async fn add_command_to_group(
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    group_id: String,
    label: String,
    cmd: String,
    is_detached: Option<bool>,
) -> Result<String, String> {
    let command_id = Uuid::new_v4().to_string();
    let command_item = CommandItem {
        id: command_id.clone(),
        label,
        cmd,
        is_detached,
    };

    let mut groups = lock_state(&group_state)?;
    let schedules = lock_state(&schedule_state)?;
    let group = groups.get_mut(&group_id).ok_or("Group not found")?;
    group.commands.push(command_item);
    save_data(&app_handle, &groups, &schedules)?;
    Ok(command_id)
}

#[tauri::command]
pub async fn delete_command_from_group(
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    group_id: String,
    command_id: String,
) -> Result<(), String> {
    let mut groups = lock_state(&group_state)?;
    let schedules = lock_state(&schedule_state)?;
    let group = groups.get_mut(&group_id).ok_or("Group not found")?;
    group.commands.retain(|cmd| cmd.id != command_id);
    save_data(&app_handle, &groups, &schedules)?;
    Ok(())
}

#[tauri::command]
pub async fn update_command(
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    group_id: String,
    command_id: String,
    label: String,
    cmd: String,
    is_detached: Option<bool>,
) -> Result<(), String> {
    let mut groups = lock_state(&group_state)?;
    let schedules = lock_state(&schedule_state)?;
    let group = groups.get_mut(&group_id).ok_or("Group not found")?;
    let command = group
        .commands
        .iter_mut()
        .find(|c| c.id == command_id)
        .ok_or("Command not found")?;
    command.label = label;
    command.cmd = cmd;
    command.is_detached = is_detached;
    save_data(&app_handle, &groups, &schedules)?;
    Ok(())
}
