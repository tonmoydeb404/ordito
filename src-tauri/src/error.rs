use thiserror::Error;

pub type Result<T> = std::result::Result<T, OrditoError>;

#[derive(Debug, Error)]
pub enum OrditoError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Storage error: {0}")]
    Storage(String),

    #[error("Command error: {0}")]
    Command(String),

    #[error("Scheduler error: {0}")]
    Scheduler(String),

    #[error("Cron expression error: {0}")]
    CronExpression(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Notification error: {0}")]
    Notification(String),

    #[error("Tauri error: {0}")]
    Tauri(#[from] tauri::Error),

    #[error("Generic error: {0}")]
    Generic(#[from] anyhow::Error),
}

impl serde::Serialize for OrditoError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
