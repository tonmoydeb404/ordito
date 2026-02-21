use std::process::Stdio;
use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Context, Result};
use chrono::Utc;
use sqlx::SqlitePool;
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command as TokioCommand;
use tokio::time::timeout;
use tracing::{error, info, warn};
use uuid::Uuid;

use crate::db::command::CommandRepository;
use crate::db::command_log::CommandLogRepository;
use crate::domain::command_log::{CommandLog, CommandLogStatus};
use crate::io::log_storage::LogStorage;

/// Result of a command execution
#[derive(Debug, Clone)]
pub struct ExecutionResult {
    pub log_id: Uuid,
    pub status: CommandLogStatus,
    pub exit_code: Option<u32>,
    pub duration_ms: u64,
}

/// Service responsible for executing shell commands
pub struct ExecutionService<'a> {
    pool: &'a SqlitePool,
    log_storage: &'a LogStorage,
}

impl<'a> ExecutionService<'a> {
    /// Creates a new ExecutionService
    ///
    /// # Arguments
    /// * `pool` - Database connection pool
    /// * `log_storage` - LogStorage instance for managing output files
    pub fn new(pool: &'a SqlitePool, log_storage: &'a LogStorage) -> Self {
        Self { pool, log_storage }
    }

    /// Executes a command by its ID
    ///
    /// # Arguments
    /// * `app` - Tauri AppHandle for event emission
    /// * `state` - AppState for process management
    /// * `command_id` - UUID of the command to execute
    /// * `schedule_id` - Optional UUID of the schedule that triggered this execution
    ///
    /// # Returns
    /// ExecutionResult containing log_id, status, exit_code, and duration
    ///
    /// # Errors
    /// Returns error if command not found, execution fails, or database operations fail
    pub async fn execute_command(
        &self,
        app: &tauri::AppHandle,
        state: &crate::app::state::AppState,
        command_id: &str,
        schedule_id: Option<&str>,
    ) -> Result<ExecutionResult> {
        let command_repo = CommandRepository::new(self.pool);

        // Fetch command from database
        let command = command_repo
            .get_by_id(command_id)
            .await?
            .ok_or_else(|| anyhow!("Command not found: {}", command_id))?;

        info!("Executing command: {} ({})", command.title, command.id);

        // Create initial log entry with "running" status
        let log_id = Uuid::new_v4();
        let started_at = Utc::now();

        let mut log = CommandLog {
            id: log_id,
            command_id: command.id,
            command_schedule_id: schedule_id.and_then(|s| Uuid::parse_str(s).ok()),
            status: CommandLogStatus::Running.to_string(),
            exit_code: None,
            output: None,
            working_dir: command.working_dir.clone(),
            run_in_background: command.run_in_background,
            timeout: command.timeout,
            env_vars: command.env_vars.clone(),
            started_at,
            finished_at: None,
        };

        let log_repo = CommandLogRepository::new(self.pool, self.log_storage);
        log_repo.create(log.clone()).await?;

        // Emit execution:started event
        app.emit(
            "execution:started",
            serde_json::json!({
                "log_id": log_id.to_string(),
                "command_id": command_id,
            }),
        )
        .ok();

        // Parse environment variables from JSON
        let env_vars: std::collections::HashMap<String, String> =
            serde_json::from_str(&command.env_vars).unwrap_or_default();

        // Execute the command
        let start_time = std::time::Instant::now();
        let execution_result = self
            .run_command(
                app,
                state,
                &log_id,
                command.id,
                &command.value,
                &command.working_dir,
                env_vars,
                command.timeout,
            )
            .await;

        let duration_ms = start_time.elapsed().as_millis() as u64;
        let finished_at = Utc::now();

        // Update log with execution result
        match execution_result {
            Ok((exit_code, status)) => {
                log.status = status.to_string();
                log.exit_code = Some(exit_code);
                log.finished_at = Some(finished_at);

                log_repo.update(log.clone()).await?;

                info!(
                    "Command execution completed: {} with status {:?}, exit code: {}",
                    command.title, status, exit_code
                );

                // Emit execution:completed event
                app.emit(
                    "execution:completed",
                    serde_json::json!({
                        "log_id": log_id.to_string(),
                        "status": status.to_string(),
                        "exit_code": exit_code,
                    }),
                )
                .ok();

                // Unregister from state
                state.unregister_execution(&log_id).await;

                Ok(ExecutionResult {
                    log_id,
                    status,
                    exit_code: Some(exit_code),
                    duration_ms,
                })
            }
            Err(e) => {
                error!("Command execution failed: {} - {}", command.title, e);

                log.status = CommandLogStatus::Failed.to_string();
                log.exit_code = None;
                log.finished_at = Some(finished_at);

                // Write error to log file
                self.log_storage
                    .append_log(&log_id, &format!("\n[ERROR] {}", e))
                    .await
                    .ok();

                log_repo.update(log).await?;

                // Emit execution:completed event
                app.emit(
                    "execution:completed",
                    serde_json::json!({
                        "log_id": log_id.to_string(),
                        "status": "failed",
                        "exit_code": null,
                    }),
                )
                .ok();

                // Unregister from state
                state.unregister_execution(&log_id).await;

                Ok(ExecutionResult {
                    log_id,
                    status: CommandLogStatus::Failed,
                    exit_code: None,
                    duration_ms,
                })
            }
        }
    }

