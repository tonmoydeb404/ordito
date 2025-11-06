mod app;
mod db;
mod domain;
mod io;

use std::env;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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

            // Initialize database and create tables
            tauri::async_runtime::block_on(async {
                let pool = db::init_db_pool().await
                    .expect("Failed to initialize database pool");

                db::create_tables(&pool).await
                    .expect("Failed to create database tables");

                println!("Database initialized at: {}", db_path);
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
