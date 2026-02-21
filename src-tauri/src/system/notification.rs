use tauri_plugin_notification::NotificationExt;

pub struct NotificationManager;

impl NotificationManager {
    pub fn show(app: &tauri::AppHandle, title: &str, body: &str) {
        if let Err(e) = app.notification().builder().title(title).body(body).show() {
            log::error!("Failed to show notification: {}", e);
        }
    }
}
