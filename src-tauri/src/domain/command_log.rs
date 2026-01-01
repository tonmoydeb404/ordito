use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::Type)]
#[sqlx(type_name = "TEXT")]
pub enum CommandLogStatus {
    Success,
    Failed,
    Timeout,
    Cancelled,
    Running,
}

impl CommandLogStatus {
    /// Converts the enum to its string representation (lowercase)
    pub fn to_string(&self) -> String {
        match self {
            CommandLogStatus::Success => "success".to_string(),
            CommandLogStatus::Failed => "failed".to_string(),
            CommandLogStatus::Timeout => "timeout".to_string(),
            CommandLogStatus::Cancelled => "cancelled".to_string(),
            CommandLogStatus::Running => "running".to_string(),
        }
    }

    /// Parses a string into CommandLogStatus
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "success" => Some(CommandLogStatus::Success),
            "failed" => Some(CommandLogStatus::Failed),
            "timeout" => Some(CommandLogStatus::Timeout),
            "cancelled" => Some(CommandLogStatus::Cancelled),
            "running" => Some(CommandLogStatus::Running),
            _ => None,
        }
    }
}

#[derive(Debug, Clone)]
pub struct CommandLog {
    pub id: Uuid,
    pub command_id: Uuid,
    pub command_schedule_id: Option<Uuid>,
    pub status: String,
    pub exit_code: Option<u32>,
    // output is now stored in files, not in the database
    pub output: Option<String>,
    pub working_dir: String,
    pub run_in_background: bool,
    pub timeout: Option<u32>,
    pub env_vars: String, // JSON string
    pub started_at: DateTime<Utc>,
    pub finished_at: Option<DateTime<Utc>>,
}

// Internal struct for database operations (without output field)
#[derive(Debug, sqlx::FromRow)]
pub(crate) struct CommandLogRow {
    pub id: Uuid,
    pub command_id: Uuid,
    pub command_schedule_id: Option<Uuid>,
    pub status: String,
    pub exit_code: Option<u32>,
    pub working_dir: String,
    pub run_in_background: bool,
    pub timeout: Option<u32>,
    pub env_vars: String,
    pub started_at: DateTime<Utc>,
    pub finished_at: Option<DateTime<Utc>>,
}

impl From<CommandLogRow> for CommandLog {
    fn from(row: CommandLogRow) -> Self {
        CommandLog {
            id: row.id,
            command_id: row.command_id,
            command_schedule_id: row.command_schedule_id,
            status: row.status,
            exit_code: row.exit_code,
            output: None, // Will be loaded from file
            working_dir: row.working_dir,
            run_in_background: row.run_in_background,
            timeout: row.timeout,
            env_vars: row.env_vars,
            started_at: row.started_at,
            finished_at: row.finished_at,
        }
    }
}
