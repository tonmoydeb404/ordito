#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod notification;
mod startup;
mod state;
mod storage;
mod tray;
mod window;

use notification::NotificationManager;
use startup::StartupManager;
use state::AppState;
use storage::load_data;
use tauri::{Manager, State};
use tray::TrayManager;
use window::WindowManager;

use tauri_plugin_autostart::MacosLauncher;

fn main() {
    // Initialize logging (only in debug builds)
    #[cfg(debug_assertions)]
    env_logger::init();

    log::info!("🚀 Setting up application...");

    // Check if app was started via autostart (check for the flag we set)
    let args: Vec<String> = std::env::args().collect();
    let started_from_autostart = args.contains(&"--autostart".to_string());

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]), // Pass autostart flag
        ))
        .setup(move |app| {
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
            if let Err(e) = TrayManager::setup_system_tray(app, &groups) {
                log::error!("❌ Failed to create system tray: {}", e);
            }

            // Setup window background behavior
            log::info!("🔧 Setting up window background behavior...");
            if let Err(e) = WindowManager::setup_background_behavior(app) {
                log::error!("❌ Failed to setup window behavior: {}", e);
            }

            // If started from autostart, hide window and show notification
            if started_from_autostart {
                log::info!("🫥 Started from autostart - hiding to tray");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }

                // Show brief startup notification
                NotificationManager::show_success(
                    &app_handle,
                    "Ordito",
                    "Running in background. Right-click tray icon to access commands.",
                );
            }

            log::info!("✅ Application setup complete");
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
            // Startup commands
            is_startup_enabled,
            toggle_startup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running orbito");
}
/// Tauri command to refresh tray menu from frontend
#[tauri::command]
async fn refresh_tray_menu(app_handle: tauri::AppHandle) -> Result<(), String> {
    TrayManager::refresh_tray_menu(app_handle)
}

/// Tauri command to check if startup is enabled
#[tauri::command]
async fn is_startup_enabled(app_handle: tauri::AppHandle) -> Result<bool, String> {
    StartupManager::is_startup_enabled(&app_handle)
}

/// Tauri command to toggle startup setting
#[tauri::command]
async fn toggle_startup(app_handle: tauri::AppHandle) -> Result<bool, String> {
    StartupManager::toggle_startup(&app_handle)
}
