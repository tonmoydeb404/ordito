use crate::models::{AppData, CommandGroup};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

// Helper function to get data file path
pub fn get_data_file_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    // Create the directory if it doesn't exist
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }

    Ok(app_data_dir.join("command_groups.json"))
}

// Load data from file
pub fn load_data(app_handle: &tauri::AppHandle) -> Result<HashMap<String, CommandGroup>, String> {
    let file_path = get_data_file_path(app_handle)?;

    if !file_path.exists() {
        return Ok(HashMap::new());
    }

    let content =
        fs::read_to_string(&file_path).map_err(|e| format!("Failed to read data file: {}", e))?;

    let app_data: AppData =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse data file: {}", e))?;

    Ok(app_data.groups)
}

// Save data to file
pub fn save_data(
    app_handle: &tauri::AppHandle,
    groups: &HashMap<String, CommandGroup>,
) -> Result<(), String> {
    let file_path = get_data_file_path(app_handle)?;

    let app_data = AppData {
        groups: groups.clone(),
    };

    let content = serde_json::to_string_pretty(&app_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;

    fs::write(&file_path, content).map_err(|e| format!("Failed to write data file: {}", e))?;

    Ok(())
}
