use crate::error::{OrditoError, Result};
use crate::models::*;
use crate::services::{AppService, NotificationService};
use std::sync::Arc;
use tauri::State;
use tracing::{debug, info};
use uuid::Uuid;

#[tauri::command]
pub async fn get_commands(app_service: State<'_, Arc<AppService>>) -> Result<Vec<Command>> {
    debug!("Getting all commands");
    app_service.commands().get_commands().await
}

#[tauri::command]
pub async fn create_command(
    app_service: State<'_, Arc<AppService>>,
    request: CreateCommandRequest,
) -> Result<Command> {
    info!("Creating command: {}", request.name);
    app_service.commands().create_command(request).await
}

#[tauri::command]
pub async fn update_command(
    app_service: State<'_, Arc<AppService>>,
    request: UpdateCommandRequest,
) -> Result<Command> {
    info!("Updating command: {}", request.id);
    app_service.commands().update_command(request).await
}

#[tauri::command]
pub async fn delete_command(app_service: State<'_, Arc<AppService>>, id: String) -> Result<()> {
    let uuid =
        Uuid::parse_str(&id).map_err(|_| OrditoError::Command("Invalid command ID".to_string()))?;
    info!("Deleting command: {}", uuid);
    app_service.commands().delete_command(uuid).await
}

#[tauri::command]
pub async fn execute_command(
    app_service: State<'_, Arc<AppService>>,
    id: String,
    detached: Option<bool>,
) -> Result<String> {
    let uuid =
        Uuid::parse_str(&id).map_err(|_| OrditoError::Command("Invalid command ID".to_string()))?;
    let detached = detached.unwrap_or(false);

    info!("Executing command: {} (detached: {})", uuid, detached);
    let execution_id = app_service
        .commands()
        .execute_command(uuid, detached)
        .await?;
    Ok(execution_id.to_string())
}

#[tauri::command]
pub async fn get_command_groups(
    app_service: State<'_, Arc<AppService>>,
) -> Result<Vec<CommandGroup>> {
    debug!("Getting all command groups");
    app_service.commands().get_command_groups().await
}

#[tauri::command]
pub async fn get_command_groups_with_count(
    app_service: State<'_, Arc<AppService>>,
) -> Result<Vec<CommandGroupWithCount>> {
    debug!("Getting all command groups with commands count");
    app_service.commands().get_command_groups_with_count().await
}

#[tauri::command]
pub async fn get_command_group_by_id(
    app_service: State<'_, Arc<AppService>>,
    id: String,
) -> Result<Option<CommandGroup>> {
    let uuid =
        Uuid::parse_str(&id).map_err(|_| OrditoError::Command("Invalid group ID".to_string()))?;
    debug!("Getting command group by ID: {}", uuid);
    app_service.commands().get_command_group_by_id(uuid).await
}

#[tauri::command]
pub async fn create_command_group(
    app_service: State<'_, Arc<AppService>>,
    request: CreateGroupRequest,
) -> Result<CommandGroup> {
    info!("Creating command group: {}", request.name);
    app_service.commands().create_command_group(request).await
}

#[tauri::command]
pub async fn update_command_group(
    app_service: State<'_, Arc<AppService>>,
    request: UpdateGroupRequest,
) -> Result<CommandGroup> {
    info!("Updating command group: {}", request.id);
    app_service.commands().update_command_group(request).await
}

#[tauri::command]
pub async fn delete_command_group(
    app_service: State<'_, Arc<AppService>>,
    id: String,
) -> Result<()> {
    let uuid =
        Uuid::parse_str(&id).map_err(|_| OrditoError::Command("Invalid group ID".to_string()))?;
    info!("Deleting command group: {}", uuid);
    app_service.commands().delete_command_group(uuid).await
}

#[tauri::command]
pub async fn execute_command_group(
    app_service: State<'_, Arc<AppService>>,
    id: String,
    detached: Option<bool>,
) -> Result<Vec<String>> {
    let uuid =
        Uuid::parse_str(&id).map_err(|_| OrditoError::Command("Invalid group ID".to_string()))?;
    let detached = detached.unwrap_or(false);

    info!("Executing command group: {} (detached: {})", uuid, detached);
    let execution_ids = app_service
        .commands()
        .execute_command_group(uuid, detached)
        .await?;
    Ok(execution_ids.into_iter().map(|id| id.to_string()).collect())
}

#[tauri::command]
pub async fn get_schedules(app_service: State<'_, Arc<AppService>>) -> Result<Vec<Schedule>> {
    debug!("Getting all schedules");
    app_service.scheduler().get_schedules().await
}

#[tauri::command]
pub async fn create_schedule(
    app_service: State<'_, Arc<AppService>>,
    request: CreateScheduleRequest,
) -> Result<Schedule> {
    info!("Creating schedule: {}", request.name);
    app_service.scheduler().create_schedule(request).await
}

#[tauri::command]
pub async fn update_schedule(
    app_service: State<'_, Arc<AppService>>,
    request: UpdateScheduleRequest,
) -> Result<Schedule> {
    info!("Updating schedule: {}", request.id);
    app_service.scheduler().update_schedule(request).await
}

#[tauri::command]
pub async fn delete_schedule(app_service: State<'_, Arc<AppService>>, id: String) -> Result<()> {
    let uuid = Uuid::parse_str(&id)
        .map_err(|_| OrditoError::Scheduler("Invalid schedule ID".to_string()))?;
    info!("Deleting schedule: {}", uuid);
    app_service.scheduler().delete_schedule(uuid).await
}

