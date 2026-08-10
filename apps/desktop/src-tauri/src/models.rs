use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum CommandStatus {
    Idle,
    Running,
    Success,
    Failed,
}

impl CommandStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            CommandStatus::Idle => "idle",
            CommandStatus::Running => "running",
            CommandStatus::Success => "success",
            CommandStatus::Failed => "failed",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "running" => CommandStatus::Running,
            "success" => CommandStatus::Success,
            "failed" => CommandStatus::Failed,
            _ => CommandStatus::Idle,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RunStatus {
    Running,
    Success,
    Failed,
}

impl RunStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            RunStatus::Running => "running",
            RunStatus::Success => "success",
            RunStatus::Failed => "failed",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "success" => RunStatus::Success,
            "failed" => RunStatus::Failed,
            _ => RunStatus::Running,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RunMode {
    Background,
    Foreground,
}

impl RunMode {
    pub fn as_str(&self) -> &'static str {
        match self {
            RunMode::Background => "background",
            RunMode::Foreground => "foreground",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "foreground" => RunMode::Foreground,
            _ => RunMode::Background,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ScheduleMode {
    Once,
    Recurring,
}

impl ScheduleMode {
    pub fn as_str(&self) -> &'static str {
        match self {
            ScheduleMode::Once => "once",
            ScheduleMode::Recurring => "recurring",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "recurring" => ScheduleMode::Recurring,
            _ => ScheduleMode::Once,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandGroup {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub position: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Command {
    pub id: String,
    pub group_id: String,
    pub name: String,
    pub command: String,
    pub cwd: String,
    pub requires_confirmation: bool,
    pub run_in_background: bool,
    pub last_run_status: CommandStatus,
    pub last_run_at: Option<String>,
    pub icon: Option<String>,
    pub position: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Run {
    pub id: String,
    pub command_id: String,
    pub status: RunStatus,
    pub mode: RunMode,
    pub started_at: String,
    pub finished_at: Option<String>,
    pub duration_ms: Option<i64>,
    pub exit_code: Option<i32>,
    pub output_preview: String,
    pub output_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
    pub id: String,
    pub command_id: String,
    pub enabled: bool,
    pub mode: ScheduleMode,
    pub cron_expr: Option<String>,
    pub run_at: Option<String>,
    pub label: String,
    pub next_run_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CommandInput {
    pub name: String,
    pub command: String,
    pub cwd: String,
    pub group_id: String,
    pub requires_confirmation: bool,
    pub run_in_background: bool,
    pub icon: Option<String>,
    pub position: Option<i32>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct GroupInput {
    pub name: String,
    pub icon: Option<String>,
    pub position: Option<i32>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ScheduleInput {
    pub command_id: String,
    pub mode: ScheduleMode,
    pub cron_expr: Option<String>,
    pub run_at: Option<String>,
    pub label: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct StatusChangedPayload {
    pub command_id: String,
    pub last_run_status: CommandStatus,
}

#[derive(Debug, Clone, Serialize)]
pub struct RunCompletedPayload {
    pub run: Run,
    pub command_id: String,
    pub last_run_status: CommandStatus,
}

#[derive(Debug, Clone)]
pub struct RunCompletion {
    pub status: RunStatus,
    pub finished_at: String,
    pub duration_ms: i64,
    pub exit_code: Option<i32>,
    pub output_preview: String,
    pub output_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigExport {
    pub groups: Vec<CommandGroup>,
    pub commands: Vec<Command>,
    pub schedules: Vec<Schedule>,
}
