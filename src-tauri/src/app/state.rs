use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::io::log_storage::LogStorage;

/// Holds information about a running command execution
#[derive(Debug, Clone)]
pub struct RunningExecution {
    pub log_id: Uuid,
    pub command_id: Uuid,
    pub started_at: chrono::DateTime<chrono::Utc>,
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
        };

        let mut executions = self.running_executions.lock().await;
        executions.insert(log_id, execution);
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

    /// Gets information about a running execution
    ///
    /// # Arguments
    /// * `log_id` - UUID of the command log entry
    ///
    /// # Returns
    /// Some(RunningExecution) if found, None otherwise
    pub async fn get_execution(&self, log_id: &Uuid) -> Option<RunningExecution> {
        let executions = self.running_executions.lock().await;
        executions.get(log_id).cloned()
    }

    /// Gets all currently running executions
    ///
    /// # Returns
    /// Vector of all running executions
    pub async fn get_all_running_executions(&self) -> Vec<RunningExecution> {
        let executions = self.running_executions.lock().await;
        executions.values().cloned().collect()
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

        // Check we can get it
        let execution = state.get_execution(&log_id).await;
        assert!(execution.is_some());
        assert_eq!(execution.unwrap().command_id, command_id);

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

        let running = state.get_all_running_executions().await;
        assert_eq!(running.len(), 2);
    }
}
