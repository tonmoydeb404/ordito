// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod state;
mod storage;

use state::AppState;
use storage::load_data;
use tauri::{Manager, State};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Load data on startup
            let app_handle = app.handle();
            let state: State<AppState> = app.state();

            match load_data(&app_handle) {
                Ok(groups) => {
                    let mut app_groups = state.lock().unwrap();
                    *app_groups = groups;
                    println!("Data loaded successfully");
                }
                Err(e) => {
                    println!("Failed to load data: {}", e);
                    // Continue with empty state
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
            commands::execute::execute_group_commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
