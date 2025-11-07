use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::domain::command_group::CommandGroup;

pub struct CommandGroupRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> CommandGroupRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, group: CommandGroup) -> Result<()> {
        sqlx::query(
            r#"
                INSERT INTO command_groups (id, title, parent_id, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5)
            "#,
        )
        .bind(group.id.to_string())
        .bind(&group.title)
        .bind(group.parent_id.map(|id| id.to_string()))
        .bind(&group.created_at)
        .bind(&group.updated_at)
        .execute(self.pool)
        .await?;

        return Ok(());
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<CommandGroup>> {
        let group = sqlx::query_as!(
            CommandGroup,
            r#"
                SELECT
                    id as "id: Uuid",
                    title,
                    parent_id as "parent_id?: Uuid",
                    created_at as "created_at: DateTime<Utc>",
                    updated_at as "updated_at: DateTime<Utc>"
                FROM command_groups
                WHERE id = ?
            "#,
            id
        )
        .fetch_optional(self.pool)
        .await?;

        return Ok(group);
    }

    pub async fn get_all(&self) -> Result<Vec<CommandGroup>> {
        let groups = sqlx::query_as::<_, CommandGroup>(
            r#"
                SELECT
                    id,
                    title,
                    parent_id,
                    created_at,
                    updated_at
                FROM command_groups
                ORDER BY created_at DESC
            "#,
        )
        .fetch_all(self.pool)
        .await?;

        return Ok(groups);
    }

    pub async fn update(&self, group: CommandGroup) -> Result<()> {
        sqlx::query(
            r#"
                UPDATE command_groups
                SET title = $1, parent_id = $2, updated_at = $3
                WHERE id = $4
            "#,
        )
        .bind(&group.title)
        .bind(group.parent_id.map(|id| id.to_string()))
        .bind(&group.updated_at)
        .bind(group.id.to_string())
        .execute(self.pool)
        .await?;

        return Ok(());
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        sqlx::query(
            r#"
                DELETE FROM command_groups
                WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(self.pool)
        .await?;

        return Ok(());
    }

    pub async fn get_children(&self, parent_id: &str) -> Result<Vec<CommandGroup>> {
        let groups = sqlx::query_as!(
            CommandGroup,
            r#"
                SELECT
                    id as "id: Uuid",
                    title,
                    parent_id as "parent_id?: Uuid",
                    created_at as "created_at: DateTime<Utc>",
                    updated_at as "updated_at: DateTime<Utc>"
                FROM command_groups
                WHERE parent_id = ?
                ORDER BY title ASC
            "#,
            parent_id
        )
        .fetch_all(self.pool)
        .await?;

        return Ok(groups);
    }

    pub async fn get_root_groups(&self) -> Result<Vec<CommandGroup>> {
        let groups = sqlx::query_as!(
            CommandGroup,
            r#"
                SELECT
                    id as "id: Uuid",
                    title,
                    parent_id as "parent_id?: Uuid",
                    created_at as "created_at: DateTime<Utc>",
                    updated_at as "updated_at: DateTime<Utc>"
                FROM command_groups
                WHERE parent_id IS NULL
                ORDER BY title ASC
            "#
        )
        .fetch_all(self.pool)
        .await?;

        return Ok(groups);
    }

    pub async fn exists(&self, id: &str) -> Result<bool> {
        let result = sqlx::query_scalar::<_, i64>(
            r#"
                SELECT COUNT(*)
                FROM command_groups
                WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_one(self.pool)
        .await?;

        return Ok(result > 0);
    }

    pub async fn count(&self) -> Result<i64> {
        let count = sqlx::query_scalar::<_, i64>(
            r#"
                SELECT COUNT(*)
                FROM command_groups
            "#,
        )
        .fetch_one(self.pool)
        .await?;

        return Ok(count);
    }

    pub async fn has_children(&self, parent_id: &str) -> Result<bool> {
        let result = sqlx::query_scalar::<_, i64>(
            r#"
                SELECT COUNT(*)
                FROM command_groups
                WHERE parent_id = $1
            "#,
        )
        .bind(parent_id)
        .fetch_one(self.pool)
        .await?;

        return Ok(result > 0);
    }
}
