use anyhow::Result;
use sqlx::SqlitePool;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::process::Child;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::io::log_storage::LogStorage;

/// Holds information about a running command execution
#[derive(Debug)]
pub struct RunningExecution {
    pub log_id: Uuid,
    pub command_id: Uuid,
    pub started_at: chrono::DateTime<chrono::Utc>,
    pub process: Arc<Mutex<Option<Child>>>,
}

/// Application state shared across all Tauri commands
/// This struct holds the database pool, log storage, and tracks running executions
pub struct AppState {
    /// SQLite database connection pool
    pub pool: SqlitePool,

    /// File-based log storage for command outputs
    pub log_storage: LogStorage,

    /// Map of log_id -> RunningExecution for tracking active command executions
    /// Used to support cancellation and status queries
    pub running_executions: Arc<Mutex<HashMap<Uuid, RunningExecution>>>,
}

impl AppState {
    /// Creates a new AppState instance
    ///
    /// # Arguments
    /// * `pool` - SQLite database connection pool
    /// * `log_storage` - LogStorage instance for managing command output files
    ///
    /// # Returns
    /// A new AppState instance ready to be used with Tauri's state management
    pub fn new(pool: SqlitePool, log_storage: LogStorage) -> Self {
        Self {
            pool,
            log_storage,
            running_executions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Registers a new running execution
    ///
    /// # Arguments
    /// * `log_id` - UUID of the command log entry
    /// * `command_id` - UUID of the command being executed
    pub async fn register_execution(&self, log_id: Uuid, command_id: Uuid) {
        let execution = RunningExecution {
            log_id,
            command_id,
            started_at: chrono::Utc::now(),
            process: Arc::new(Mutex::new(None)),
        };

        let mut executions = self.running_executions.lock().await;
        executions.insert(log_id, execution);
    }

    /// Registers a new running execution with process handle
    ///
    /// # Arguments
    /// * `log_id` - UUID of the command log entry
    /// * `command_id` - UUID of the command being executed
    /// * `process` - The tokio Child process handle
    pub async fn register_execution_with_process(
        &self,
        log_id: Uuid,
        command_id: Uuid,
        process: Child,
    ) {
        let execution = RunningExecution {
            log_id,
            command_id,
            started_at: chrono::Utc::now(),
            process: Arc::new(Mutex::new(Some(process))),
        };

        let mut executions = self.running_executions.lock().await;
        executions.insert(log_id, execution);
    }

    /// Kills a running execution process
    ///
    /// # Arguments
    /// * `log_id` - UUID of the command log entry
    ///
    /// # Returns
    /// Ok(true) if process was killed, Ok(false) if no running process found
    pub async fn kill_execution(&self, log_id: &Uuid) -> Result<bool> {
        let mut executions = self.running_executions.lock().await;
        if let Some(exec) = executions.get_mut(log_id) {
            let mut proc = exec.process.lock().await;
            if let Some(child) = proc.as_mut() {
                child.kill().await?;
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// Unregisters a completed execution
    ///
    /// # Arguments
    /// * `log_id` - UUID of the command log entry to remove
    pub async fn unregister_execution(&self, log_id: &Uuid) {
        let mut executions = self.running_executions.lock().await;
        executions.remove(log_id);
    }

    /// Checks if an execution is currently running
    ///
    /// # Arguments
    /// * `log_id` - UUID of the command log entry to check
    ///
    /// # Returns
    /// true if the execution is running, false otherwise
    pub async fn is_execution_running(&self, log_id: &Uuid) -> bool {
        let executions = self.running_executions.lock().await;
        executions.contains_key(log_id)
    }

    /// Checks if a specific execution is running
    ///
    /// # Arguments
    /// * `log_id` - UUID of the command log entry
    ///
    /// # Returns
    /// true if execution is running
    pub async fn has_execution(&self, log_id: &Uuid) -> bool {
        let executions = self.running_executions.lock().await;
        executions.contains_key(log_id)
    }

    /// Gets the command_id for a running execution
    ///
    /// # Arguments
    /// * `log_id` - UUID of the command log entry
    ///
    /// # Returns
    /// Some(command_id) if found, None otherwise
    pub async fn get_command_id_for_execution(&self, log_id: &Uuid) -> Option<Uuid> {
        let executions = self.running_executions.lock().await;
        executions.get(log_id).map(|exec| exec.command_id)
    }

    /// Gets all currently running execution log IDs
    ///
    /// # Returns
    /// Vector of all running execution log IDs
    pub async fn get_all_running_log_ids(&self) -> Vec<Uuid> {
        let executions = self.running_executions.lock().await;
        executions.keys().copied().collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[tokio::test]
    async fn test_register_and_unregister_execution() {
        // Create mock state (in real tests, you'd use a test database)
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let log_storage = LogStorage::new().await.unwrap();
        let state = AppState::new(pool, log_storage);

        let log_id = Uuid::new_v4();
        let command_id = Uuid::new_v4();

        // Register execution
        state.register_execution(log_id, command_id).await;
        assert!(state.is_execution_running(&log_id).await);

        // Check we can get command_id
        let cmd_id = state.get_command_id_for_execution(&log_id).await;
        assert!(cmd_id.is_some());
        assert_eq!(cmd_id.unwrap(), command_id);

        // Unregister execution
        state.unregister_execution(&log_id).await;
        assert!(!state.is_execution_running(&log_id).await);
    }

    #[tokio::test]
    async fn test_get_all_running_executions() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let log_storage = LogStorage::new().await.unwrap();
        let state = AppState::new(pool, log_storage);

        // Register multiple executions
        let log_id1 = Uuid::new_v4();
        let log_id2 = Uuid::new_v4();
        let command_id = Uuid::new_v4();

        state.register_execution(log_id1, command_id).await;
        state.register_execution(log_id2, command_id).await;

        let running = state.get_all_running_log_ids().await;
        assert_eq!(running.len(), 2);
    }
}
