#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod notification;
mod scheduler;
mod startup;
mod state;
mod storage;
mod tray;
mod window;

use notification::NotificationManager;
use scheduler::SchedulerManager;
use startup::StartupManager;
use state::{AppState, ScheduleState};
use storage::load_data;
use tauri::{Manager, State};
use tray::TrayManager;
use window::WindowManager;

use tauri_plugin_autostart::MacosLauncher;

fn main() {
    #[cfg(debug_assertions)]
    env_logger::init();

    log::info!("🚀 Setting up application...");

    let args: Vec<String> = std::env::args().collect();
    let started_from_autostart = args.contains(&"--autostart".to_string());

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .setup(move |app| {
            let app_handle = app.handle();
            let group_state: State<AppState> = app.state();
            let schedule_state: State<ScheduleState> = app.state();

            let (groups, schedules) = match load_data(&app_handle) {
                Ok((groups, schedules)) => {
                    {
                        let mut app_groups = group_state.lock().unwrap();
                        *app_groups = groups.clone();
                    }
                    {
                        let mut app_schedules = schedule_state.lock().unwrap();
                        *app_schedules = schedules.clone();
                    }
                    log::info!(
                        "✅ Data loaded: {} groups, {} schedules",
                        groups.len(),
                        schedules.len()
                    );
                    (groups, schedules)
                }
                Err(e) => {
                    log::warn!("⚠️ Failed to load data: {}", e);
                    (
                        std::collections::HashMap::new(),
                        std::collections::HashMap::new(),
                    )
                }
            };

            let scheduler = SchedulerManager::new(app_handle.clone());
            scheduler.load_schedules(schedules);

            let scheduler_clone = scheduler.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = scheduler_clone.start().await {
                    log::error!("❌ Failed to start scheduler: {}", e);
                }
            });

            log::info!("🎯 Creating system tray...");
            if let Err(e) = TrayManager::setup_system_tray(app, &groups) {
                log::error!("❌ Failed to create system tray: {}", e);
            }

            log::info!("🔧 Setting up window background behavior...");
            if let Err(e) = WindowManager::setup_background_behavior(app) {
                log::error!("❌ Failed to setup window behavior: {}", e);
            }

            if started_from_autostart {
                log::info!("🫥 Started from autostart - hiding to tray");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }

                NotificationManager::show_success(
                    &app_handle,
                    "Ordito",
                    "Running in background. Right-click tray icon to access commands.",
                );
            }

            app.manage(scheduler);

            // Setup app shutdown handler to stop scheduler gracefully
            if let Some(window) = app.get_webview_window("main") {
                let scheduler_for_shutdown = app.state::<SchedulerManager>().inner().clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Destroyed = event {
                        scheduler_for_shutdown.stop();
                    }
                });
            }

            log::info!("✅ Application setup complete");
            Ok(())
        })
        .manage(AppState::default())
        .manage(ScheduleState::default())
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
            refresh_tray_menu,
            is_startup_enabled,
            toggle_startup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running orbito");
}

#[tauri::command]
async fn refresh_tray_menu(app_handle: tauri::AppHandle) -> Result<(), String> {
    TrayManager::refresh_tray_menu(app_handle)
}

#[tauri::command]
async fn is_startup_enabled(app_handle: tauri::AppHandle) -> Result<bool, String> {
    StartupManager::is_startup_enabled(&app_handle)
}

#[tauri::command]
async fn toggle_startup(app_handle: tauri::AppHandle) -> Result<bool, String> {
    StartupManager::toggle_startup(&app_handle)
}
