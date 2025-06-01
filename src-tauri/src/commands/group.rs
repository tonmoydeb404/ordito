use crate::models::{AppData, CommandGroup};
use crate::state::AppState;
use crate::storage::{merge_data, save_data};
use tauri::State;
use tauri_plugin_dialog::{DialogExt, FilePath};
use uuid::Uuid;

#[tauri::command]
pub async fn create_group(
    state: State<'_, AppState>,
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
        let mut groups = state.lock().unwrap();
        groups.insert(id.clone(), group);
        save_data(&app_handle, &groups)?;
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
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
    group_id: String,
) -> Result<(), String> {
    {
        let mut groups = state.lock().unwrap();
        groups.remove(&group_id);
        save_data(&app_handle, &groups)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn update_group(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
    group_id: String,
    title: String,
) -> Result<(), String> {
    {
        let mut groups = state.lock().unwrap();
        if let Some(group) = groups.get_mut(&group_id) {
            group.title = title;
            save_data(&app_handle, &groups)?;
            Ok(())
        } else {
            Err("Group not found".to_string())
        }
    }
}

#[tauri::command]
pub async fn export_data(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let groups = state.lock().unwrap();
    let app_data = AppData {
        groups: groups.clone(),
    };

    let content = serde_json::to_string_pretty(&app_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;

    // Use the dialog plugin
    let file_path = app_handle
        .dialog()
        .file()
        .add_filter("JSON Files", &["json"])
        .set_file_name(&format!(
            "ordito-commands-{}.json",
            chrono::Utc::now().format("%Y-%m-%d")
        ))
        .blocking_save_file();

    match file_path {
        Some(FilePath::Path(path)) => {
            // Write to selected path
            std::fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))?;

            Ok(format!("Data exported to: {}", path.display()))
        }
        Some(FilePath::Url(_)) => Err("URL paths not supported for file export".to_string()),
        None => Err("User cancelled save dialog".to_string()),
    }
}

#[tauri::command]
pub async fn import_data(
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    // Open dialog for selecting .json file
    let file_path = app_handle
        .dialog()
        .file()
        .add_filter("JSON Files", &["json"])
        .blocking_pick_file();

    match file_path {
        Some(FilePath::Path(path)) => {
            // Read file content
            let content = std::fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read file: {}", e))?;

            // Deserialize
            let app_data: AppData = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse import data: {}", e))?;

            // Merge with existing state instead of replacing
            {
                let mut groups = state.lock().unwrap();
                let (merged_groups, added_count, skipped_count) =
                    merge_data(&groups, app_data.groups);

                *groups = merged_groups;
                save_data(&app_handle, &groups)?;

                // Return detailed success message
                if skipped_count > 0 {
                    Ok(format!(
                        "Import completed: {} new groups added, {} existing groups skipped (duplicate IDs)",
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
