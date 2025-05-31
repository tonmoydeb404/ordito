use crate::models::{AppData, CommandGroup};
use crate::state::AppState;
use crate::storage::save_data;
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
    data: String,
) -> Result<String, String> {
    let app_data: AppData =
        serde_json::from_str(&data).map_err(|e| format!("Failed to parse import data: {}", e))?;

    {
        let mut groups = state.lock().unwrap();
        *groups = app_data.groups;
        save_data(&app_handle, &groups)?;
    }

    Ok("Data imported successfully".to_string())
}
