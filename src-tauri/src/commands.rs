use crate::models::{AppData, CommandGroup, CommandItem};
use crate::state::AppState;
use crate::storage::{get_data_file_path, save_data};
use std::process::{Command, Stdio};
use std::time::Duration;
use tauri::State;
use tokio::time::timeout;
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
pub async fn execute_command(command: String) -> Result<String, String> {
    // Set a timeout for command execution (30 seconds)
    let execution_future = tokio::task::spawn_blocking(move || {
        let output = if cfg!(target_os = "windows") {
            Command::new("cmd").args(["/C", &command]).output()
        } else {
            Command::new("sh").arg("-c").arg(&command).output()
        };

        match output {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);

                if output.status.success() {
                    Ok(stdout.to_string())
                } else {
                    Err(format!("Command failed: {}", stderr))
                }
            }
            Err(e) => Err(format!("Failed to execute command: {}", e)),
        }
    });

    match timeout(Duration::from_secs(30), execution_future).await {
        Ok(Ok(result)) => result,
        Ok(Err(e)) => Err(format!("Task error: {}", e)),
        Err(_) => Err("Command timed out after 30 seconds".to_string()),
    }
}

#[tauri::command]
pub async fn execute_command_detached(command: String) -> Result<String, String> {
    let result = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", &command])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .stdin(Stdio::null())
            .spawn()
    } else {
        Command::new("sh")
            .arg("-c")
            .arg(&command)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .stdin(Stdio::null())
            .spawn()
    };

    match result {
        Ok(_child) => {
            // Process started successfully, we don't need to track the PID
            Ok("Process started successfully in background".to_string())
        }
        Err(e) => Err(format!("Failed to start command: {}", e)),
    }
}

#[tauri::command]
pub async fn execute_group_commands(
    state: State<'_, AppState>,
    group_id: String,
) -> Result<Vec<(String, String)>, String> {
    // Clone the commands first, then release the lock
    let commands = {
        let groups = state.lock().unwrap();
        if let Some(group) = groups.get(&group_id) {
            group.commands.clone()
        } else {
            return Err("Group not found".to_string());
        }
    }; // Lock is released here

    let mut results = Vec::new();

    for cmd in commands {
        let result = if cmd.is_detached.unwrap_or(false) {
            execute_command_detached(cmd.cmd).await
        } else {
            execute_command(cmd.cmd).await
        };

        match result {
            Ok(output) => results.push((cmd.label, output)),
            Err(error) => results.push((cmd.label, format!("Error: {}", error))),
        }
    }

    Ok(results)
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

    let _content = serde_json::to_string_pretty(&app_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;

    let file_path = get_data_file_path(&app_handle)?;
    Ok(format!("Data saved to: {}", file_path.display()))
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
