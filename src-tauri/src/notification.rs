use tauri_plugin_notification::NotificationExt;

pub struct NotificationManager;

impl NotificationManager {
    /// Show success notification
    pub fn show_success(app: &tauri::AppHandle, title: &str, body: &str) {
        if let Err(e) = app.notification().builder().title(title).body(body).show() {
            log::error!("Failed to show success notification: {}", e);
        }
    }

    /// Show warning notification
    pub fn show_warning(app: &tauri::AppHandle, title: &str, body: &str) {
        if let Err(e) = app.notification().builder().title(title).body(body).show() {
            log::error!("Failed to show warning notification: {}", e);
        }
    }

    /// Show error notification
    pub fn show_error(app: &tauri::AppHandle, title: &str, body: &str) {
        if let Err(e) = app.notification().builder().title(title).body(body).show() {
            log::error!("Failed to show error notification: {}", e);
        }
    }
}
