use crate::system::tray::TrayManager;

#[tauri::command]
pub async fn refresh_tray_menu(app_handle: tauri::AppHandle) -> Result<(), String> {
    TrayManager::refresh_tray_menu(app_handle)
}
