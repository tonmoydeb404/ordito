use std::fs;
use std::path::{Path, PathBuf};

use chrono::Utc;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use tokio::process::Command as TokioCommand;

use crate::db;
use crate::models::*;
use crate::state::AppState;

pub fn run_command_gated(app: &AppHandle, command_id: &str) -> Result<Run, String> {
    let command = {
        let state = app.state::<AppState>();
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        db::get_command(&conn, command_id)
            .map_err(|e| e.to_string())?
            .ok_or("Command not found")?
    };

    if command.requires_confirmation {
        let confirmed = app
            .dialog()
            .message(format!("Run \"{}\"?\n\n{}", command.name, command.command))
            .title("Confirm command")
            .kind(MessageDialogKind::Warning)
            .blocking_show();

        if !confirmed {
            return Err("Command execution cancelled".to_string());
        }
    }

    run_command(app, command_id)
}

pub fn run_command(app: &AppHandle, command_id: &str) -> Result<Run, String> {
    let state = app.state::<AppState>();

    let command = {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        db::get_command(&conn, command_id)
            .map_err(|e| e.to_string())?
            .ok_or("Command not found")?
    };

    let run_id = uuid::Uuid::new_v4().to_string();
    let started_at = Utc::now().to_rfc3339();
    let mode = if command.run_in_background {
        RunMode::Background
    } else {
        RunMode::Foreground
    };

    let run = Run {
        id: run_id,
        command_id: command.id.clone(),
        status: RunStatus::Running,
        mode,
        started_at: started_at.clone(),
        finished_at: None,
        duration_ms: None,
        exit_code: None,
        output_preview: String::new(),
        output_path: None,
    };

    {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        db::create_run(&conn, &run).map_err(|e| e.to_string())?;
        db::update_command_status(&conn, &command.id, CommandStatus::Running, Some(&started_at))
            .map_err(|e| e.to_string())?;
    }

    let _ = app.emit(
        "command://status-changed",
        StatusChangedPayload {
            command_id: command.id.clone(),
            last_run_status: CommandStatus::Running,
        },
    );

    if command.run_in_background {
        spawn_background(app.clone(), command, run.clone());
    } else {
        spawn_foreground(app.clone(), command, run.clone());
    }

    Ok(run)
}

pub fn cancel_run(app: &AppHandle, run_id: &str) -> Result<(), String> {
    let state = app.state::<AppState>();
    let pids = state.running_pids.lock().map_err(|e| e.to_string())?;

    if let Some(pid) = pids.get(run_id) {
        let pid = *pid;
        drop(pids);

        #[cfg(unix)]
        {
            let _ = std::process::Command::new("kill")
                .arg("-15")
                .arg(pid.to_string())
                .spawn();
        }
        #[cfg(windows)]
        {
            let _ = std::process::Command::new("taskkill")
                .args(["/PID", &pid.to_string(), "/T", "/F"])
                .spawn();
        }
    }

    Ok(())
}

fn spawn_background(app: AppHandle, command: Command, run: Run) {
    let run_id = run.id.clone();
    let command_id = command.id.clone();
    let logs_dir = {
        let state = app.state::<AppState>();
        state.logs_dir()
    };

    tauri::async_runtime::spawn(async move {
        let started = Utc::now();

        let child = match build_process(&command) {
            Ok(c) => c,
            Err(e) => {
                let err_msg = format!("Failed to spawn process: {e}");
                finalize(
                    &app,
                    &run_id,
                    &command_id,
                    started,
                    &RawRunResult {
                        status: RunStatus::Failed,
                        exit_code: None,
                        output: &err_msg,
                        output_path: None,
                    },
                    &logs_dir,
                )
                .await;
                return;
            }
        };

        {
            let state = app.state::<AppState>();
            if let Some(pid) = child.id() {
                let mut pids = state.running_pids.lock().unwrap();
                pids.insert(run_id.clone(), pid);
            }
        }

        let output = child.wait_with_output().await;

        {
            let state = app.state::<AppState>();
            let mut pids = state.running_pids.lock().unwrap();
            pids.remove(&run_id);
        }

        match output {
            Ok(output) => {
                let combined = format_combined_output(&output.stdout, &output.stderr);
                let exit_code = output.status.code();
                let status = match exit_code {
                    Some(0) => RunStatus::Success,
                    _ => RunStatus::Failed,
                };

                finalize(
                    &app,
                    &run_id,
                    &command_id,
                    started,
                    &RawRunResult {
                        status,
                        exit_code,
                        output: &combined,
                        output_path: None,
                    },
                    &logs_dir,
                )
                .await;
            }
            Err(e) => {
                let err_msg = format!("Process error: {e}");
                finalize(
                    &app,
                    &run_id,
                    &command_id,
                    started,
                    &RawRunResult {
                        status: RunStatus::Failed,
                        exit_code: None,
                        output: &err_msg,
                        output_path: None,
                    },
                    &logs_dir,
                )
                .await;
            }
        }
    });
}

