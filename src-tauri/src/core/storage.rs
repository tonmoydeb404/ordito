use crate::models::{AppData, CommandGroup, Schedule};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

pub fn get_data_file_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }

    Ok(app_data_dir.join("command_groups.json"))
}

pub fn load_data(
    app_handle: &tauri::AppHandle,
) -> Result<(HashMap<String, CommandGroup>, HashMap<String, Schedule>), String> {
    let file_path = get_data_file_path(app_handle)?;

    if !file_path.exists() {
        return Ok((HashMap::new(), HashMap::new()));
    }

    let content =
        fs::read_to_string(&file_path).map_err(|e| format!("Failed to read data file: {}", e))?;

    let app_data: AppData =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse data file: {}", e))?;

    let schedules = app_data.schedules.unwrap_or_default();
    Ok((app_data.groups, schedules))
}

pub fn save_data(
    app_handle: &tauri::AppHandle,
    groups: &HashMap<String, CommandGroup>,
    schedules: &HashMap<String, Schedule>,
) -> Result<(), String> {
    let file_path = get_data_file_path(app_handle)?;

    let app_data = AppData {
        groups: groups.clone(),
        schedules: Some(schedules.clone()),
    };

    let content = serde_json::to_string_pretty(&app_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;

    fs::write(&file_path, content).map_err(|e| format!("Failed to write data file: {}", e))?;

    Ok(())
}

pub fn merge_data(
    current_groups: &HashMap<String, CommandGroup>,
    imported_groups: HashMap<String, CommandGroup>,
) -> (HashMap<String, CommandGroup>, usize, usize) {
    let mut merged_groups = current_groups.clone();
    let mut added_count = 0;
    let mut skipped_count = 0;

    for (group_id, imported_group) in imported_groups {
        if merged_groups.contains_key(&group_id) {
            skipped_count += 1;
            log::info!(
                "Skipping duplicate group: {} (ID: {})",
                imported_group.title,
                group_id
            );
        } else {
            merged_groups.insert(group_id.clone(), imported_group.clone());
            added_count += 1;
            log::info!(
                "Added new group: {} (ID: {})",
                imported_group.title,
                group_id
            );
        }
    }

    (merged_groups, added_count, skipped_count)
}
