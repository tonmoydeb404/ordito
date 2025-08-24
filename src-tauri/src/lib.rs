pub mod commands;
pub mod config;
pub mod error;
pub mod models;
pub mod scheduler;
pub mod services;
pub mod storage;
pub mod tray;
pub mod utils;

pub use error::Result;

use commands::*;
use services::{AppService, NotificationService};
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter("ordito=debug,tauri=info")
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .setup(move |app| {
            tray::setup_system_tray(app)?;

            // Create app service and notification service
            let app_service = Arc::new(AppService::new());
            let notification_service = Arc::new(NotificationService::new(app.handle().clone()));

            // Initialize notifications
            let notification_service_clone = notification_service.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = notification_service_clone.initialize().await {
                    tracing::warn!("Failed to initialize notifications: {}", e);
                }
            });

            // Store notification service reference for later use
            app.manage(notification_service);
            app.manage(app_service.clone());

            // Start scheduler
            let scheduler_service_clone = app_service.scheduler().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = scheduler_service_clone.start().await {
                    tracing::error!("Failed to start scheduler: {}", e);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_commands,
            create_command,
            update_command,
            delete_command,
            execute_command,
            get_command_groups,
            get_command_groups_with_count,
            get_command_group_by_id,
            create_command_group,
            update_command_group,
            delete_command_group,
            execute_command_group,
            get_schedules,
            create_schedule,
            update_schedule,
            delete_schedule,
            toggle_schedule,
            get_execution_status,
            get_running_executions,
            get_execution_history,
            kill_execution,
            search_commands,
            get_favorite_commands,
            get_commands_by_group,
            get_next_scheduled_executions,
            import_config,
            export_config,
            validate_cron_expression,
            get_app_info,
            send_test_notification,
            check_notification_permission,
            request_notification_permission
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