fn spawn_foreground(app: AppHandle, command: Command, run: Run) {
    let run_id = run.id.clone();
    let command_id = command.id.clone();
    let logs_dir = {
        let state = app.state::<AppState>();
        state.logs_dir()
    };

    let started = Utc::now();
    let output_file = logs_dir.join(format!("{run_id}.log"));
    let result_file = std::env::temp_dir().join(format!("ordito_result_{run_id}.json"));
    let _ = fs::remove_file(&result_file);

    fs::create_dir_all(&logs_dir).ok();

    let script = if cfg!(target_os = "windows") {
        generate_windows_wrapper_script(&command, &output_file, &result_file)
    } else {
        generate_unix_wrapper_script(&command, &output_file, &result_file)
    };
    let script = match script {
        Ok(s) => s,
        Err(e) => {
            let err_msg = format!("Failed to create wrapper script: {e}");
            tauri::async_runtime::spawn(async move {
                finalize(
                    &app,
                    &run_id,
                    &command_id,
                    started,
                    &RawRunResult {
                        status: RunStatus::Failed,
                        exit_code: None,
                        output: &err_msg,
                        output_path: None,
                    },
                    &logs_dir,
                )
                .await;
            });
            return;
        }
    };

    let script_ext = if cfg!(target_os = "windows") { "ps1" } else { "sh" };
    let script_path = std::env::temp_dir().join(format!("ordito_run_{run_id}.{script_ext}"));
    if let Err(e) = fs::write(&script_path, &script) {
        let err_msg = format!("Failed to write wrapper script: {e}");
        tauri::async_runtime::spawn(async move {
            finalize(
                &app,
                &run_id,
                &command_id,
                started,
                &RawRunResult {
                    status: RunStatus::Failed,
                    exit_code: None,
                    output: &err_msg,
                    output_path: None,
                },
                &logs_dir,
            )
            .await;
        });
        return;
    }

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(metadata) = fs::metadata(&script_path) {
            let mut perms = metadata.permissions();
            perms.set_mode(0o755);
            let _ = fs::set_permissions(&script_path, perms);
        }
    }

    if let Err(e) = open_terminal(&script_path) {
        let err_msg = format!("Failed to open terminal: {e}");
        tauri::async_runtime::spawn(async move {
            finalize(
                &app,
                &run_id,
                &command_id,
                started,
                &RawRunResult {
                    status: RunStatus::Failed,
                    exit_code: None,
                    output: &err_msg,
                    output_path: None,
                },
                &logs_dir,
            )
            .await;
        });
        return;
    }

    let app_clone = app.clone();
    let run_id_clone = run_id.clone();
    let command_id_clone = command_id.clone();
    let logs_dir_clone = logs_dir.clone();
    let result_file_clone = result_file.clone();
    let output_file_clone = output_file.clone();
    let script_path_clone = script_path.clone();
    let started_clone = started;

    tauri::async_runtime::spawn(async move {
        let timeout = std::time::Duration::from_secs(60 * 60 * 24);
        let deadline = tokio::time::Instant::now() + timeout;

        loop {
            if result_file_clone.exists() {
                break;
            }
            if tokio::time::Instant::now() >= deadline {
                let err_msg = "Timed out waiting for foreground command (24h)";
                finalize(
                    &app_clone,
                    &run_id_clone,
                    &command_id_clone,
                    started_clone,
                    &RawRunResult {
                        status: RunStatus::Failed,
                        exit_code: None,
                        output: err_msg,
                        output_path: None,
                    },
                    &logs_dir_clone,
                )
                .await;
                let _ = fs::remove_file(&script_path_clone);
                return;
            }
            tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        }

        let result_str = fs::read_to_string(&result_file_clone).unwrap_or_default();
        let _ = fs::remove_file(&result_file_clone);
        let _ = fs::remove_file(&script_path_clone);

        let (exit_code, _started_ms, _finished_ms) = parse_result(&result_str);
        let status = match exit_code {
            Some(0) => RunStatus::Success,
            Some(_) => RunStatus::Failed,
            None => RunStatus::Failed,
        };

        let output_content = fs::read_to_string(&output_file_clone).unwrap_or_default();
        let log_path = output_file_clone.to_string_lossy().to_string();

        finalize(
            &app_clone,
            &run_id_clone,
            &command_id_clone,
            started_clone,
            &RawRunResult {
                status,
                exit_code,
                output: &output_content,
                output_path: Some(log_path),
            },
            &logs_dir_clone,
        )
        .await;
    });
}

