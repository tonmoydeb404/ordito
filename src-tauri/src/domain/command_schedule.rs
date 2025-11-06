use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct CommandSchedule {
    pub id: Uuid,
    pub command_id: Uuid,
    pub cron_expression: String,
    pub show_notification: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
