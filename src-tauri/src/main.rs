#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod core;
mod error;
mod models;
mod state;
mod system;

use crate::core::scheduler::SchedulerManager;
use crate::core::storage::load_data;
use crate::system::notification::NotificationManager;
use crate::system::tray::TrayManager;
use crate::system::window::WindowManager;
use state::{AppState, ScheduleState};

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;

fn main() {
    #[cfg(debug_assertions)]
    env_logger::init();

    log::info!("Setting up application...");

    let args: Vec<String> = std::env::args().collect();
    let started_from_autostart = args.contains(&"--autostart".to_string());

    let schedule_state: ScheduleState = Arc::new(Mutex::new(HashMap::new()));
    let schedule_state_for_scheduler = Arc::clone(&schedule_state);

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .manage(AppState::default())
        .manage(schedule_state)
        .setup(move |app| {
            let app_handle = app.handle();

            let (groups, schedules) = load_data(&app_handle).unwrap_or_else(|e| {
                log::warn!("Failed to load data: {}", e);
                (HashMap::new(), HashMap::new())
            });

            // Populate states
            if let Ok(mut g) = app.state::<AppState>().lock() {
                *g = groups.clone();
            }
            if let Ok(mut s) = schedule_state_for_scheduler.lock() {
                *s = schedules;
            }

            log::info!("Data loaded: {} groups", groups.len());

            // Start scheduler with shared schedule state
            let scheduler = SchedulerManager::new(
                app_handle.clone(),
                Arc::clone(&schedule_state_for_scheduler),
            );

            let scheduler_clone = scheduler.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = scheduler_clone.start().await {
                    log::error!("Failed to start scheduler: {}", e);
                }
            });

            if let Err(e) = TrayManager::setup_system_tray(app, &groups) {
                log::error!("Failed to create system tray: {}", e);
            }

            if let Err(e) = WindowManager::setup_background_behavior(app) {
                log::error!("Failed to setup window behavior: {}", e);
            }

            if started_from_autostart {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
                NotificationManager::show(
                    &app_handle,
                    "Ordito",
                    "Running in background. Right-click tray icon to access commands.",
                );
            }

            app.manage(scheduler.clone());

            if let Some(window) = app.get_webview_window("main") {
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Destroyed = event {
                        scheduler.stop();
                    }
                });
            }

            log::info!("Application setup complete");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::group::create_group,
            commands::group::get_groups,
            commands::group::delete_group,
            commands::group::update_group,
            commands::group::export_data,
            commands::group::import_data,
            commands::command::add_command_to_group,
            commands::command::delete_command_from_group,
            commands::command::update_command,
            commands::execute::execute_command,
            commands::execute::execute_command_detached,
            commands::execute::execute_group_commands,
            commands::schedule::create_schedule,
            commands::schedule::get_schedules,
            commands::schedule::delete_schedule,
            commands::schedule::update_schedule,
            commands::schedule::toggle_schedule,
            commands::schedule::get_schedule_info,
            commands::schedule::get_schedules_with_info,
            commands::schedule::validate_cron_expression_command,
            commands::tray::refresh_tray_menu,
            commands::startup::is_startup_enabled,
            commands::startup::toggle_startup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running ordito");
}
