mod app;
mod db;
mod domain;
mod io;

use std::env;
use std::sync::Arc;
use tauri::Manager;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use app::commands::*;
use app::{AppState, SchedulerService};
use io::log_storage::LogStorage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize tracing/logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "ordito=info,tauri=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Determine database path based on environment
            let db_path = if cfg!(debug_assertions) {
                // Development: use .env file or default to ./ordito.db
                env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:./ordito.db".to_string())
            } else {
                // Production: use app data directory
                let app_data_dir = app.path().app_data_dir()
                    .expect("Failed to get app data directory");

                // Create app data directory if it doesn't exist
                std::fs::create_dir_all(&app_data_dir)
                    .expect("Failed to create app data directory");

                let db_file = app_data_dir.join("ordito.db");
                format!("sqlite:{}", db_file.display())
            };

            // Set DATABASE_URL for the db module
            env::set_var("DATABASE_URL", &db_path);

            // Initialize database, log storage, and app state
            let (pool, log_storage) = tauri::async_runtime::block_on(async {
                let pool = db::init_db_pool().await
                    .expect("Failed to initialize database pool");

                db::create_tables(&pool).await
                    .expect("Failed to create database tables");

                let log_storage = LogStorage::new().await
                    .expect("Failed to initialize log storage");

                tracing::info!("Database initialized at: {}", db_path);

                (pool, log_storage)
            });

            // Create app state
            let app_state = AppState::new(pool.clone(), log_storage.clone());

            // Start scheduler service
            let scheduler = SchedulerService::new(Arc::new(pool), Arc::new(log_storage));
            let _scheduler_handle = scheduler.start();

            tracing::info!("Scheduler service started");

            // Manage app state
            app.manage(app_state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Command management
            create_command,
            get_command,
            update_command,
            delete_command,
            list_commands,
            search_commands,
            toggle_favourite,
            get_favourites,
            // Group management
            create_group,
            get_group,
            update_group,
            delete_group,
            list_groups,
            get_root_groups,
            get_children,
            // Schedule management
            create_schedule,
            get_schedule,
            update_schedule,
            delete_schedule,
            list_schedules,
            toggle_notification,
            // Execution
            execute_command,
            cancel_execution,
            // Logs
            get_log,
            list_logs,
            get_running_logs,
            cleanup_old_logs,
            get_log_stats,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
