use crate::error::{OrditoError, Result};
use crate::models::{Command, CommandExecution};
use crate::utils::get_app_data_dir;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Stdio;
use std::sync::Arc;
use tokio::process::Command as TokioCommand;
use tokio::sync::{Mutex, RwLock};
use tracing::{debug, error, info, warn};
use uuid::Uuid;

pub type ExecutionHandle = Arc<RwLock<CommandExecution>>;

#[derive(Debug)]
pub struct ExecutorService {
    running_executions: Arc<Mutex<HashMap<Uuid, ExecutionHandle>>>,
    execution_history: Arc<RwLock<Vec<CommandExecution>>>,
    history_file_path: PathBuf,
}

impl ExecutorService {
    pub fn new() -> Result<Self> {
        let mut history_file_path = get_app_data_dir()?;
        history_file_path.push("execution_history.json");

        let execution_history = Self::load_history_from_file(&history_file_path)?;

        Ok(Self {
            running_executions: Arc::new(Mutex::new(HashMap::new())),
            execution_history: Arc::new(RwLock::new(execution_history)),
            history_file_path,
        })
    }

    pub async fn execute_command(&self, command: &Command, detached: bool) -> Result<Uuid> {
        info!(
            "Executing command: {} (detached: {})",
            command.name, detached
        );

        let execution = CommandExecution::new(command.id);
        let execution_id = execution.id;
        let execution_handle = Arc::new(RwLock::new(execution));

        {
            let mut running = self.running_executions.lock().await;
            running.insert(execution_id, execution_handle.clone());
        }

        if detached {
            let service_clone = self.clone();
            let command_clone = command.clone();
            tokio::spawn(async move {
                if let Err(e) = service_clone
                    .run_command_internal(&command_clone, execution_handle)
                    .await
                {
                    error!("Failed to execute detached command: {}", e);
                }
            });
        } else {
            self.run_command_internal(command, execution_handle).await?;
        }

        Ok(execution_id)
    }

    pub async fn execute_command_group(
        &self,
        commands: &[Command],
        detached: bool,
    ) -> Result<Vec<Uuid>> {
        info!(
            "Executing command group with {} commands (detached: {})",
            commands.len(),
            detached
        );

        let mut execution_ids = Vec::new();

        if detached {
            for command in commands {
                let execution_id = self.execute_command(command, true).await?;
                execution_ids.push(execution_id);
            }
        } else {
            for command in commands {
                let execution_id = self.execute_command(command, false).await?;
                execution_ids.push(execution_id);
            }
        }

        Ok(execution_ids)
    }

    pub async fn get_execution_status(
        &self,
        execution_id: Uuid,
    ) -> Result<Option<CommandExecution>> {
        if let Some(execution_handle) = self.running_executions.lock().await.get(&execution_id) {
            let execution = execution_handle.read().await.clone();
            Ok(Some(execution))
        } else {
            let history = self.execution_history.read().await;
            Ok(history.iter().find(|e| e.id == execution_id).cloned())
        }
    }

    pub async fn get_running_executions(&self) -> Vec<CommandExecution> {
        let running = self.running_executions.lock().await;
        let mut executions = Vec::new();

        for execution_handle in running.values() {
            let execution = execution_handle.read().await.clone();
            executions.push(execution);
        }

        executions
    }

    pub async fn get_execution_history(&self, limit: Option<usize>) -> Vec<CommandExecution> {
        let history = self.execution_history.read().await;
        match limit {
            Some(limit) => history.iter().rev().take(limit).cloned().collect(),
            None => history.clone(),
        }
    }

    pub async fn kill_execution(&self, execution_id: Uuid) -> Result<()> {
        warn!("Attempting to kill execution: {}", execution_id);

        if let Some(execution_handle) = self.running_executions.lock().await.get(&execution_id) {
            let mut execution = execution_handle.write().await;
            if execution.is_running {
                execution.finish(
                    Some(-1),
                    String::new(),
                    "Process killed by user".to_string(),
                );
                info!("Execution {} marked as killed", execution_id);
            }
            Ok(())
        } else {
            Err(OrditoError::Command(format!(
                "Execution {} not found",
                execution_id
            )))
        }
    }

    pub async fn shutdown(&self) -> Result<()> {
        info!("Shutting down executor service");

        let running = self.running_executions.lock().await;
        let running_count = running.len();

        if running_count > 0 {
            warn!("Shutting down with {} running executions", running_count);
            for (id, execution_handle) in running.iter() {
                let mut execution = execution_handle.write().await;
                if execution.is_running {
                    execution.finish(
                        Some(-1),
                        String::new(),
                        "Process terminated due to shutdown".to_string(),
                    );
                    debug!("Terminated execution: {}", id);
                }
            }
        }

        Ok(())
    }

