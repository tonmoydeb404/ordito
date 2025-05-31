use crate::notification::NotificationManager;
use tauri::{CloseRequestApi, Manager, WebviewWindow, WindowEvent};

pub struct WindowManager;

impl WindowManager {
    /// Setup window event handling for background running
    pub fn setup_background_behavior(app: &tauri::App) -> tauri::Result<()> {
        if let Some(window) = app.get_webview_window("main") {
            let app_handle = app.handle().clone();

            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    Self::handle_close_request(&app_handle, api);
                }
            });

            log::info!("🔧 Window background behavior configured");
        }
        Ok(())
    }

    /// Handle window close request - minimize to tray instead
    fn handle_close_request(app_handle: &tauri::AppHandle, api: &CloseRequestApi) {
        log::info!("🔄 Window close requested - minimizing to tray instead");
        api.prevent_close();

        let _ = Self::hide_to_tray(app_handle);
    }

    /// Get main window
    fn get_window(app_handle: &tauri::AppHandle) -> Result<WebviewWindow, String> {
        app_handle
            .get_webview_window("main")
            .ok_or_else(|| "Main window not found".to_string())
    }

    /// Show the main window (restore from tray)
    pub fn show_window(app_handle: &tauri::AppHandle) -> Result<(), String> {
        let window = Self::get_window(app_handle)?;

        window
            .show()
            .map_err(|e| format!("Failed to show window: {}", e))?;
        window
            .set_focus()
            .map_err(|e| format!("Failed to focus window: {}", e))?;
        window
            .unminimize()
            .map_err(|e| format!("Failed to unminimize window: {}", e))?;

        log::info!("📱 Main window restored from tray");
        Ok(())
    }

    /// Hide window to tray
    pub fn hide_to_tray(app_handle: &tauri::AppHandle) -> Result<(), String> {
        let window = Self::get_window(app_handle)?;

        window
            .hide()
            .map_err(|e| format!("Failed to hide window: {}", e))?;
        log::info!("📥 Window hidden to tray");

        NotificationManager::show_success(
            app_handle,
            "Command Runner",
            "Running in background. Right-click tray icon to access commands.",
        );

        Ok(())
    }

    /// Check if window is currently visible
    pub fn is_window_visible(app_handle: &tauri::AppHandle) -> Result<bool, String> {
        Self::get_window(app_handle)?
            .is_visible()
            .map_err(|e| format!("Failed to check visibility: {}", e))
    }

    // Check if app is running in background (window hidden)
    // pub fn is_running_in_background(app_handle: &tauri::AppHandle) -> Result<bool, String> {
    //     Ok(!Self::is_window_visible(app_handle)?)
    // }

    // Toggle window visibility
    // pub fn toggle_window(app_handle: &tauri::AppHandle) -> Result<(), String> {
    //     if Self::is_window_visible(app_handle)? {
    //         Self::hide_to_tray(app_handle)
    //     } else {
    //         Self::show_window(app_handle)
    //     }
    // }
}
