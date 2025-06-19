use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommandItem {
    pub id: String,
    pub label: String,
    pub cmd: String,
    pub is_detached: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommandGroup {
    pub id: String,
    pub title: String,
    pub commands: Vec<CommandItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppData {
    pub groups: HashMap<String, CommandGroup>,
    pub schedules: Option<HashMap<String, Schedule>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Schedule {
    pub id: String,
    pub group_id: String,
    pub command_id: String,
    pub scheduled_time: DateTime<Utc>,
    pub recurrence: RecurrencePattern,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub last_execution: Option<DateTime<Utc>>,
    pub next_execution: DateTime<Utc>,
    pub execution_count: u32,
    pub max_executions: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum RecurrencePattern {
    Once,
    Daily,
    Weekly,
    Monthly,
    Custom { interval_minutes: u32 },
}
