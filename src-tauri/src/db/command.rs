use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use uuid::Uuid;

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
                    created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Command>> {
        let command = sqlx::query_as!(
            Command,
            r#"
                SELECT
                    id as "id: Uuid",
                    command_group_id as "command_group_id: Uuid",
                    title,
                    value,
                    working_dir,
                    timeout as "timeout: u32",
                    run_in_background,
                    is_favourite,
                    env_vars,
                    created_at as "created_at: DateTime<Utc>",
                    updated_at as "updated_at: DateTime<Utc>"
                FROM commands
                WHERE id = ?
            "#,
            id
        )
        .fetch_optional(self.pool)
        .await?;

        Ok(command)
    }

    pub async fn get_all(&self) -> Result<Vec<Command>> {
        let commands = sqlx::query_as!(
            Command,
            r#"
                SELECT
                    id as "id: Uuid",
                    command_group_id as "command_group_id: Uuid",
                    title,
                    value,
                    working_dir,
                    timeout as "timeout: u32",
                    run_in_background,
                    is_favourite,
                    env_vars,
                    created_at as "created_at: DateTime<Utc>",
                    updated_at as "updated_at: DateTime<Utc>"
                FROM commands
                ORDER BY created_at DESC
            "#
        )
        .fetch_all(self.pool)
        .await?;

        Ok(commands)
    }

    pub async fn get_by_group_id(&self, group_id: &str) -> Result<Vec<Command>> {
        let commands = sqlx::query_as!(
            Command,
            r#"
                SELECT
                    id as "id: Uuid",
                    command_group_id as "command_group_id: Uuid",
                    title,
                    value,
                    working_dir,
                    timeout as "timeout: u32",
                    run_in_background,
                    is_favourite,
                    env_vars,
                    created_at as "created_at: DateTime<Utc>",
                    updated_at as "updated_at: DateTime<Utc>"
                FROM commands
                WHERE command_group_id = ?
                ORDER BY title ASC
            "#,
            group_id
        )
        .fetch_all(self.pool)
        .await?;

        Ok(commands)
    }

    pub async fn get_favourites(&self) -> Result<Vec<Command>> {
        let commands = sqlx::query_as!(
            Command,
            r#"
                SELECT
                    id as "id: Uuid",
                    command_group_id as "command_group_id: Uuid",
                    title,
                    value,
                    working_dir,
                    timeout as "timeout: u32",
                    run_in_background,
                    is_favourite,
                    env_vars,
                    created_at as "created_at: DateTime<Utc>",
                    updated_at as "updated_at: DateTime<Utc>"
                FROM commands
                WHERE is_favourite = true
                ORDER BY title ASC
            "#
        )
        .fetch_all(self.pool)
        .await?;

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
        let commands = sqlx::query_as!(
            Command,
            r#"
                SELECT
                    id as "id: Uuid",
                    command_group_id as "command_group_id: Uuid",
                    title,
                    value,
                    working_dir,
                    timeout as "timeout: u32",
                    run_in_background,
                    is_favourite,
                    env_vars,
                    created_at as "created_at: DateTime<Utc>",
                    updated_at as "updated_at: DateTime<Utc>"
                FROM commands
                WHERE title LIKE ?
                ORDER BY title ASC
            "#,
            search_pattern
        )
        .fetch_all(self.pool)
        .await?;

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
}
