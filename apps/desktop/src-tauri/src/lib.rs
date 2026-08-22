use tauri::{
    image::Image,
    menu::MenuEvent,
    tray::TrayIconBuilder,
    Emitter, Manager,
};
use tauri_plugin_updater::UpdaterExt;

mod brand;
mod commands;
mod db;
mod executor;
mod migrations;
mod models;
mod scheduler;
mod seed;
mod state;
mod tray;

use state::AppState;

pub fn show_window(app: &tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    {
        let _ = app.show();
        let _ = app.set_activation_policy(tauri::ActivationPolicy::Regular);
    }

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

// checks for a newer build and notifies the frontend; the user decides whether
// to install via the "Install & restart" button in the sidebar.
async fn check_for_update(app: tauri::AppHandle) {
    let updater = match app.updater() {
        Ok(updater) => updater,
        Err(err) => {
            eprintln!("updater unavailable: {err}");
            return;
        }
    };

    match updater.check().await {
        Ok(Some(update)) => {
            let _ = app.emit(
                "update://available",
                serde_json::json!({
                    "version": update.version,
                    "body": update.body,
                    "date": update.date.map(|d| d.to_string()),
                }),
            );
        }
        Ok(None) => {}
        Err(err) => eprintln!("update check failed: {err}"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .setup(|app| {
            // autostart launches with --hidden: stay in the tray without a
            // window; a normal launch shows the main window immediately
            let launch_hidden = std::env::args().any(|arg| arg == "--hidden");
            if launch_hidden {
                #[cfg(target_os = "macos")]
                let _ = app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            } else {
                show_window(app.handle());
            }

            let mut app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");

            // keep dev builds isolated from the installed production app's data
            if cfg!(debug_assertions) {
                app_data_dir = app_data_dir.join("dev");
            }

            std::fs::create_dir_all(&app_data_dir).ok();
            std::fs::create_dir_all(app_data_dir.join("logs")).ok();

            let conn = db::open_connection(&app_data_dir)
                .expect("failed to open database");

            app.manage(AppState::new(conn, app_data_dir));

            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                scheduler::start(app_handle).await;
            });

            let updater_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_for_update(updater_handle).await;
            });

            // not a template: renders full color with the app icon's own background,
            // rather than a floating transparent glyph
            let _tray = TrayIconBuilder::with_id("main_tray")
                .icon(Image::from_bytes(include_bytes!("../icons/32x32.png"))?)
                .icon_as_template(false)
                .tooltip(brand::APP_NAME)
                .show_menu_on_left_click(true)
                .on_menu_event(|tray, event: MenuEvent| {
                    tray::handle_menu_event(tray.app_handle(), event.id().as_ref());
                })
                .build(app)?;

            tray::rebuild_menu(app.handle());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_groups,
            commands::create_group,
            commands::update_group,
            commands::delete_group,
            commands::list_commands,
            commands::create_command,
            commands::update_command,
            commands::delete_command,
            commands::run_command,
            commands::cancel_run,
            commands::list_runs,
            commands::read_run_output,
            commands::list_schedules,
            commands::create_schedule,
            commands::update_schedule,
            commands::toggle_schedule,
            commands::delete_schedule,
            commands::get_settings,
            commands::set_setting,
            commands::seed_starter_data,
            commands::export_config,
            commands::import_config,
            commands::run_group,
            commands::enable_autostart,
            commands::disable_autostart,
            commands::is_autostart_enabled,
            commands::install_update,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
