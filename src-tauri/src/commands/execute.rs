use crate::error::lock_state;
use crate::state::AppState;
use std::process::{Command, Stdio};
use std::time::Duration;
use tauri::State;
use tokio::time::timeout;

#[tauri::command]
pub async fn execute_command(cmd: String) -> Result<String, String> {
    let execution_future = tokio::task::spawn_blocking(move || {
        let output = if cfg!(target_os = "windows") {
            Command::new("cmd").args(["/C", &cmd]).output()
        } else {
            Command::new("sh").arg("-c").arg(&cmd).output()
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
pub async fn execute_command_detached(cmd: String) -> Result<String, String> {
    let result = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", &cmd])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .stdin(Stdio::null())
            .spawn()
    } else {
        Command::new("sh")
            .arg("-c")
            .arg(&cmd)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .stdin(Stdio::null())
            .spawn()
    };

    match result {
        Ok(_) => Ok("Process started successfully in background".to_string()),
        Err(e) => Err(format!("Failed to start command: {}", e)),
    }
}

#[tauri::command]
pub async fn execute_group_commands(
    state: State<'_, AppState>,
    group_id: String,
) -> Result<Vec<(String, String)>, String> {
    let commands = {
        let groups = lock_state(&state)?;
        groups
            .get(&group_id)
            .ok_or("Group not found")?
            .commands
            .clone()
    };

    let mut results = Vec::new();
    for cmd_item in commands {
        let result = if cmd_item.is_detached.unwrap_or(false) {
            execute_command_detached(cmd_item.cmd).await
        } else {
            execute_command(cmd_item.cmd).await
        };

        match result {
            Ok(output) => results.push((cmd_item.label, output)),
            Err(error) => results.push((cmd_item.label, format!("Error: {}", error))),
        }
    }

    Ok(results)
}
