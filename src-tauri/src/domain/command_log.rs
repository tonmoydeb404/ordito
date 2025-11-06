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

#[derive(Debug)]
pub struct CommandLog {
    pub(crate) id: Uuid,
    pub(crate) command_id: Uuid,
    pub(crate) command_schedule_id: Option<Uuid>,
    pub(crate) status: String,
    pub(crate) exit_code: Option<u32>,
    // output is now stored in files, not in the database
    pub(crate) output: Option<String>,
    pub(crate) working_dir: String,
    pub(crate) run_in_background: bool,
    pub(crate) timeout: Option<u32>,
    pub(crate) env_vars: String,  // JSON string
    pub(crate) started_at: DateTime<Utc>,
    pub(crate) finished_at: Option<DateTime<Utc>>,
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
            output: None,  // Will be loaded from file
            working_dir: row.working_dir,
            run_in_background: row.run_in_background,
            timeout: row.timeout,
            env_vars: row.env_vars,
            started_at: row.started_at,
            finished_at: row.finished_at,
        }
    }
}
