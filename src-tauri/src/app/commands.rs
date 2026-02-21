//! Tauri command handlers for the Ordito application.
//!
//! This module provides all the Tauri commands that the frontend can invoke.
//! Commands are organized into several categories:
//!
//! - **Command Management**: CRUD operations for commands
//! - **Group Management**: CRUD operations for command groups
//! - **Schedule Management**: CRUD operations for scheduled commands
//! - **Execution**: Execute and cancel commands
//! - **Logs**: Query and manage execution logs
//!
//! All commands include input validation using the validation helpers from the error module.

use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

use crate::app::error::{
    validate_command, validate_cron_expression, validate_directory, validate_env_vars,
    validate_timeout, validate_uuid,
};
use crate::app::execution::ExecutionService;
use crate::app::state::AppState;
use crate::db::command::CommandRepository;
use crate::db::command_group::CommandGroupRepository;
use crate::db::command_log::CommandLogRepository;
use crate::db::command_schedule::CommandScheduleRepository;
use crate::domain::{Command, CommandGroup, CommandSchedule};

// ============================================================================
// DTOs (Data Transfer Objects) for Tauri commands
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCommandDto {
    pub command_group_id: String,
    pub title: String,
    pub value: String,
    pub working_dir: String,
    pub timeout: Option<u32>,
    pub run_in_background: bool,
    pub env_vars: String, // JSON string
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCommandDto {
    pub id: String,
    pub command_group_id: String,
    pub title: String,
    pub value: String,
    pub working_dir: String,
    pub timeout: Option<u32>,
    pub run_in_background: bool,
    pub is_favourite: bool,
    pub env_vars: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateGroupDto {
    pub title: String,
    pub parent_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateGroupDto {
    pub id: String,
    pub title: String,
    pub parent_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateScheduleDto {
    pub command_id: String,
    pub cron_expression: String,
    pub show_notification: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateScheduleDto {
    pub id: String,
    pub command_id: String,
    pub cron_expression: String,
    pub show_notification: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResponse {
    pub id: String,
    pub command_group_id: String,
    pub title: String,
    pub value: String,
    pub working_dir: String,
    pub timeout: Option<u32>,
    pub run_in_background: bool,
    pub is_favourite: bool,
    pub env_vars: String,
    pub created_at: String,
    pub updated_at: String,
    pub last_executed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupResponse {
    pub id: String,
    pub title: String,
    pub parent_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScheduleResponse {
    pub id: String,
    pub command_id: String,
    pub cron_expression: String,
    pub show_notification: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogResponse {
    pub id: String,
    pub command_id: String,
    pub command_schedule_id: Option<String>,
    pub status: String,
    pub exit_code: Option<u32>,
    pub output: Option<String>,
    pub working_dir: String,
    pub run_in_background: bool,
    pub timeout: Option<u32>,
    pub env_vars: String,
    pub started_at: String,
    pub finished_at: Option<String>,
}

// ============================================================================
// Command Management Commands
// ============================================================================

#[tauri::command]
pub async fn create_command(
    state: State<'_, AppState>,
    dto: CreateCommandDto,
) -> Result<String, String> {
    // Validate inputs
    let command_group_id =
        validate_uuid(&dto.command_group_id, "command_group_id").map_err(|e| e.to_string())?;

    validate_command(&dto.value).map_err(|e| e.to_string())?;
    validate_directory(&dto.working_dir).map_err(|e| e.to_string())?;
    validate_timeout(dto.timeout).map_err(|e| e.to_string())?;
    validate_env_vars(&dto.env_vars).map_err(|e| e.to_string())?;

    let command = Command {
        id: Uuid::new_v4(),
        command_group_id,
        title: dto.title,
        value: dto.value,
        working_dir: dto.working_dir,
        timeout: dto.timeout,
        run_in_background: dto.run_in_background,
        is_favourite: false,
        env_vars: dto.env_vars,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        last_executed_at: None,
    };

    let repo = CommandRepository::new(&state.pool);
    repo.create(command.clone())
        .await
        .map_err(|e| format!("Failed to create command: {}", e))?;

    Ok(command.id.to_string())
}

#[tauri::command]
pub async fn get_command(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<CommandResponse>, String> {
    let repo = CommandRepository::new(&state.pool);

    let command = repo
        .get_by_id(&id)
        .await
        .map_err(|e| format!("Failed to get command: {}", e))?;

    Ok(command.map(|c| CommandResponse {
        id: c.id.to_string(),
        command_group_id: c.command_group_id.to_string(),
        title: c.title,
        value: c.value,
        working_dir: c.working_dir,
        timeout: c.timeout,
        run_in_background: c.run_in_background,
        is_favourite: c.is_favourite,
        env_vars: c.env_vars,
        created_at: c.created_at.to_rfc3339(),
        updated_at: c.updated_at.to_rfc3339(),
        last_executed_at: c.last_executed_at.map(|dt| dt.to_rfc3339()),
    }))
}

#[tauri::command]
pub async fn update_command(
    state: State<'_, AppState>,
    dto: UpdateCommandDto,
) -> Result<(), String> {
    // Validate inputs
    let id = validate_uuid(&dto.id, "id").map_err(|e| e.to_string())?;
    let command_group_id =
        validate_uuid(&dto.command_group_id, "command_group_id").map_err(|e| e.to_string())?;

    validate_command(&dto.value).map_err(|e| e.to_string())?;
    validate_directory(&dto.working_dir).map_err(|e| e.to_string())?;
    validate_timeout(dto.timeout).map_err(|e| e.to_string())?;
    validate_env_vars(&dto.env_vars).map_err(|e| e.to_string())?;

    let repo = CommandRepository::new(&state.pool);
    let existing = repo
        .get_by_id(&dto.id)
        .await
        .map_err(|e| format!("Failed to get command: {}", e))?
        .ok_or_else(|| "Command not found".to_string())?;

    let command = Command {
        id,
        command_group_id,
        title: dto.title,
        value: dto.value,
        working_dir: dto.working_dir,
        timeout: dto.timeout,
        run_in_background: dto.run_in_background,
        is_favourite: dto.is_favourite,
        env_vars: dto.env_vars,
        created_at: existing.created_at,
        updated_at: Utc::now(),
        last_executed_at: existing.last_executed_at,
    };

    repo.update(command)
        .await
        .map_err(|e| format!("Failed to update command: {}", e))
}

#[tauri::command]
pub async fn delete_command(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let repo = CommandRepository::new(&state.pool);
    repo.delete(&id)
        .await
        .map_err(|e| format!("Failed to delete command: {}", e))
}

#[tauri::command]
pub async fn list_commands(
    state: State<'_, AppState>,
    group_id: Option<String>,
) -> Result<Vec<CommandResponse>, String> {
    let repo = CommandRepository::new(&state.pool);

    let commands = if let Some(gid) = group_id {
        repo.get_by_group_id(&gid).await
    } else {
        repo.get_all().await
    }
    .map_err(|e| format!("Failed to list commands: {}", e))?;

    let responses: Vec<CommandResponse> = commands
        .into_iter()
        .map(|c| CommandResponse {
            id: c.id.to_string(),
            command_group_id: c.command_group_id.to_string(),
            title: c.title,
            value: c.value,
            working_dir: c.working_dir,
            timeout: c.timeout,
            run_in_background: c.run_in_background,
            is_favourite: c.is_favourite,
            env_vars: c.env_vars,
            created_at: c.created_at.to_rfc3339(),
            updated_at: c.updated_at.to_rfc3339(),
            last_executed_at: c.last_executed_at.map(|dt| dt.to_rfc3339()),
        })
        .collect();

    Ok(responses)
}

#[tauri::command]
pub async fn search_commands(
    state: State<'_, AppState>,
    query: String,
) -> Result<Vec<CommandResponse>, String> {
    let repo = CommandRepository::new(&state.pool);
    let commands = repo
        .search_by_title(&query)
        .await
        .map_err(|e| format!("Failed to search commands: {}", e))?;

    Ok(commands
        .into_iter()
        .map(|c| CommandResponse {
            id: c.id.to_string(),
            command_group_id: c.command_group_id.to_string(),
            title: c.title,
            value: c.value,
            working_dir: c.working_dir,
            timeout: c.timeout,
            run_in_background: c.run_in_background,
            is_favourite: c.is_favourite,
            env_vars: c.env_vars,
            created_at: c.created_at.to_rfc3339(),
            updated_at: c.updated_at.to_rfc3339(),
            last_executed_at: c.last_executed_at.map(|dt| dt.to_rfc3339()),
        })
        .collect())
}

#[tauri::command]
pub async fn toggle_favourite(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let repo = CommandRepository::new(&state.pool);
    repo.toggle_favourite(&id)
        .await
        .map_err(|e| format!("Failed to toggle favourite: {}", e))
}

#[tauri::command]
pub async fn get_favourites(state: State<'_, AppState>) -> Result<Vec<CommandResponse>, String> {
    let repo = CommandRepository::new(&state.pool);
    let commands = repo
        .get_favourites()
        .await
        .map_err(|e| format!("Failed to get favourites: {}", e))?;

    Ok(commands
        .into_iter()
        .map(|c| CommandResponse {
            id: c.id.to_string(),
            command_group_id: c.command_group_id.to_string(),
            title: c.title,
            value: c.value,
            working_dir: c.working_dir,
            timeout: c.timeout,
            run_in_background: c.run_in_background,
            is_favourite: c.is_favourite,
            env_vars: c.env_vars,
            created_at: c.created_at.to_rfc3339(),
            updated_at: c.updated_at.to_rfc3339(),
            last_executed_at: c.last_executed_at.map(|dt| dt.to_rfc3339()),
        })
        .collect())
}

// ============================================================================
// Group Management Commands
// ============================================================================

#[tauri::command]
pub async fn create_group(
    state: State<'_, AppState>,
    dto: CreateGroupDto,
) -> Result<String, String> {
    let parent_id = if let Some(pid) = dto.parent_id {
        Some(Uuid::parse_str(&pid).map_err(|e| format!("Invalid parent_id: {}", e))?)
    } else {
        None
    };

    let group = CommandGroup {
        id: Uuid::new_v4(),
        title: dto.title,
        parent_id,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let repo = CommandGroupRepository::new(&state.pool);
    repo.create(group.clone())
        .await
        .map_err(|e| format!("Failed to create group: {}", e))?;

    Ok(group.id.to_string())
}

#[tauri::command]
pub async fn get_group(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<GroupResponse>, String> {
    let repo = CommandGroupRepository::new(&state.pool);
    let group = repo
        .get_by_id(&id)
        .await
        .map_err(|e| format!("Failed to get group: {}", e))?;

    Ok(group.map(|g| GroupResponse {
        id: g.id.to_string(),
        title: g.title,
        parent_id: g.parent_id.map(|p| p.to_string()),
        created_at: g.created_at.to_rfc3339(),
        updated_at: g.updated_at.to_rfc3339(),
    }))
}

#[tauri::command]
pub async fn update_group(state: State<'_, AppState>, dto: UpdateGroupDto) -> Result<(), String> {
    let id = Uuid::parse_str(&dto.id).map_err(|e| format!("Invalid id: {}", e))?;
    let parent_id = if let Some(pid) = dto.parent_id {
        Some(Uuid::parse_str(&pid).map_err(|e| format!("Invalid parent_id: {}", e))?)
    } else {
        None
    };

    let repo = CommandGroupRepository::new(&state.pool);
    let existing = repo
        .get_by_id(&dto.id)
        .await
        .map_err(|e| format!("Failed to get group: {}", e))?
        .ok_or_else(|| "Group not found".to_string())?;

    let group = CommandGroup {
        id,
        title: dto.title,
        parent_id,
        created_at: existing.created_at,
        updated_at: Utc::now(),
    };

    repo.update(group)
        .await
        .map_err(|e| format!("Failed to update group: {}", e))
}

#[tauri::command]
pub async fn delete_group(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let repo = CommandGroupRepository::new(&state.pool);
    repo.delete(&id)
        .await
        .map_err(|e| format!("Failed to delete group: {}", e))
}

#[tauri::command]
pub async fn list_groups(state: State<'_, AppState>) -> Result<Vec<GroupResponse>, String> {
    let repo = CommandGroupRepository::new(&state.pool);
    let groups = repo
        .get_all()
        .await
        .map_err(|e| format!("Failed to list groups: {}", e))?;

    Ok(groups
        .into_iter()
        .map(|g| GroupResponse {
            id: g.id.to_string(),
            title: g.title,
            parent_id: g.parent_id.map(|p| p.to_string()),
            created_at: g.created_at.to_rfc3339(),
            updated_at: g.updated_at.to_rfc3339(),
        })
        .collect())
}

#[tauri::command]
pub async fn get_root_groups(state: State<'_, AppState>) -> Result<Vec<GroupResponse>, String> {
    let repo = CommandGroupRepository::new(&state.pool);
    let groups = repo
        .get_root_groups()
        .await
        .map_err(|e| format!("Failed to get root groups: {}", e))?;

    Ok(groups
        .into_iter()
        .map(|g| GroupResponse {
            id: g.id.to_string(),
            title: g.title,
            parent_id: g.parent_id.map(|p| p.to_string()),
            created_at: g.created_at.to_rfc3339(),
            updated_at: g.updated_at.to_rfc3339(),
        })
        .collect())
}

#[tauri::command]
pub async fn get_children(
    state: State<'_, AppState>,
    parent_id: String,
) -> Result<Vec<GroupResponse>, String> {
    let repo = CommandGroupRepository::new(&state.pool);
    let groups = repo
        .get_children(&parent_id)
        .await
        .map_err(|e| format!("Failed to get children: {}", e))?;

    Ok(groups
        .into_iter()
        .map(|g| GroupResponse {
            id: g.id.to_string(),
            title: g.title,
            parent_id: g.parent_id.map(|p| p.to_string()),
            created_at: g.created_at.to_rfc3339(),
            updated_at: g.updated_at.to_rfc3339(),
        })
        .collect())
}

// ============================================================================
// Schedule Management Commands
// ============================================================================

#[tauri::command]
pub async fn create_schedule(
    state: State<'_, AppState>,
    dto: CreateScheduleDto,
) -> Result<String, String> {
    // Validate inputs
    validate_cron_expression(&dto.cron_expression).map_err(|e| e.to_string())?;
    let command_id = validate_uuid(&dto.command_id, "command_id").map_err(|e| e.to_string())?;

    let schedule = CommandSchedule {
        id: Uuid::new_v4(),
        command_id,
        cron_expression: dto.cron_expression,
        show_notification: dto.show_notification,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let repo = CommandScheduleRepository::new(&state.pool);
    repo.create(schedule.clone())
        .await
        .map_err(|e| format!("Failed to create schedule: {}", e))?;

    Ok(schedule.id.to_string())
}

#[tauri::command]
pub async fn get_schedule(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<ScheduleResponse>, String> {
    let repo = CommandScheduleRepository::new(&state.pool);
    let schedule = repo
        .get_by_id(&id)
        .await
        .map_err(|e| format!("Failed to get schedule: {}", e))?;

    Ok(schedule.map(|s| ScheduleResponse {
        id: s.id.to_string(),
        command_id: s.command_id.to_string(),
        cron_expression: s.cron_expression,
        show_notification: s.show_notification,
        created_at: s.created_at.to_rfc3339(),
        updated_at: s.updated_at.to_rfc3339(),
    }))
}

#[tauri::command]
pub async fn update_schedule(
    state: State<'_, AppState>,
    dto: UpdateScheduleDto,
) -> Result<(), String> {
    // Validate inputs
    validate_cron_expression(&dto.cron_expression).map_err(|e| e.to_string())?;
    let id = validate_uuid(&dto.id, "id").map_err(|e| e.to_string())?;
    let command_id = validate_uuid(&dto.command_id, "command_id").map_err(|e| e.to_string())?;

    let repo = CommandScheduleRepository::new(&state.pool);
    let existing = repo
        .get_by_id(&dto.id)
        .await
        .map_err(|e| format!("Failed to get schedule: {}", e))?
        .ok_or_else(|| "Schedule not found".to_string())?;

    let schedule = CommandSchedule {
        id,
        command_id,
        cron_expression: dto.cron_expression,
        show_notification: dto.show_notification,
        created_at: existing.created_at,
        updated_at: Utc::now(),
    };

    repo.update(schedule)
        .await
        .map_err(|e| format!("Failed to update schedule: {}", e))
}

#[tauri::command]
pub async fn delete_schedule(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let repo = CommandScheduleRepository::new(&state.pool);
    repo.delete(&id)
        .await
        .map_err(|e| format!("Failed to delete schedule: {}", e))
}

#[tauri::command]
pub async fn list_schedules(
    state: State<'_, AppState>,
    command_id: Option<String>,
) -> Result<Vec<ScheduleResponse>, String> {
    let repo = CommandScheduleRepository::new(&state.pool);

    let schedules = if let Some(cid) = command_id {
        repo.get_by_command_id(&cid).await
    } else {
        repo.get_all().await
    }
    .map_err(|e| format!("Failed to list schedules: {}", e))?;

    Ok(schedules
        .into_iter()
        .map(|s| ScheduleResponse {
            id: s.id.to_string(),
            command_id: s.command_id.to_string(),
            cron_expression: s.cron_expression,
            show_notification: s.show_notification,
            created_at: s.created_at.to_rfc3339(),
            updated_at: s.updated_at.to_rfc3339(),
        })
        .collect())
}

#[tauri::command]
pub async fn toggle_notification(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let repo = CommandScheduleRepository::new(&state.pool);
    repo.toggle_notification(&id)
        .await
        .map_err(|e| format!("Failed to toggle notification: {}", e))
}

// ============================================================================
// Execution Commands
// ============================================================================

#[tauri::command]
pub async fn execute_command(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    command_id: String,
) -> Result<String, String> {
    let execution_service = ExecutionService::new(&state.pool, &state.log_storage);

    // Update last_executed_at timestamp
    let command_repo = CommandRepository::new(&state.pool);
    command_repo.update_last_executed(&command_id).await.ok();

    let result = execution_service
        .execute_command(&app, &state, &command_id, None)
        .await
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    Ok(result.log_id.to_string())
}

#[tauri::command]
pub async fn cancel_execution(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    log_id: String,
) -> Result<(), String> {
    let execution_service = ExecutionService::new(&state.pool, &state.log_storage);

    execution_service
        .cancel_execution(&app, &state, &log_id)
        .await
        .map_err(|e| format!("Failed to cancel execution: {}", e))?;

    Ok(())
}

// ============================================================================
// Log Commands
// ============================================================================

#[tauri::command]
pub async fn get_log(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<LogResponse>, String> {
    let repo = CommandLogRepository::new(&state.pool, &state.log_storage);
    let log = repo
        .get_by_id(&id)
        .await
        .map_err(|e| format!("Failed to get log: {}", e))?;

    Ok(log.map(|l| LogResponse {
        id: l.id.to_string(),
        command_id: l.command_id.to_string(),
        command_schedule_id: l.command_schedule_id.map(|s| s.to_string()),
        status: l.status,
        exit_code: l.exit_code,
        output: l.output,
        working_dir: l.working_dir,
        run_in_background: l.run_in_background,
        timeout: l.timeout,
        env_vars: l.env_vars,
        started_at: l.started_at.to_rfc3339(),
        finished_at: l.finished_at.map(|f| f.to_rfc3339()),
    }))
}

#[tauri::command]
pub async fn list_logs(
    state: State<'_, AppState>,
    command_id: Option<String>,
    status: Option<String>,
) -> Result<Vec<LogResponse>, String> {
    let repo = CommandLogRepository::new(&state.pool, &state.log_storage);

    let logs = if let Some(cid) = command_id {
        repo.get_by_command_id(&cid).await
    } else if let Some(s) = status {
        repo.get_by_status(&s).await
    } else {
        repo.get_all().await
    }
    .map_err(|e| format!("Failed to list logs: {}", e))?;

    Ok(logs
        .into_iter()
        .map(|l| LogResponse {
            id: l.id.to_string(),
            command_id: l.command_id.to_string(),
            command_schedule_id: l.command_schedule_id.map(|s| s.to_string()),
            status: l.status,
            exit_code: l.exit_code,
            output: l.output,
            working_dir: l.working_dir,
            run_in_background: l.run_in_background,
            timeout: l.timeout,
            env_vars: l.env_vars,
            started_at: l.started_at.to_rfc3339(),
            finished_at: l.finished_at.map(|f| f.to_rfc3339()),
        })
        .collect())
}

#[tauri::command]
pub async fn get_running_logs(state: State<'_, AppState>) -> Result<Vec<LogResponse>, String> {
    let repo = CommandLogRepository::new(&state.pool, &state.log_storage);
    let logs = repo
        .get_running()
        .await
        .map_err(|e| format!("Failed to get running logs: {}", e))?;

    Ok(logs
        .into_iter()
        .map(|l| LogResponse {
            id: l.id.to_string(),
            command_id: l.command_id.to_string(),
            command_schedule_id: l.command_schedule_id.map(|s| s.to_string()),
            status: l.status,
            exit_code: l.exit_code,
            output: l.output,
            working_dir: l.working_dir,
            run_in_background: l.run_in_background,
            timeout: l.timeout,
            env_vars: l.env_vars,
            started_at: l.started_at.to_rfc3339(),
            finished_at: l.finished_at.map(|f| f.to_rfc3339()),
        })
        .collect())
}

#[tauri::command]
pub async fn cleanup_old_logs(state: State<'_, AppState>, days: i64) -> Result<u64, String> {
    let repo = CommandLogRepository::new(&state.pool, &state.log_storage);
    let count = repo
        .delete_old_logs(days)
        .await
        .map_err(|e| format!("Failed to cleanup old logs: {}", e))?;

    Ok(count)
}

#[tauri::command]
pub async fn get_log_stats(
    state: State<'_, AppState>,
) -> Result<std::collections::HashMap<String, i64>, String> {
    let repo = CommandLogRepository::new(&state.pool, &state.log_storage);

    let mut stats = std::collections::HashMap::new();

    let statuses = vec!["success", "failed", "timeout", "cancelled", "running"];

    for status in statuses {
        let count = repo
            .count_by_status(status)
            .await
            .map_err(|e| format!("Failed to get log stats: {}", e))?;
        stats.insert(status.to_string(), count);
    }

    Ok(stats)
}
