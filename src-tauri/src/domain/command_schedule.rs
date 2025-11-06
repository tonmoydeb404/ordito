use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow)]
pub struct CommandSchedule {
    pub(crate) id: Uuid,
    pub(crate) command_id: Uuid,
    pub(crate) cron_expression: String,
    pub(crate) show_notification: bool,
    pub(crate) created_at: DateTime<Utc>,
    pub(crate) updated_at: DateTime<Utc>,
}
