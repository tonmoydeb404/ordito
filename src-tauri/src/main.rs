// src/main.rs - Updated with notification module
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod notification; // Add notification module
mod state;
mod storage;
mod tray;

use state::AppState;
use storage::load_data;
use tauri::{Manager, State};
use tray::TrayManager;

fn main() {
    // Initialize logging (only in debug builds)
    #[cfg(debug_assertions)]
    env_logger::init();

    log::info!("🚀 Setting up application...");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // Load data on startup
            let app_handle = app.handle();
            let state: State<AppState> = app.state();

            let groups = match load_data(&app_handle) {
                Ok(groups) => {
                    let mut app_groups = state.lock().unwrap();
                    *app_groups = groups.clone();
                    log::info!("✅ Data loaded successfully: {} groups", groups.len());
                    groups
                }
                Err(e) => {
                    log::warn!("⚠️ Failed to load data: {}", e);
                    std::collections::HashMap::new()
                }
            };

            // Setup system tray
            log::info!("🎯 Creating system tray...");
            match TrayManager::setup_system_tray(app, &groups) {
                Ok(_) => log::info!("✅ System tray created successfully"),
                Err(e) => {
                    log::error!("❌ Failed to create system tray: {}", e);
                }
            }

            Ok(())
        })
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            // Group commands
            commands::group::create_group,
            commands::group::get_groups,
            commands::group::delete_group,
            commands::group::update_group,
            commands::group::export_data,
            commands::group::import_data,
            // Command commands
            commands::command::add_command_to_group,
            commands::command::delete_command_from_group,
            commands::command::update_command,
            // Execute commands
            commands::execute::execute_command,
            commands::execute::execute_command_detached,
            commands::execute::execute_group_commands,
            // Tray commands
            refresh_tray_menu,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Tauri command to refresh tray menu from frontend
#[tauri::command]
async fn refresh_tray_menu(app_handle: tauri::AppHandle) -> Result<(), String> {
    TrayManager::refresh_tray_menu(app_handle)
}