    async fn run_command_internal(
        &self,
        command: &Command,
        execution_handle: ExecutionHandle,
    ) -> Result<()> {
        let mut cmd = self.build_tokio_command(command)?;

        debug!("Starting command execution: {}", command.command);

        match cmd.output().await {
            Ok(output) => {
                let exit_code = output.status.code();
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();

                let mut execution = execution_handle.write().await;
                execution.finish(exit_code, stdout, stderr);

                info!(
                    "Command finished - Exit code: {:?}, Stdout: {} bytes, Stderr: {} bytes",
                    exit_code,
                    execution.stdout.len(),
                    execution.stderr.len()
                );

                let execution_clone = execution.clone();
                drop(execution);

                self.move_to_history(execution_clone).await;

                Ok(())
            }
            Err(e) => {
                error!("Failed to execute command: {}", e);

                let mut execution = execution_handle.write().await;
                execution.finish(None, String::new(), format!("Execution failed: {}", e));

                let execution_clone = execution.clone();
                drop(execution);

                self.move_to_history(execution_clone).await;

                Err(OrditoError::Command(format!(
                    "Failed to execute command: {}",
                    e
                )))
            }
        }
    }

    fn build_tokio_command(&self, command: &Command) -> Result<TokioCommand> {
        let mut cmd = if cfg!(target_os = "windows") {
            let mut cmd = TokioCommand::new("cmd");
            cmd.args(["/C", &command.command]);
            cmd
        } else {
            let mut cmd = TokioCommand::new("sh");
            cmd.args(["-c", &command.command]);
            cmd
        };

        if let Some(working_dir) = &command.working_directory {
            cmd.current_dir(working_dir);
        }

        for env_var in &command.environment_variables {
            cmd.env(&env_var.key, &env_var.value);
        }

        cmd.stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .stdin(Stdio::null());

        Ok(cmd)
    }

    async fn move_to_history(&self, execution: CommandExecution) {
        {
            let mut running = self.running_executions.lock().await;
            running.remove(&execution.id);
        }

        {
            let mut history = self.execution_history.write().await;
            history.push(execution);

            // Keep only the last 1000 executions
            if history.len() > 1000 {
                history.drain(0..100);
            }

            // Save to file after adding new execution
            if let Err(e) = self.save_history_to_file(&history).await {
                error!("Failed to save execution history: {}", e);
            }
        }
    }

    fn load_history_from_file(file_path: &PathBuf) -> Result<Vec<CommandExecution>> {
        if !file_path.exists() {
            info!("Execution history file not found, starting with empty history");
            return Ok(Vec::new());
        }

        debug!("Loading execution history from {:?}", file_path);

        let contents = fs::read_to_string(file_path).map_err(|e| {
            OrditoError::Storage(format!("Failed to read execution history file: {}", e))
        })?;

        let history: Vec<CommandExecution> = serde_json::from_str(&contents).map_err(|e| {
            warn!("Failed to parse execution history file, creating backup and starting fresh");
            if let Err(backup_err) = fs::copy(file_path, file_path.with_extension("json.backup")) {
                warn!("Failed to create backup: {}", backup_err);
            }
            OrditoError::Storage(format!("Failed to parse execution history file: {}", e))
        })?;

        info!("Loaded {} execution records from history", history.len());
        Ok(history)
    }

    async fn save_history_to_file(&self, history: &[CommandExecution]) -> Result<()> {
        let json = serde_json::to_string_pretty(history).map_err(|e| {
            OrditoError::Storage(format!("Failed to serialize execution history: {}", e))
        })?;

        if let Some(parent) = self.history_file_path.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent).map_err(|e| {
                    OrditoError::Storage(format!("Failed to create history directory: {}", e))
                })?;
            }
        }

        tokio::fs::write(&self.history_file_path, json)
            .await
            .map_err(|e| {
                OrditoError::Storage(format!("Failed to write execution history file: {}", e))
            })?;

        debug!("Saved {} execution records to history file", history.len());
        Ok(())
    }
}

impl Clone for ExecutorService {
    fn clone(&self) -> Self {
        Self {
            running_executions: self.running_executions.clone(),
            execution_history: self.execution_history.clone(),
            history_file_path: self.history_file_path.clone(),
        }
    }
}
