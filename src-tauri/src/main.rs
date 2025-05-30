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
            commands::create_group,
            commands::get_groups,
            commands::delete_group,
            commands::add_command_to_group,
            commands::delete_command_from_group,
            commands::execute_command,
            commands::execute_command_detached,
            commands::execute_group_commands,
            commands::export_data,
            commands::import_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
