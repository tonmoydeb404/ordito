use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Command {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub command: String,
    pub working_directory: Option<String>,
    pub environment_variables: Vec<EnvironmentVariable>,
    pub group_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_executed: Option<DateTime<Utc>>,
    pub execution_count: u64,
    pub is_favorite: bool,
    pub tags: Vec<String>,
}

impl Command {
    pub fn new(name: String, command: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            description: None,
            command,
            working_directory: None,
            environment_variables: Vec::new(),
            group_id: None,
            created_at: now,
            updated_at: now,
            last_executed: None,
            execution_count: 0,
            is_favorite: false,
            tags: Vec::new(),
        }
    }

    pub fn update(&mut self) {
        self.updated_at = Utc::now();
    }

    pub fn mark_executed(&mut self) {
        self.last_executed = Some(Utc::now());
        self.execution_count += 1;
        self.update();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommandGroup {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub is_favorite: bool,
}

impl CommandGroup {
    pub fn new(name: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            description: None,
            color: None,
            icon: None,
            created_at: now,
            updated_at: now,
            is_favorite: false,
        }
    }

    pub fn update(&mut self) {
        self.updated_at = Utc::now();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct EnvironmentVariable {
    pub key: String,
    pub value: String,
}

impl EnvironmentVariable {
    pub fn new(key: String, value: String) -> Self {
        Self { key, value }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Schedule {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub cron_expression: String,
    pub command_id: Option<Uuid>,
    pub group_id: Option<Uuid>,
    pub is_enabled: bool,
    pub max_executions: Option<u64>,
    pub execution_count: u64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_executed: Option<DateTime<Utc>>,
    pub next_execution: Option<DateTime<Utc>>,
}

impl Schedule {
    pub fn new(name: String, cron_expression: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            description: None,
            cron_expression,
            command_id: None,
            group_id: None,
            is_enabled: true,
            max_executions: None,
            execution_count: 0,
            created_at: now,
            updated_at: now,
            last_executed: None,
            next_execution: None,
        }
    }

    pub fn update(&mut self) {
        self.updated_at = Utc::now();
    }

    pub fn mark_executed(&mut self) {
        self.last_executed = Some(Utc::now());
        self.execution_count += 1;
        self.update();
    }

    pub fn should_execute(&self) -> bool {
        if !self.is_enabled {
            return false;
        }

        if let Some(max) = self.max_executions {
            if self.execution_count >= max {
                return false;
            }
        }

        true
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandExecution {
    pub id: Uuid,
    pub command_id: Uuid,
    pub started_at: DateTime<Utc>,
    pub finished_at: Option<DateTime<Utc>>,
    pub exit_code: Option<i32>,
    pub stdout: String,
    pub stderr: String,
    pub is_running: bool,
}

impl CommandExecution {
    pub fn new(command_id: Uuid) -> Self {
        Self {
            id: Uuid::new_v4(),
            command_id,
            started_at: Utc::now(),
            finished_at: None,
            exit_code: None,
            stdout: String::new(),
            stderr: String::new(),
            is_running: true,
        }
    }

    pub fn finish(&mut self, exit_code: Option<i32>, stdout: String, stderr: String) {
        self.finished_at = Some(Utc::now());
        self.exit_code = exit_code;
        self.stdout = stdout;
        self.stderr = stderr;
        self.is_running = false;
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub commands: Vec<Command>,
    pub groups: Vec<CommandGroup>,
    pub schedules: Vec<Schedule>,
    pub settings: AppSettings,
    pub version: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Default for AppConfig {
    fn default() -> Self {
        let now = Utc::now();
        Self {
            commands: Vec::new(),
            groups: Vec::new(),
            schedules: Vec::new(),
            settings: AppSettings::default(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            created_at: now,
            updated_at: now,
        }
    }
}

impl AppConfig {
    pub fn update(&mut self) {
        self.updated_at = Utc::now();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub auto_start: bool,
    pub minimize_to_tray: bool,
    pub show_notifications: bool,
    pub theme: Theme,
    pub log_level: LogLevel,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            auto_start: false,
            minimize_to_tray: true,
            show_notifications: true,
            theme: Theme::System,
            log_level: LogLevel::Info,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Theme {
    Light,
    Dark,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCommandRequest {
    pub name: String,
    pub description: Option<String>,
    pub command: String,
    pub working_directory: Option<String>,
    pub environment_variables: Vec<EnvironmentVariable>,
    pub group_id: Option<Uuid>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCommandRequest {
    pub id: Uuid,
    pub name: Option<String>,
    pub description: Option<String>,
    pub command: Option<String>,
    pub working_directory: Option<String>,
    pub environment_variables: Option<Vec<EnvironmentVariable>>,
    pub group_id: Option<Uuid>,
    pub is_favorite: Option<bool>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateGroupRequest {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateGroupRequest {
    pub id: Uuid,
    pub name: Option<String>,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub is_favorite: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateScheduleRequest {
    pub name: String,
    pub description: Option<String>,
    pub cron_expression: String,
    pub command_id: Option<Uuid>,
    pub group_id: Option<Uuid>,
    pub max_executions: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateScheduleRequest {
    pub id: Uuid,
    pub name: Option<String>,
    pub description: Option<String>,
    pub cron_expression: Option<String>,
    pub command_id: Option<Uuid>,
    pub group_id: Option<Uuid>,
    pub is_enabled: Option<bool>,
    pub max_executions: Option<u64>,
}