use crate::models::{AppData, CommandGroup};
use crate::state::{AppState, ScheduleState};
use crate::storage::{merge_data, save_data};
use tauri::State;
use tauri_plugin_dialog::{DialogExt, FilePath};
use uuid::Uuid;

#[tauri::command]
pub async fn create_group(
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    title: String,
) -> Result<String, String> {
    let id = Uuid::new_v4().to_string();
    let group = CommandGroup {
        id: id.clone(),
        title,
        commands: Vec::new(),
    };

    {
        let mut groups = group_state.lock().unwrap();
        let schedules = schedule_state.lock().unwrap();
        groups.insert(id.clone(), group);
        save_data(&app_handle, &groups, &schedules)?;
    }

    Ok(id)
}

#[tauri::command]
pub async fn get_groups(state: State<'_, AppState>) -> Result<Vec<CommandGroup>, String> {
    let groups = state.lock().unwrap();
    Ok(groups.values().cloned().collect())
}

#[tauri::command]
pub async fn delete_group(
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    group_id: String,
) -> Result<(), String> {
    {
        let mut groups = group_state.lock().unwrap();
        let schedules = schedule_state.lock().unwrap();
        groups.remove(&group_id);
        save_data(&app_handle, &groups, &schedules)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn update_group(
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
    group_id: String,
    title: String,
) -> Result<(), String> {
    {
        let mut groups = group_state.lock().unwrap();
        let schedules = schedule_state.lock().unwrap();
        if let Some(group) = groups.get_mut(&group_id) {
            group.title = title;
            save_data(&app_handle, &groups, &schedules)?;
            Ok(())
        } else {
            Err("Group not found".to_string())
        }
    }
}

#[tauri::command]
pub async fn export_data(
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let groups = group_state.lock().unwrap();
    let schedules = schedule_state.lock().unwrap();
    let app_data = AppData {
        groups: groups.clone(),
        schedules: Some(schedules.clone()),
    };

    let content = serde_json::to_string_pretty(&app_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;

    let file_path = app_handle
        .dialog()
        .file()
        .add_filter("JSON Files", &["json"])
        .set_file_name(&format!(
            "ordito-commands-{}.json",
            chrono::Local::now().format("%Y-%m-%d")
        ))
        .blocking_save_file();

    match file_path {
        Some(FilePath::Path(path)) => {
            std::fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))?;
            Ok(format!("Data exported to: {}", path.display()))
        }
        Some(FilePath::Url(_)) => Err("URL paths not supported for file export".to_string()),
        None => Err("User cancelled save dialog".to_string()),
    }
}

#[tauri::command]
pub async fn import_data(
    group_state: State<'_, AppState>,
    schedule_state: State<'_, ScheduleState>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let file_path = app_handle
        .dialog()
        .file()
        .add_filter("JSON Files", &["json"])
        .blocking_pick_file();

    match file_path {
        Some(FilePath::Path(path)) => {
            let content = std::fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read file: {}", e))?;

            let app_data: AppData = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse import data: {}", e))?;

            {
                let mut groups = group_state.lock().unwrap();
                let mut schedules = schedule_state.lock().unwrap();
                let (merged_groups, added_count, skipped_count) =
                    merge_data(&groups, app_data.groups);

                *groups = merged_groups;
                if let Some(imported_schedules) = app_data.schedules {
                    schedules.extend(imported_schedules);
                }
                save_data(&app_handle, &groups, &schedules)?;

                if skipped_count > 0 {
                    Ok(format!(
                        "Import completed: {} new groups added, {} existing groups skipped",
                        added_count, skipped_count
                    ))
                } else {
                    Ok(format!(
                        "Import completed: {} new groups added successfully",
                        added_count
                    ))
                }
            }
        }
        Some(FilePath::Url(_)) => Err("URL paths not supported for import".to_string()),
        None => Err("User cancelled open dialog".to_string()),
    }
}
