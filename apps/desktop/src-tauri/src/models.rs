use std::collections::HashMap;

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

#[derive(Debug, Clone, Deserialize)]
pub struct LegacyConfig {
    #[serde(default)]
    pub groups: HashMap<String, LegacyGroup>,
    #[serde(default)]
    pub schedules: HashMap<String, LegacySchedule>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LegacyGroup {
    #[serde(default)]
    pub id: String,
    pub title: String,
    #[serde(default)]
    pub commands: Vec<LegacyCommand>,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LegacyCommand {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub label: String,
    #[serde(default)]
    pub cmd: String,
    #[serde(default)]
    pub is_detached: bool,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LegacySchedule {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub command_id: String,
    #[serde(default)]
    pub cron_expression: String,
    #[serde(default)]
    pub is_active: bool,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub next_execution: Option<String>,
}

impl LegacyConfig {
    pub fn into_config(self) -> ConfigExport {
        let mut groups: Vec<CommandGroup> = Vec::new();
        let mut commands: Vec<Command> = Vec::new();
        let mut command_names: HashMap<String, String> = HashMap::new();

        let mut legacy_groups: Vec<LegacyGroup> = self.groups.into_values().collect();
        legacy_groups.sort_by(|a, b| a.created_at.cmp(&b.created_at));

        for (g_idx, group) in legacy_groups.into_iter().enumerate() {
            let group_id = if group.id.is_empty() {
                g_idx.to_string()
            } else {
                group.id.clone()
            };

            groups.push(CommandGroup {
                id: group_id.clone(),
                name: group.title,
                icon: None,
                position: g_idx as i32,
                created_at: group.created_at.clone(),
                updated_at: group.updated_at,
            });

            let mut legacy_cmds = group.commands;
            legacy_cmds.sort_by(|a, b| a.created_at.cmp(&b.created_at));

            for (c_idx, cmd) in legacy_cmds.into_iter().enumerate() {
                command_names.insert(cmd.id.clone(), cmd.label.clone());
                commands.push(Command {
                    id: cmd.id,
                    group_id: group_id.clone(),
                    name: cmd.label,
                    command: cmd.cmd,
                    cwd: String::new(),
                    requires_confirmation: false,
                    run_in_background: cmd.is_detached,
                    last_run_status: CommandStatus::Idle,
                    last_run_at: None,
                    icon: None,
                    position: c_idx as i32,
                    created_at: cmd.created_at,
                    updated_at: cmd.updated_at,
                });
            }
        }

        let schedules: Vec<Schedule> = self
            .schedules
            .into_values()
            .map(|s| {
                let cron = s.cron_expression.trim().to_string();
                let mode = if cron.is_empty() {
                    ScheduleMode::Once
                } else {
                    ScheduleMode::Recurring
                };
                let label = command_names
                    .get(&s.command_id)
                    .cloned()
                    .unwrap_or_default();
                Schedule {
                    id: s.id,
                    command_id: s.command_id,
                    enabled: s.is_active,
                    mode,
                    cron_expr: if cron.is_empty() { None } else { Some(cron) },
                    run_at: None,
                    label,
                    next_run_at: s.next_execution,
                    created_at: s.created_at.clone(),
                    updated_at: s.created_at,
                }
            })
            .collect();

        ConfigExport {
            groups,
            commands,
            schedules,
        }
    }
}
