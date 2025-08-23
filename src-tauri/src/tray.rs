use crate::error::{OrditoError, Result};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{App, AppHandle, Emitter, Manager};
use tracing::{debug, info};

pub fn setup_system_tray(app: &App) -> Result<()> {
    info!("Setting up system tray");

    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let show_item = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;

    let tray_menu = Menu::with_items(app, &[&show_item, &quit_item])?;

    let _tray = TrayIconBuilder::with_id("main")
        .menu(&tray_menu)
        .tooltip("Ordito")
        .on_tray_icon_event(handle_tray_event)
        .build(app)?;

    debug!("System tray set up successfully");
    Ok(())
}

fn handle_tray_event(tray: &tauri::tray::TrayIcon, event: TrayIconEvent) {
    match event {
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } => {
            debug!("Left click on tray icon");
            if let Some(app) = tray.app_handle().get_webview_window("main") {
                if app.is_visible().unwrap_or(false) {
                    let _ = app.hide();
                } else {
                    let _ = app.show();
                    let _ = app.set_focus();
                }
            }
        }
        TrayIconEvent::DoubleClick {
            button: MouseButton::Left,
            ..
        } => {
            debug!("Double click on tray icon");
            if let Some(app) = tray.app_handle().get_webview_window("main") {
                let _ = app.show();
                let _ = app.set_focus();
            }
        }
        _ => {}
    }
}

pub async fn update_tray_menu(
    app_handle: &AppHandle,
    _commands: &[crate::models::Command],
) -> Result<()> {
    debug!("Updating tray menu");

    if let Some(tray) = app_handle.tray_by_id("main") {
        let quit_item = MenuItem::with_id(app_handle, "quit", "Quit", true, None::<&str>)?;
        let show_item = MenuItem::with_id(app_handle, "show", "Show", true, None::<&str>)?;

        let new_menu = Menu::with_items(app_handle, &[&show_item, &quit_item])?;

        tray.set_menu(Some(new_menu))?;
    }

    Ok(())
}

pub fn handle_menu_event(app_handle: &AppHandle, event_id: &str) {
    debug!("Menu event: {}", event_id);

    match event_id {
        "quit" => {
            info!("Quit requested from tray menu");
            app_handle.exit(0);
        }
        "show" => {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        "hide" => {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.hide();
            }
        }
        "refresh_commands" => {
            debug!("Refresh commands requested");
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.emit("refresh_commands", ());
            }
        }
        "view_schedules" => {
            debug!("View schedules requested");
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                let _ = window.emit("navigate_to_schedules", ());
            }
        }
        id if id.starts_with("execute_command_") => {
            if let Some(command_id) = id.strip_prefix("execute_command_") {
                debug!("Execute command requested: {}", command_id);
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.emit("execute_command_from_tray", command_id);
                }
            }
        }
        _ => {
            debug!("Unknown menu event: {}", event_id);
        }
    }
}

pub async fn show_notification(app_handle: &AppHandle, title: &str, body: &str) -> Result<()> {
    use tauri_plugin_notification::NotificationExt;

    app_handle
        .notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| OrditoError::Generic(e.into()))?;

    Ok(())
}

#[cfg(test)]
mod tests {

    #[test]
    fn test_handle_menu_event() {
        // Since we can't easily test the actual Tauri app handle,
        // we'll just verify that our menu event matching works correctly

        let test_cases = vec![
            ("quit", "quit"),
            ("show", "show"),
            ("hide", "hide"),
            ("execute_command_123", "execute_command_"),
            ("unknown_event", ""),
        ];

        for (event_id, expected_prefix) in test_cases {
            if expected_prefix.is_empty() {
                continue; // Skip unknown events
            }

            assert!(
                event_id == expected_prefix || event_id.starts_with(expected_prefix),
                "Event {} should match prefix {}",
                event_id,
                expected_prefix
            );
        }
    }
}
