use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Command {
    pub id: Uuid,
    pub command_group_id: Uuid,
    pub title: String,
    pub value: String,
    pub working_dir: String,
    pub timeout: Option<u32>,
    pub run_in_background: bool,
    pub is_favourite: bool,
    pub env_vars: String,  // JSON string
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
