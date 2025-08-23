use crate::error::{OrditoError, Result};
use tauri_plugin_notification::{NotificationExt, PermissionState};
use tracing::{debug, error, warn};

#[derive(Debug, Clone)]
pub enum NotificationType {
    ScheduleSuccess,
    ScheduleFailure,
    ScheduleWarning,
    ExecutionSuccess,
    ExecutionFailure,
    SystemAlert,
}

impl NotificationType {
    pub fn icon(&self) -> &'static str {
        match self {
            NotificationType::ScheduleSuccess => "✅",
            NotificationType::ScheduleFailure => "❌",
            NotificationType::ScheduleWarning => "⚠️",
            NotificationType::ExecutionSuccess => "🎉",
            NotificationType::ExecutionFailure => "💥",
            NotificationType::SystemAlert => "🔔",
        }
    }

    pub fn sound(&self) -> Option<&'static str> {
        match self {
            NotificationType::ScheduleFailure | NotificationType::ExecutionFailure => Some("error"),
            NotificationType::ScheduleWarning => Some("warning"),
            NotificationType::ScheduleSuccess | NotificationType::ExecutionSuccess => {
                Some("success")
            }
            NotificationType::SystemAlert => Some("default"),
        }
    }
}

#[derive(Debug, Clone)]
pub struct NotificationService {
    app_handle: tauri::AppHandle,
}

impl NotificationService {
    pub fn new(app_handle: tauri::AppHandle) -> Self {
        Self { app_handle }
    }

    pub async fn initialize(&self) -> Result<()> {
        debug!("Initializing notification service");

        // Request notification permission
        match self.app_handle.notification().permission_state() {
            Ok(PermissionState::Granted) => {
                debug!("Notification permission already granted");
                Ok(())
            }
            Ok(PermissionState::Denied) => {
                warn!("Notification permission denied");
                Err(OrditoError::Notification(
                    "Notification permission denied".to_string(),
                ))
            }
            Ok(_) => {
                debug!("Requesting notification permission");
                match self.app_handle.notification().request_permission() {
                    Ok(PermissionState::Granted) => {
                        debug!("Notification permission granted");
                        Ok(())
                    }
                    Ok(PermissionState::Denied) => {
                        warn!("Notification permission denied by user");
                        Err(OrditoError::Notification(
                            "Notification permission denied by user".to_string(),
                        ))
                    }
                    Ok(_) => {
                        warn!("Notification permission status unknown");
                        Err(OrditoError::Notification(
                            "Notification permission status unknown".to_string(),
                        ))
                    }
                    Err(e) => {
                        error!("Failed to request notification permission: {}", e);
                        Err(OrditoError::Notification(format!(
                            "Failed to request notification permission: {}",
                            e
                        )))
                    }
                }
            }
            Err(e) => {
                error!("Failed to check notification permission: {}", e);
                Err(OrditoError::Notification(format!(
                    "Failed to check notification permission: {}",
                    e
                )))
            }
        }
    }

    pub fn send_notification(
        &self,
        notification_type: NotificationType,
        title: &str,
        body: &str,
        _actions: Option<Vec<(&str, &str)>>,
    ) -> Result<()> {
        debug!(
            "Sending {} notification: {}",
            std::any::type_name::<NotificationType>(),
            title
        );

        let formatted_title = format!("{} {}", notification_type.icon(), title);

        let mut notification = self
            .app_handle
            .notification()
            .builder()
            .title(formatted_title)
            .body(body);

        // Add sound if available
        if let Some(sound) = notification_type.sound() {
            notification = notification.sound(sound);
        }

        // Note: Actions may not be supported in current version of tauri-plugin-notification
        // if let Some(actions) = actions {
        //     for (action_id, action_label) in actions {
        //         notification = notification.action(action_id, action_label);
        //     }
        // }

        match notification.show() {
            Ok(_) => {
                debug!("Notification sent successfully");
                Ok(())
            }
            Err(e) => {
                error!("Failed to send notification: {}", e);
                Err(OrditoError::Notification(format!(
                    "Failed to send notification: {}",
                    e
                )))
            }
        }
    }

    pub fn send_schedule_success(&self, schedule_name: &str, execution_time: &str) -> Result<()> {
        self.send_notification(
            NotificationType::ScheduleSuccess,
            "Schedule Executed Successfully",
            &format!(
                "'{}' completed successfully at {}",
                schedule_name, execution_time
            ),
            Some(vec![("view_logs", "View Logs")]),
        )
    }

    pub fn send_schedule_failure(&self, schedule_name: &str, error_message: &str) -> Result<()> {
        self.send_notification(
            NotificationType::ScheduleFailure,
            "Schedule Execution Failed",
            &format!("'{}' failed: {}", schedule_name, error_message),
            Some(vec![("view_logs", "View Logs"), ("retry", "Retry")]),
        )
    }

    pub fn send_schedule_warning(&self, schedule_name: &str, next_execution: &str) -> Result<()> {
        self.send_notification(
            NotificationType::ScheduleWarning,
            "Scheduled Task Starting Soon",
            &format!(
                "'{}' will execute in 10 minutes at {}",
                schedule_name, next_execution
            ),
            Some(vec![
                ("view_schedule", "View Schedule"),
                ("disable", "Disable"),
            ]),
        )
    }

    pub fn send_execution_success(&self, command_name: &str, duration: &str) -> Result<()> {
        self.send_notification(
            NotificationType::ExecutionSuccess,
            "Command Executed Successfully",
            &format!("'{}' completed in {}", command_name, duration),
            Some(vec![("view_output", "View Output")]),
        )
    }

    pub fn send_execution_failure(&self, command_name: &str, exit_code: i32) -> Result<()> {
        self.send_notification(
            NotificationType::ExecutionFailure,
            "Command Execution Failed",
            &format!("'{}' failed with exit code {}", command_name, exit_code),
            Some(vec![("view_output", "View Output"), ("retry", "Retry")]),
        )
    }

    pub fn send_system_alert(&self, message: &str) -> Result<()> {
        self.send_notification(NotificationType::SystemAlert, "System Alert", message, None)
    }

    pub fn send_custom_notification(
        &self,
        title: &str,
        body: &str,
        icon: Option<&str>,
        _actions: Option<Vec<(&str, &str)>>,
    ) -> Result<()> {
        let formatted_title = if let Some(icon) = icon {
            format!("{} {}", icon, title)
        } else {
            title.to_string()
        };

        let notification = self
            .app_handle
            .notification()
            .builder()
            .title(formatted_title)
            .body(body);

        // Note: Actions may not be supported in current version of tauri-plugin-notification
        // if let Some(actions) = actions {
        //     for (action_id, action_label) in actions {
        //         notification = notification.action(action_id, action_label);
        //     }
        // }

        match notification.show() {
            Ok(_) => {
                debug!("Custom notification sent successfully");
                Ok(())
            }
            Err(e) => {
                error!("Failed to send custom notification: {}", e);
                Err(OrditoError::Notification(format!(
                    "Failed to send custom notification: {}",
                    e
                )))
            }
        }
    }

    pub fn is_permission_granted(&self) -> bool {
        matches!(
            self.app_handle.notification().permission_state(),
            Ok(PermissionState::Granted)
        )
    }
}
