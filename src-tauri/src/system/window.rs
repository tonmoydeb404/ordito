use crate::system::notification::NotificationManager;
use tauri::{CloseRequestApi, Manager, WebviewWindow, WindowEvent};

pub struct WindowManager;

impl WindowManager {
    pub fn setup_background_behavior(app: &tauri::App) -> tauri::Result<()> {
        if let Some(window) = app.get_webview_window("main") {
            let app_handle = app.handle().clone();

            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    Self::handle_close_request(&app_handle, api);
                }
            });

            log::info!("Window background behavior configured");
        }
        Ok(())
    }

    fn handle_close_request(app_handle: &tauri::AppHandle, api: &CloseRequestApi) {
        api.prevent_close();
        let _ = Self::hide_to_tray(app_handle);
    }

    fn get_window(app_handle: &tauri::AppHandle) -> Result<WebviewWindow, String> {
        app_handle
            .get_webview_window("main")
            .ok_or_else(|| "Main window not found".to_string())
    }

    pub fn show_window(app_handle: &tauri::AppHandle) -> Result<(), String> {
        let window = Self::get_window(app_handle)?;
        window.show().map_err(|e| format!("Failed to show window: {}", e))?;
        window.set_focus().map_err(|e| format!("Failed to focus window: {}", e))?;
        window.unminimize().map_err(|e| format!("Failed to unminimize window: {}", e))?;
        Ok(())
    }

    pub fn hide_to_tray(app_handle: &tauri::AppHandle) -> Result<(), String> {
        let window = Self::get_window(app_handle)?;
        window.hide().map_err(|e| format!("Failed to hide window: {}", e))?;
        NotificationManager::show(
            app_handle,
            "Ordito",
            "Running in background. Right-click tray icon to access commands.",
        );
        Ok(())
    }

    pub fn is_window_visible(app_handle: &tauri::AppHandle) -> Result<bool, String> {
        Self::get_window(app_handle)?
            .is_visible()
            .map_err(|e| format!("Failed to check visibility: {}", e))
    }
}