    /// Runs a shell command with output capture
    ///
    /// # Arguments
    /// * `app` - Tauri AppHandle for event emission
    /// * `state` - AppState for process management
    /// * `log_id` - UUID of the log entry for output streaming
    /// * `command_id` - UUID of the command being executed
    /// * `command_str` - Shell command to execute
    /// * `working_dir` - Working directory for command execution
    /// * `env_vars` - Environment variables to set
    /// * `timeout_secs` - Optional timeout in seconds
    ///
    /// # Returns
    /// Tuple of (exit_code, status)
    async fn run_command(
        &self,
        app: &tauri::AppHandle,
        state: &crate::app::state::AppState,
        log_id: &Uuid,
        command_id: Uuid,
        command_str: &str,
        working_dir: &str,
        env_vars: std::collections::HashMap<String, String>,
        timeout_secs: Option<u32>,
    ) -> Result<(u32, CommandLogStatus)> {
        // Determine shell based on platform
        #[cfg(target_os = "windows")]
        let (shell, shell_arg) = ("cmd", "/C");

        #[cfg(not(target_os = "windows"))]
        let (shell, shell_arg) = ("sh", "-c");

        // Build command
        let mut cmd = TokioCommand::new(shell);
        cmd.arg(shell_arg)
            .arg(command_str)
            .current_dir(working_dir)
            .envs(env_vars)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .stdin(Stdio::null());

        // Spawn the process
        let mut child = cmd.spawn().context("Failed to spawn command process")?;

        // Capture stdout and stderr
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| anyhow!("Failed to capture stdout"))?;
        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| anyhow!("Failed to capture stderr"))?;

        // Register process with state (we'll move child into state after reading streams)
        // For now, register execution without process handle - we'll update it

        let log_id_clone = *log_id;
        let log_storage_clone = self.log_storage.clone();
        let app_clone = app.clone();

        // Spawn task to read stdout
        let stdout_task = tokio::spawn(async move {
            let reader = BufReader::new(stdout);
            let mut lines = reader.lines();

            while let Ok(Some(line)) = lines.next_line().await {
                // Stream output to log file
                if let Err(e) = log_storage_clone
                    .append_log(&log_id_clone, &format!("{}\n", line))
                    .await
                {
                    warn!("Failed to write stdout to log: {}", e);
                }

                // Emit output event
                app_clone
                    .emit(
                        "execution:output",
                        serde_json::json!({
                            "log_id": log_id_clone.to_string(),
                            "chunk": line,
                        }),
                    )
                    .ok();
            }
        });

        let log_id_clone2 = *log_id;
        let log_storage_clone2 = self.log_storage.clone();
        let app_clone2 = app.clone();

        // Spawn task to read stderr
        let stderr_task = tokio::spawn(async move {
            let reader = BufReader::new(stderr);
            let mut lines = reader.lines();

            while let Ok(Some(line)) = lines.next_line().await {
                let stderr_line = format!("[STDERR] {}", line);
                // Stream stderr to log file with [STDERR] prefix
                if let Err(e) = log_storage_clone2
                    .append_log(&log_id_clone2, &format!("{}\n", stderr_line))
                    .await
                {
                    warn!("Failed to write stderr to log: {}", e);
                }

                // Emit output event
                app_clone2
                    .emit(
                        "execution:output",
                        serde_json::json!({
                            "log_id": log_id_clone2.to_string(),
                            "chunk": stderr_line,
                        }),
                    )
                    .ok();
            }
        });

        // Register process with state
        state
            .register_execution_with_process(*log_id, command_id, child)
            .await;

        // Get process handle from state to wait on it
        // Clone the Arc<Mutex<>> first, then drop the lock before waiting
        let process_arc = {
            let executions = state.running_executions.lock().await;
            if let Some(exec) = executions.get(log_id) {
                Arc::clone(&exec.process)
            } else {
                return Err(anyhow!("Execution not found in state"));
            }
        }; // executions lock is dropped here

        let wait_result = if let Some(timeout_sec) = timeout_secs {
            let duration = Duration::from_secs(timeout_sec as u64);
            let mut proc = process_arc.lock().await;
            if let Some(child_ref) = proc.as_mut() {
                timeout(duration, child_ref.wait()).await
            } else {
                return Err(anyhow!("Process handle not found in state"));
            }
        } else {
            let mut proc = process_arc.lock().await;
            if let Some(child_ref) = proc.as_mut() {
                Ok(child_ref.wait().await)
            } else {
                return Err(anyhow!("Process handle not found in state"));
            }
        };

        // Wait for output tasks to complete
        let _ = tokio::join!(stdout_task, stderr_task);

        // Handle result
        match wait_result {
            Ok(Ok(status)) => {
                let exit_code = status.code().unwrap_or(1) as u32;
                let execution_status = if status.success() {
                    CommandLogStatus::Success
                } else {
                    CommandLogStatus::Failed
                };

                Ok((exit_code, execution_status))
            }
            Ok(Err(e)) => Err(anyhow!("Process execution error: {}", e)),
            Err(_) => {
                // Timeout occurred - kill the process via state
                state.kill_execution(log_id).await.ok();

                self.log_storage
                    .append_log(log_id, "\n[TIMEOUT] Command execution timed out\n")
                    .await
                    .ok();

                Ok((124, CommandLogStatus::Timeout)) // 124 is standard timeout exit code
            }
        }
    }

    /// Cancels a running command execution
    ///
    /// # Arguments
    /// * `app` - Tauri AppHandle for event emission
    /// * `state` - AppState for process management
    /// * `log_id` - UUID of the command log entry
    ///
    /// # Returns
    /// Ok(()) if cancellation was initiated successfully
    pub async fn cancel_execution(
        &self,
        app: &tauri::AppHandle,
        state: &crate::app::state::AppState,
        log_id: &str,
    ) -> Result<()> {
        let log_uuid = Uuid::parse_str(log_id)?;

        // Kill the actual process
        if !state.kill_execution(&log_uuid).await? {
            warn!("No running process found for log_id: {}", log_id);
        }

        let log_repo = CommandLogRepository::new(self.pool, self.log_storage);

        // Get the log entry
        let mut log = log_repo
            .get_by_id(log_id)
            .await?
            .ok_or_else(|| anyhow!("Log entry not found: {}", log_id))?;

        // Update status to cancelled
        log.status = CommandLogStatus::Cancelled.to_string();
        log.finished_at = Some(Utc::now());

        log_repo.update(log).await?;

        // Write cancellation message to log file
        self.log_storage
            .append_log(
                &log_uuid,
                "\n[CANCELLED] Command execution was cancelled by user\n",
            )
            .await
            .ok();

        // Emit execution:completed event with cancelled status
        app.emit(
            "execution:completed",
            serde_json::json!({
                "log_id": log_id,
                "status": "cancelled",
                "exit_code": null,
            }),
        )
        .ok();

        // Unregister from state
        state.unregister_execution(&log_uuid).await;

        info!("Command execution cancelled: {}", log_id);

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_simple_command_execution() {
        // This test requires a database setup
        // In a real scenario, you'd use a test database
        // For now, this is a placeholder showing the test structure
    }

    #[tokio::test]
    async fn test_command_timeout() {
        // Test that commands respect timeout settings
    }

    #[tokio::test]
    async fn test_command_cancellation() {
        // Test that commands can be cancelled
    }
}
