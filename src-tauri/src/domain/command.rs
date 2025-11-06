use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow)]
pub struct Command {
    pub(crate) id: Uuid,
    pub(crate) command_group_id: Uuid,
    pub(crate) title: String,
    pub(crate) value: String,
    pub(crate) working_dir: String,
    pub(crate) timeout: Option<u32>,
    pub(crate) run_in_background: bool,
    pub(crate) is_favourite: bool,
    pub(crate) env_vars: String,  // JSON string
    pub(crate) created_at: DateTime<Utc>,
    pub(crate) updated_at: DateTime<Utc>,
}