#[tauri::command]
pub async fn toggle_schedule(
    app_service: State<'_, Arc<AppService>>,
    id: String,
) -> Result<Schedule> {
    let uuid = Uuid::parse_str(&id)
        .map_err(|_| OrditoError::Scheduler("Invalid schedule ID".to_string()))?;
    info!("Toggling schedule: {}", uuid);
    app_service.scheduler().toggle_schedule(uuid).await
}

#[tauri::command]
pub async fn get_execution_status(
    app_service: State<'_, Arc<AppService>>,
    execution_id: String,
) -> Result<Option<CommandExecution>> {
    let uuid = Uuid::parse_str(&execution_id)
        .map_err(|_| OrditoError::Command("Invalid execution ID".to_string()))?;
    debug!("Getting execution status: {}", uuid);
    app_service.executor().get_execution_status(uuid).await
}

#[tauri::command]
pub async fn get_running_executions(
    app_service: State<'_, Arc<AppService>>,
) -> Result<Vec<CommandExecution>> {
    debug!("Getting running executions");
    Ok(app_service.executor().get_running_executions().await)
}

#[tauri::command]
pub async fn get_execution_history(
    app_service: State<'_, Arc<AppService>>,
    limit: Option<usize>,
) -> Result<Vec<CommandExecution>> {
    debug!("Getting execution history (limit: {:?})", limit);
    Ok(app_service.executor().get_execution_history(limit).await)
}

#[tauri::command]
pub async fn kill_execution(
    app_service: State<'_, Arc<AppService>>,
    execution_id: String,
) -> Result<()> {
    let uuid = Uuid::parse_str(&execution_id)
        .map_err(|_| OrditoError::Command("Invalid execution ID".to_string()))?;
    info!("Killing execution: {}", uuid);
    app_service.executor().kill_execution(uuid).await
}

#[tauri::command]
pub async fn search_commands(
    app_service: State<'_, Arc<AppService>>,
    query: String,
) -> Result<Vec<Command>> {
    debug!("Searching commands with query: {}", query);
    app_service.commands().search_commands(&query).await
}

#[tauri::command]
pub async fn get_favorite_commands(
    app_service: State<'_, Arc<AppService>>,
) -> Result<Vec<Command>> {
    debug!("Getting favorite commands");
    app_service.commands().get_favorite_commands().await
}

#[tauri::command]
pub async fn get_commands_by_group(
    app_service: State<'_, Arc<AppService>>,
    group_id: Option<String>,
) -> Result<Vec<Command>> {
    let uuid = if let Some(id) = group_id {
        Some(
            Uuid::parse_str(&id)
                .map_err(|_| OrditoError::Command("Invalid group ID".to_string()))?,
        )
    } else {
        None
    };
    debug!("Getting commands by group: {:?}", uuid);
    app_service.commands().get_commands_by_group(uuid).await
}

#[tauri::command]
pub async fn get_next_scheduled_executions(
    app_service: State<'_, Arc<AppService>>,
    limit: Option<usize>,
) -> Result<Vec<(String, chrono::DateTime<chrono::Utc>)>> {
    let limit = limit.unwrap_or(10);
    debug!("Getting next {} scheduled executions", limit);
    let executions = app_service.scheduler().get_next_executions(limit).await?;
    Ok(executions
        .into_iter()
        .map(|(id, time)| (id.to_string(), time))
        .collect())
}

#[tauri::command]
pub async fn import_config(
    app_service: State<'_, Arc<AppService>>,
    config_json: String,
) -> Result<()> {
    info!("Importing configuration");
    let config: AppConfig = serde_json::from_str(&config_json)
        .map_err(|e| OrditoError::Config(format!("Invalid configuration format: {}", e)))?;

    let mut storage = app_service.storage().write().await;
    storage.import_config(config).await?;

    info!("Configuration imported successfully");
    Ok(())
}

#[tauri::command]
pub async fn export_config(app_service: State<'_, Arc<AppService>>) -> Result<String> {
    info!("Exporting configuration");
    let storage = app_service.storage().read().await;
    let config = storage.export_config();
    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| OrditoError::Config(format!("Failed to serialize configuration: {}", e)))?;

    info!("Configuration exported successfully");
    Ok(json)
}

#[tauri::command]
pub async fn validate_cron_expression(expression: String) -> Result<bool> {
    debug!("Validating cron expression: {}", expression);
    match crate::utils::validate_cron_expression(&expression) {
        Ok(()) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub async fn get_app_info() -> Result<serde_json::Value> {
    debug!("Getting app info");
    Ok(serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "name": env!("CARGO_PKG_NAME"),
        "description": env!("CARGO_PKG_DESCRIPTION")
    }))
}

#[tauri::command]
pub async fn send_test_notification(
    notification_service: State<'_, Arc<NotificationService>>,
    title: String,
    body: String,
) -> Result<()> {
    debug!("Sending test notification: {}", title);
    notification_service.send_custom_notification(&title, &body, Some("🔔"), None)
}

#[tauri::command]
pub async fn check_notification_permission(
    notification_service: State<'_, Arc<NotificationService>>,
) -> Result<bool> {
    debug!("Checking notification permission");
    Ok(notification_service.is_permission_granted())
}

#[tauri::command]
pub async fn request_notification_permission(
    notification_service: State<'_, Arc<NotificationService>>,
) -> Result<()> {
    debug!("Requesting notification permission");
    notification_service.initialize().await
}
