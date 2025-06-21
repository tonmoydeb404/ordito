use chrono::{DateTime, Local};
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
    pub command_id: Option<String>,
    pub cron_expression: String, // New: replaces scheduled_time + recurrence
    pub is_active: bool,
    pub created_at: DateTime<Local>,
    pub last_execution: Option<DateTime<Local>>,
    pub next_execution: DateTime<Local>,
    pub execution_count: u32,
    pub max_executions: Option<u32>,
}
