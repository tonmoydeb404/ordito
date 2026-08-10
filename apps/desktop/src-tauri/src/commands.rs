use std::collections::HashMap;
use tauri::{AppHandle, Manager};

use crate::db;
use crate::executor;
use crate::models::*;
use crate::state::AppState;
use crate::tray;

fn map_err<E: std::fmt::Display>(e: E) -> String {
    e.to_string()
}

#[tauri::command]
pub async fn list_groups(app: AppHandle) -> Result<Vec<CommandGroup>, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::list_groups(&conn).map_err(map_err)
}

#[tauri::command]
pub async fn create_group(
    app: AppHandle,
    input: GroupInput,
) -> Result<CommandGroup, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    let result = db::create_group(&conn, &input).map_err(map_err);
    drop(conn);
    tray::rebuild_menu(&app);
    result
}

#[tauri::command]
pub async fn update_group(
    app: AppHandle,
    id: String,
    input: GroupInput,
) -> Result<CommandGroup, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    let result = db::update_group(&conn, &id, &input).map_err(map_err);
    drop(conn);
    tray::rebuild_menu(&app);
    result
}

#[tauri::command]
pub async fn delete_group(app: AppHandle, id: String) -> Result<(), String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    let result = db::delete_group(&conn, &id).map_err(map_err);
    drop(conn);
    tray::rebuild_menu(&app);
    result
}

#[tauri::command]
pub async fn list_commands(app: AppHandle) -> Result<Vec<Command>, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::list_commands(&conn).map_err(map_err)
}

#[tauri::command]
pub async fn create_command(
    app: AppHandle,
    input: CommandInput,
) -> Result<Command, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    let result = db::create_command(&conn, &input).map_err(map_err);
    drop(conn);
    tray::rebuild_menu(&app);
    result
}

#[tauri::command]
pub async fn update_command(
    app: AppHandle,
    id: String,
    input: CommandInput,
) -> Result<Command, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    let result = db::update_command(&conn, &id, &input).map_err(map_err);
    drop(conn);
    tray::rebuild_menu(&app);
    result
}

#[tauri::command]
pub async fn delete_command(app: AppHandle, id: String) -> Result<(), String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    let result = db::delete_command(&conn, &id).map_err(map_err);
    drop(conn);
    tray::rebuild_menu(&app);
    result
}

#[tauri::command]
pub async fn run_command(app: AppHandle, id: String) -> Result<Run, String> {
    executor::run_command_gated(&app, &id)
}

#[tauri::command]
pub async fn cancel_run(app: AppHandle, run_id: String) -> Result<(), String> {
    executor::cancel_run(&app, &run_id)
}

#[tauri::command]
pub async fn list_runs(
    app: AppHandle,
    status: Option<String>,
) -> Result<Vec<Run>, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::list_runs(&conn, status.as_deref()).map_err(map_err)
}

#[tauri::command]
pub async fn read_run_output(
    app: AppHandle,
    run_id: String,
) -> Result<Option<String>, String> {
    let path = {
        let state = app.state::<AppState>();
        let conn = state.db.lock().map_err(map_err)?;
        db::get_run_output_path(&conn, &run_id).map_err(map_err)?
    };

    let Some(path) = path else {
        return Ok(None);
    };

    match std::fs::File::open(&path) {
        Ok(file) => {
            use std::io::Read;
            let mut buf = Vec::new();
            file.take(2 * 1024 * 1024)
                .read_to_end(&mut buf)
                .map_err(map_err)?;
            Ok(Some(String::from_utf8_lossy(&buf).into_owned()))
        }
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub async fn list_schedules(app: AppHandle) -> Result<Vec<Schedule>, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::list_schedules(&conn).map_err(map_err)
}

#[tauri::command]
pub async fn create_schedule(
    app: AppHandle,
    input: ScheduleInput,
) -> Result<Schedule, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::create_schedule(&conn, &input).map_err(map_err)
}

#[tauri::command]
pub async fn update_schedule(
    app: AppHandle,
    id: String,
    input: ScheduleInput,
) -> Result<Schedule, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::update_schedule(&conn, &id, &input).map_err(map_err)
}

#[tauri::command]
pub async fn toggle_schedule(app: AppHandle, id: String) -> Result<Schedule, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::toggle_schedule(&conn, &id).map_err(map_err)
}

#[tauri::command]
pub async fn delete_schedule(app: AppHandle, id: String) -> Result<(), String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::delete_schedule(&conn, &id).map_err(map_err)
}

#[tauri::command]
pub async fn get_settings(app: AppHandle) -> Result<HashMap<String, String>, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::get_all_settings(&conn)
        .map(|v| v.into_iter().collect())
        .map_err(map_err)
}

#[tauri::command]
pub async fn set_setting(
    app: AppHandle,
    key: String,
    value: String,
) -> Result<(), String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::set_setting(&conn, &key, &value).map_err(map_err)
}

// ---- Export / Import ----

#[tauri::command]
pub async fn export_config(app: AppHandle) -> Result<String, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    let config = db::export_config(&conn).map_err(map_err)?;
    serde_json::to_string_pretty(&config).map_err(map_err)
}

#[tauri::command]
pub async fn import_config(app: AppHandle, json: String) -> Result<(), String> {
    let config: ConfigExport =
        serde_json::from_str(&json).map_err(map_err)?;
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    let result = db::import_config(&conn, &config).map_err(map_err);
    drop(conn);
    tray::rebuild_menu(&app);
    result
}

// ---- Batch execution ----

#[tauri::command]
pub async fn run_group(app: AppHandle, group_id: String) -> Result<Vec<Run>, String> {
    let commands = {
        let state = app.state::<AppState>();
        let conn = state.db.lock().map_err(map_err)?;
        db::list_commands_by_group(&conn, &group_id).map_err(map_err)?
    };

    let mut runs = Vec::new();
    for cmd in commands {
        match executor::run_command(&app, &cmd.id) {
            Ok(run) => runs.push(run),
            Err(e) => return Err(e),
        }
    }
    Ok(runs)
}

// ---- Auto-start ----

#[tauri::command]
pub async fn enable_autostart(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch()
        .enable()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn disable_autostart(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch()
        .disable()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn is_autostart_enabled(app: AppHandle) -> Result<bool, String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch()
        .is_enabled()
        .map_err(|e| e.to_string())
}