struct RawRunResult<'a> {
    status: RunStatus,
    exit_code: Option<i32>,
    output: &'a str,
    output_path: Option<String>,
}

async fn finalize(
    app: &AppHandle,
    run_id: &str,
    command_id: &str,
    started: chrono::DateTime<Utc>,
    result: &RawRunResult<'_>,
    logs_dir: &Path,
) {
    let finished = Utc::now();
    let duration_ms = (finished - started).num_milliseconds();

    let preview = db::truncate_output(result.output);
    let final_output_path = result.output_path.clone().or_else(|| {
        let path = logs_dir.join(format!("{run_id}.log"));
        if fs::write(&path, result.output).is_ok() {
            Some(path.to_string_lossy().to_string())
        } else {
            None
        }
    });

    let completion = RunCompletion {
        status: result.status,
        finished_at: finished.to_rfc3339(),
        duration_ms,
        exit_code: result.exit_code,
        output_preview: preview,
        output_path: final_output_path,
    };

    let cmd_status = match result.status {
        RunStatus::Success => CommandStatus::Success,
        RunStatus::Failed => CommandStatus::Failed,
        RunStatus::Running => CommandStatus::Idle,
    };

    let run = {
        let state = app.state::<AppState>();
        let conn = match state.db.lock() {
            Ok(c) => c,
            Err(_) => return,
        };

        if let Err(e) = db::finalize_run(&conn, run_id, &completion) {
            eprintln!("DB error finalizing run: {e}");
        }

        if let Err(e) =
            db::update_command_status(&conn, command_id, cmd_status, Some(&completion.finished_at))
        {
            eprintln!("DB error updating command status: {e}");
        }

        let _ = db::prune_runs(&conn);

        db::list_runs(&conn, None)
            .ok()
            .and_then(|runs| runs.into_iter().find(|r| r.id == run_id))
    };

    if let Some(run) = run {
        let _ = app.emit(
            "run://completed",
            RunCompletedPayload {
                run,
                command_id: command_id.to_string(),
                last_run_status: cmd_status,
            },
        );

        let _ = app.emit(
            "command://status-changed",
            StatusChangedPayload {
                command_id: command_id.to_string(),
                last_run_status: cmd_status,
            },
        );
    }
}

fn build_process(command: &Command) -> Result<tokio::process::Child, std::io::Error> {
    let mut cmd = if cfg!(target_os = "windows") {
        let mut c = TokioCommand::new("cmd");
        c.args(["/C", &command.command]);
        c
    } else {
        let mut c = TokioCommand::new("sh");
        c.args(["-c", &command.command]);
        c
    };

    if !command.cwd.is_empty() {
        let cwd = expand_tilde(&command.cwd);
        if cwd.exists() {
            cmd.current_dir(cwd);
        }
    }

    cmd.stdout(std::process::Stdio::piped());
    cmd.stderr(std::process::Stdio::piped());

    cmd.spawn()
}

fn expand_tilde(path: &str) -> PathBuf {
    if let Some(stripped) = path.strip_prefix("~/") {
        if let Some(home) = dirs::home_dir() {
            return home.join(stripped);
        }
    }
    if path == "~" {
        if let Some(home) = dirs::home_dir() {
            return home;
        }
    }
    PathBuf::from(path)
}

fn format_combined_output(stdout: &[u8], stderr: &[u8]) -> String {
    let stdout_str = String::from_utf8_lossy(stdout);
    let stderr_str = String::from_utf8_lossy(stderr);

    if stderr_str.is_empty() {
        stdout_str.into_owned()
    } else if stdout_str.is_empty() {
        stderr_str.into_owned()
    } else {
        format!("{stdout_str}\n{stderr_str}")
    }
}

