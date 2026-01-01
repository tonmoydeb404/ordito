use anyhow::Result;
use sqlx::SqlitePool;

use crate::db::utils::*;
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
        let row_opt = sqlx::query(
            r#"
                SELECT id, title, parent_id, created_at, updated_at
                FROM command_groups
                WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        let group = row_opt
            .map(|row| -> Result<CommandGroup> {
                Ok(CommandGroup {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    title: get_string(&row, "title"),
                    parent_id: parse_optional_uuid(get_optional_string(&row, "parent_id"), "parent_id")?,
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                })
            })
            .transpose()?;

        return Ok(group);
    }

    pub async fn get_all(&self) -> Result<Vec<CommandGroup>> {
        let rows = sqlx::query(
            r#"
                SELECT id, title, parent_id, created_at, updated_at
                FROM command_groups
                ORDER BY created_at DESC
            "#,
        )
        .fetch_all(self.pool)
        .await?;

        let groups = rows
            .into_iter()
            .map(|row| -> Result<CommandGroup> {
                Ok(CommandGroup {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    title: get_string(&row, "title"),
                    parent_id: parse_optional_uuid(get_optional_string(&row, "parent_id"), "parent_id")?,
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                })
            })
            .collect::<Result<Vec<_>>>()?;

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
        let rows = sqlx::query(
            r#"
                SELECT id, title, parent_id, created_at, updated_at
                FROM command_groups
                WHERE parent_id = ?
                ORDER BY title ASC
            "#,
        )
        .bind(parent_id)
        .fetch_all(self.pool)
        .await?;

        let groups = rows
            .into_iter()
            .map(|row| -> Result<CommandGroup> {
                Ok(CommandGroup {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    title: get_string(&row, "title"),
                    parent_id: parse_optional_uuid(get_optional_string(&row, "parent_id"), "parent_id")?,
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                })
            })
            .collect::<Result<Vec<_>>>()?;

        return Ok(groups);
    }

    pub async fn get_root_groups(&self) -> Result<Vec<CommandGroup>> {
        let rows = sqlx::query(
            r#"
                SELECT id, title, parent_id, created_at, updated_at
                FROM command_groups
                WHERE parent_id IS NULL
                ORDER BY title ASC
            "#,
        )
        .fetch_all(self.pool)
        .await?;

        let groups = rows
            .into_iter()
            .map(|row| -> Result<CommandGroup> {
                Ok(CommandGroup {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    title: get_string(&row, "title"),
                    parent_id: parse_optional_uuid(get_optional_string(&row, "parent_id"), "parent_id")?,
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                })
            })
            .collect::<Result<Vec<_>>>()?;

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
