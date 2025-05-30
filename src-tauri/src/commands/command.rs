use crate::models::CommandItem;
use crate::state::AppState;
use crate::storage::save_data;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub async fn add_command_to_group(
    state: State<'_, AppState>,
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

    {
        let mut groups = state.lock().unwrap();
        if let Some(group) = groups.get_mut(&group_id) {
            group.commands.push(command_item);
            save_data(&app_handle, &groups)?;
            Ok(command_id)
        } else {
            Err("Group not found".to_string())
        }
    }
}

#[tauri::command]
pub async fn delete_command_from_group(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
    group_id: String,
    command_id: String,
) -> Result<(), String> {
    {
        let mut groups = state.lock().unwrap();
        if let Some(group) = groups.get_mut(&group_id) {
            group.commands.retain(|cmd| cmd.id != command_id);
            save_data(&app_handle, &groups)?;
            Ok(())
        } else {
            Err("Group not found".to_string())
        }
    }
}

#[tauri::command]
pub async fn update_command(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
    group_id: String,
    command_id: String,
    label: String,
    cmd: String,
    is_detached: Option<bool>,
) -> Result<(), String> {
    {
        let mut groups = state.lock().unwrap();
        if let Some(group) = groups.get_mut(&group_id) {
            if let Some(command) = group.commands.iter_mut().find(|c| c.id == command_id) {
                command.label = label;
                command.cmd = cmd;
                command.is_detached = is_detached;
                save_data(&app_handle, &groups)?;
                Ok(())
            } else {
                Err("Command not found".to_string())
            }
        } else {
            Err("Group not found".to_string())
        }
    }
}