fn generate_unix_wrapper_script(
    command: &Command,
    output_path: &Path,
    result_path: &Path,
) -> Result<String, std::io::Error> {
    let cwd = if command.cwd.is_empty() {
        dirs::home_dir()
            .map(|h| h.to_string_lossy().into_owned())
            .unwrap_or_default()
    } else {
        expand_tilde(&command.cwd)
            .to_string_lossy()
            .into_owned()
    };

    let escaped_cmd = command.command.replace('\'', "'\\''");

    Ok(format!(
        r#"#!/bin/bash
cd '{cwd}' 2>/dev/null
now_ms() {{
  local ms
  ms=$(date +%s%3N 2>/dev/null)
  if [[ "$ms" =~ ^[0-9]+$ ]]; then
    echo "$ms"
  else
    echo "$(( $(date +%s) * 1000 ))"
  fi
}}
START=$(now_ms)
{{ eval '{cmd}'; }} 2>&1 | tee "{output}"
EXIT_CODE=${{PIPESTATUS[0]}}
END=$(now_ms)
echo "{{\"exit_code\":$EXIT_CODE,\"started_ms\":$START,\"finished_ms\":$END}}" > "{result}"
exit
"#,
        cwd = cwd,
        cmd = escaped_cmd,
        output = output_path.display(),
        result = result_path.display(),
    ))
}

fn generate_windows_wrapper_script(
    command: &Command,
    output_path: &Path,
    result_path: &Path,
) -> Result<String, std::io::Error> {
    let cwd = if command.cwd.is_empty() {
        dirs::home_dir()
            .map(|h| h.to_string_lossy().into_owned())
            .unwrap_or_default()
    } else {
        expand_tilde(&command.cwd)
            .to_string_lossy()
            .into_owned()
    };

    // PowerShell single-quoted strings only need '' to escape an embedded quote
    let escaped_cmd = command.command.replace('\'', "''");
    let escaped_cwd = cwd.replace('\'', "''");

    Ok(format!(
        r#"Set-Location -LiteralPath '{cwd}' -ErrorAction SilentlyContinue
$Start = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
cmd /c '{cmd}' 2>&1 | Tee-Object -FilePath '{output}'
$ExitCode = $LASTEXITCODE
$End = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$Result = [PSCustomObject]@{{ exit_code = $ExitCode; started_ms = $Start; finished_ms = $End }}
$Result | ConvertTo-Json -Compress | Set-Content -LiteralPath '{result}'
exit
"#,
        cwd = escaped_cwd,
        cmd = escaped_cmd,
        output = output_path.display(),
        result = result_path.display(),
    ))
}

fn open_terminal(script_path: &Path) -> Result<(), String> {
    let path_str = script_path.to_string_lossy().to_string();

    #[cfg(target_os = "macos")]
    {
        let script = format!(
            "tell application \"Terminal\"\n\
             \x20activate\n\
             \x20do script \"exec '{path}'\"\n\
             end tell",
            path = path_str
        );
        std::process::Command::new("osascript")
            .args(["-e", &script])
            .spawn()
            .map_err(|e| format!("osascript error: {e}"))?;
        Ok(())
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        let terminals = [
            ("gnome-terminal", vec!["--", "bash", &path_str]),
            ("konsole", vec!["-e", "bash", &path_str]),
            ("xfce4-terminal", vec!["-x", "bash", &path_str]),
            ("xterm", vec!["-e", "bash", &path_str]),
            ("alacritty", vec!["-e", "bash", &path_str]),
            ("kitty", vec!["bash", &path_str]),
            ("terminator", vec!["-x", "bash", &path_str]),
        ];

        for (name, args) in &terminals {
            if std::process::Command::new("which")
                .arg(name)
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false)
            {
                let owned_args: Vec<String> = args.iter().map(|s| s.to_string()).collect();
                std::process::Command::new(name)
                    .args(&owned_args)
                    .spawn()
                    .map_err(|e| format!("{name} error: {e}"))?;
                return Ok(());
            }
        }
        return Err("No supported terminal emulator found".to_string());
    }

    #[cfg(windows)]
    {
        std::process::Command::new("cmd")
            .args([
                "/C",
                "start",
                "powershell",
                "-NoExit",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                &path_str,
            ])
            .spawn()
            .map_err(|e| format!("powershell error: {e}"))?;
        Ok(())
    }

    #[cfg(not(any(target_os = "macos", unix, windows)))]
    {
        Err("Unsupported platform".to_string())
    }
}

fn parse_result(json: &str) -> (Option<i32>, i64, i64) {
    let v: serde_json::Value = match serde_json::from_str(json) {
        Ok(v) => v,
        Err(_) => return (None, 0, 0),
    };

    let exit_code = v.get("exit_code").and_then(|c| c.as_i64()).map(|c| c as i32);
    let started_ms = v.get("started_ms").and_then(|c| c.as_i64()).unwrap_or(0);
    let finished_ms = v.get("finished_ms").and_then(|c| c.as_i64()).unwrap_or(0);

    (exit_code, started_ms, finished_ms)
}
