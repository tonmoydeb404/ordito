use crate::system::startup::StartupManager;

#[tauri::command]
pub async fn is_startup_enabled(app_handle: tauri::AppHandle) -> Result<bool, String> {
    StartupManager::is_startup_enabled(&app_handle)
}

#[tauri::command]
pub async fn toggle_startup(app_handle: tauri::AppHandle) -> Result<bool, String> {
    StartupManager::toggle_startup(&app_handle)
}
