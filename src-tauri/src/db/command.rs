use anyhow::Result;
use sqlx::SqlitePool;

use crate::db::utils::*;
use crate::domain::command::Command;

pub struct CommandRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> CommandRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, command: Command) -> Result<()> {
        sqlx::query(
            r#"
                INSERT INTO commands (
                    id, command_group_id, title, value, working_dir,
                    timeout, run_in_background, is_favourite, env_vars,
                    created_at, updated_at, last_executed_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            "#,
        )
        .bind(command.id.to_string())
        .bind(command.command_group_id.to_string())
        .bind(&command.title)
        .bind(&command.value)
        .bind(&command.working_dir)
        .bind(&command.timeout)
        .bind(&command.run_in_background)
        .bind(&command.is_favourite)
        .bind(&command.env_vars)
        .bind(&command.created_at)
        .bind(&command.updated_at)
        .bind(&command.last_executed_at)
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Command>> {
        let row_opt = sqlx::query(
            r#"
                SELECT
                    id, command_group_id, title, value, working_dir,
                    timeout, run_in_background, is_favourite, env_vars,
                    created_at, updated_at, last_executed_at
                FROM commands
                WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        let command = row_opt
            .map(|row| -> Result<Command> {
                Ok(Command {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_group_id: parse_uuid(
                        &get_string(&row, "command_group_id"),
                        "command_group_id",
                    )?,
                    title: get_string(&row, "title"),
                    value: get_string(&row, "value"),
                    working_dir: get_string(&row, "working_dir"),
                    timeout: row.get("timeout"),
                    run_in_background: row.get("run_in_background"),
                    is_favourite: row.get("is_favourite"),
                    env_vars: get_string(&row, "env_vars"),
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                    last_executed_at: row
                        .try_get::<String, _>("last_executed_at")
                        .ok()
                        .and_then(|s| parse_datetime(&s, "last_executed_at").ok()),
                })
            })
            .transpose()?;

        Ok(command)
    }

    pub async fn get_all(&self) -> Result<Vec<Command>> {
        let rows = sqlx::query(
            r#"
                SELECT
                    id, command_group_id, title, value, working_dir,
                    timeout, run_in_background, is_favourite, env_vars,
                    created_at, updated_at
                FROM commands
                ORDER BY created_at DESC
            "#,
        )
        .fetch_all(self.pool)
        .await?;

        let commands = rows
            .into_iter()
            .map(|row| -> Result<Command> {
                Ok(Command {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_group_id: parse_uuid(
                        &get_string(&row, "command_group_id"),
                        "command_group_id",
                    )?,
                    title: get_string(&row, "title"),
                    value: get_string(&row, "value"),
                    working_dir: get_string(&row, "working_dir"),
                    timeout: row.get("timeout"),
                    run_in_background: row.get("run_in_background"),
                    is_favourite: row.get("is_favourite"),
                    env_vars: get_string(&row, "env_vars"),
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                    last_executed_at: None,
                })
            })
            .collect::<Result<Vec<_>>>()?;

        Ok(commands)
    }

    pub async fn get_by_group_id(&self, group_id: &str) -> Result<Vec<Command>> {
        let rows = sqlx::query(
            r#"
                SELECT
                    id, command_group_id, title, value, working_dir,
                    timeout, run_in_background, is_favourite, env_vars,
                    created_at, updated_at, last_executed_at
                FROM commands
                WHERE command_group_id = ?
                ORDER BY title ASC
            "#,
        )
        .bind(group_id)
        .fetch_all(self.pool)
        .await?;

        let commands = rows
            .into_iter()
            .map(|row| -> Result<Command> {
                Ok(Command {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_group_id: parse_uuid(
                        &get_string(&row, "command_group_id"),
                        "command_group_id",
                    )?,
                    title: get_string(&row, "title"),
                    value: get_string(&row, "value"),
                    working_dir: get_string(&row, "working_dir"),
                    timeout: row.get("timeout"),
                    run_in_background: row.get("run_in_background"),
                    is_favourite: row.get("is_favourite"),
                    env_vars: get_string(&row, "env_vars"),
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                    last_executed_at: row
                        .try_get::<String, _>("last_executed_at")
                        .ok()
                        .and_then(|s| parse_datetime(&s, "last_executed_at").ok()),
                })
            })
            .collect::<Result<Vec<_>>>()?;

        Ok(commands)
    }

    pub async fn get_favourites(&self) -> Result<Vec<Command>> {
        let rows = sqlx::query(
            r#"
                SELECT
                    id, command_group_id, title, value, working_dir,
                    timeout, run_in_background, is_favourite, env_vars,
                    created_at, updated_at
                FROM commands
                WHERE is_favourite = true
                ORDER BY title ASC
            "#,
        )
        .fetch_all(self.pool)
        .await?;

        let commands = rows
            .into_iter()
            .map(|row| -> Result<Command> {
                Ok(Command {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_group_id: parse_uuid(
                        &get_string(&row, "command_group_id"),
                        "command_group_id",
                    )?,
                    title: get_string(&row, "title"),
                    value: get_string(&row, "value"),
                    working_dir: get_string(&row, "working_dir"),
                    timeout: row.get("timeout"),
                    run_in_background: row.get("run_in_background"),
                    is_favourite: row.get("is_favourite"),
                    env_vars: get_string(&row, "env_vars"),
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                    last_executed_at: None,
                })
            })
            .collect::<Result<Vec<_>>>()?;

        Ok(commands)
    }

    pub async fn update(&self, command: Command) -> Result<()> {
        sqlx::query(
            r#"
                UPDATE commands
                SET command_group_id = $1, title = $2, value = $3,
                    working_dir = $4, timeout = $5, run_in_background = $6,
                    is_favourite = $7, env_vars = $8, updated_at = $9
                WHERE id = $10
            "#,
        )
        .bind(command.command_group_id.to_string())
        .bind(&command.title)
        .bind(&command.value)
        .bind(&command.working_dir)
        .bind(&command.timeout)
        .bind(&command.run_in_background)
        .bind(&command.is_favourite)
        .bind(&command.env_vars)
        .bind(&command.updated_at)
        .bind(command.id.to_string())
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        sqlx::query(
            r#"
                DELETE FROM commands
                WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn search_by_title(&self, search_term: &str) -> Result<Vec<Command>> {
        let search_pattern = format!("%{}%", search_term);
        let rows = sqlx::query(
            r#"
                SELECT
                    id, command_group_id, title, value, working_dir,
                    timeout, run_in_background, is_favourite, env_vars,
                    created_at, updated_at
                FROM commands
                WHERE title LIKE ?
                ORDER BY title ASC
            "#,
        )
        .bind(search_pattern)
        .fetch_all(self.pool)
        .await?;

        let commands = rows
            .into_iter()
            .map(|row| -> Result<Command> {
                Ok(Command {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_group_id: parse_uuid(
                        &get_string(&row, "command_group_id"),
                        "command_group_id",
                    )?,
                    title: get_string(&row, "title"),
                    value: get_string(&row, "value"),
                    working_dir: get_string(&row, "working_dir"),
                    timeout: row.get("timeout"),
                    run_in_background: row.get("run_in_background"),
                    is_favourite: row.get("is_favourite"),
                    env_vars: get_string(&row, "env_vars"),
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                    last_executed_at: None,
                })
            })
            .collect::<Result<Vec<_>>>()?;

        Ok(commands)
    }

    pub async fn toggle_favourite(&self, id: &str) -> Result<()> {
        sqlx::query(
            r#"
                UPDATE commands
                SET is_favourite = NOT is_favourite
                WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn exists(&self, id: &str) -> Result<bool> {
        let result = sqlx::query_scalar::<_, i64>(
            r#"
                SELECT COUNT(*)
                FROM commands
                WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_one(self.pool)
        .await?;

        Ok(result > 0)
    }

    pub async fn count(&self) -> Result<i64> {
        let count = sqlx::query_scalar::<_, i64>(
            r#"
                SELECT COUNT(*)
                FROM commands
            "#,
        )
        .fetch_one(self.pool)
        .await?;

        Ok(count)
    }

    /// Update the last_executed_at timestamp for a command
    pub async fn update_last_executed(&self, id: &str) -> Result<()> {
        let now = chrono::Utc::now();
        sqlx::query(
            r#"
                UPDATE commands
                SET last_executed_at = $1
                WHERE id = $2
            "#,
        )
        .bind(&now)
        .bind(id)
        .execute(self.pool)
        .await?;

        Ok(())
    }
}
