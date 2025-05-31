// src/startup.rs - Startup management using Tauri autostart plugin
use tauri::AppHandle;
use tauri_plugin_autostart::ManagerExt;

pub struct StartupManager;

impl StartupManager {
    /// Check if app is set to run on startup
    pub fn is_startup_enabled(app: &AppHandle) -> Result<bool, String> {
        app.autolaunch()
            .is_enabled()
            .map_err(|e| format!("Failed to check startup status: {}", e))
    }

    /// Enable startup
    pub fn enable_startup(app: &AppHandle) -> Result<(), String> {
        app.autolaunch()
            .enable()
            .map_err(|e| format!("Failed to enable startup: {}", e))
    }

    /// Disable startup
    pub fn disable_startup(app: &AppHandle) -> Result<(), String> {
        app.autolaunch()
            .disable()
            .map_err(|e| format!("Failed to disable startup: {}", e))
    }

    /// Toggle startup setting
    pub fn toggle_startup(app: &AppHandle) -> Result<bool, String> {
        let is_enabled = Self::is_startup_enabled(app)?;

        if is_enabled {
            Self::disable_startup(app)?;
            log::info!("🚫 Startup disabled");
            Ok(false)
        } else {
            Self::enable_startup(app)?;
            log::info!("✅ Startup enabled");
            Ok(true)
        }
    }
}
