use anyhow::Result;
use sqlx::SqlitePool;

use crate::db::utils::*;
use crate::domain::command_schedule::CommandSchedule;

pub struct CommandScheduleRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> CommandScheduleRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, schedule: CommandSchedule) -> Result<()> {
        sqlx::query(
            r#"
                INSERT INTO command_schedules (
                    id, command_id, cron_expression, show_notification,
                    created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            "#,
        )
        .bind(schedule.id.to_string())
        .bind(schedule.command_id.to_string())
        .bind(&schedule.cron_expression)
        .bind(&schedule.show_notification)
        .bind(&schedule.created_at)
        .bind(&schedule.updated_at)
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<CommandSchedule>> {
        let row_opt = sqlx::query(
            r#"
                SELECT
                    id, command_id, cron_expression, show_notification,
                    created_at, updated_at
                FROM command_schedules
                WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        let schedule = row_opt
            .map(|row| -> Result<CommandSchedule> {
                Ok(CommandSchedule {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_id: parse_uuid(&get_string(&row, "command_id"), "command_id")?,
                    cron_expression: get_string(&row, "cron_expression"),
                    show_notification: row.get("show_notification"),
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                })
            })
            .transpose()?;

        Ok(schedule)
    }

    pub async fn get_all(&self) -> Result<Vec<CommandSchedule>> {
        let rows = sqlx::query(
            r#"
                SELECT
                    id, command_id, cron_expression, show_notification,
                    created_at, updated_at
                FROM command_schedules
                ORDER BY created_at DESC
            "#,
        )
        .fetch_all(self.pool)
        .await?;

        let schedules = rows
            .into_iter()
            .map(|row| -> Result<CommandSchedule> {
                Ok(CommandSchedule {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_id: parse_uuid(&get_string(&row, "command_id"), "command_id")?,
                    cron_expression: get_string(&row, "cron_expression"),
                    show_notification: row.get("show_notification"),
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                })
            })
            .collect::<Result<Vec<_>>>()?;

        Ok(schedules)
    }

    pub async fn get_by_command_id(&self, command_id: &str) -> Result<Vec<CommandSchedule>> {
        let rows = sqlx::query(
            r#"
                SELECT
                    id, command_id, cron_expression, show_notification,
                    created_at, updated_at
                FROM command_schedules
                WHERE command_id = ?
                ORDER BY created_at DESC
            "#,
        )
        .bind(command_id)
        .fetch_all(self.pool)
        .await?;

        let schedules = rows
            .into_iter()
            .map(|row| -> Result<CommandSchedule> {
                Ok(CommandSchedule {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_id: parse_uuid(&get_string(&row, "command_id"), "command_id")?,
                    cron_expression: get_string(&row, "cron_expression"),
                    show_notification: row.get("show_notification"),
                    created_at: parse_datetime(&get_string(&row, "created_at"), "created_at")?,
                    updated_at: parse_datetime(&get_string(&row, "updated_at"), "updated_at")?,
                })
            })
            .collect::<Result<Vec<_>>>()?;

        Ok(schedules)
    }

    pub async fn update(&self, schedule: CommandSchedule) -> Result<()> {
        sqlx::query(
            r#"
                UPDATE command_schedules
                SET cron_expression = $1, show_notification = $2, updated_at = $3
                WHERE id = $4
            "#,
        )
        .bind(&schedule.cron_expression)
        .bind(&schedule.show_notification)
        .bind(&schedule.updated_at)
        .bind(schedule.id.to_string())
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        sqlx::query(
            r#"
                DELETE FROM command_schedules
                WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn delete_by_command_id(&self, command_id: &str) -> Result<u64> {
        let result = sqlx::query(
            r#"
                DELETE FROM command_schedules
                WHERE command_id = $1
            "#,
        )
        .bind(command_id)
        .execute(self.pool)
        .await?;

        Ok(result.rows_affected())
    }

    pub async fn exists(&self, id: &str) -> Result<bool> {
        let result = sqlx::query_scalar::<_, i64>(
            r#"
                SELECT COUNT(*)
                FROM command_schedules
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
                FROM command_schedules
            "#,
        )
        .fetch_one(self.pool)
        .await?;

        Ok(count)
    }

    pub async fn toggle_notification(&self, id: &str) -> Result<()> {
        sqlx::query(
            r#"
                UPDATE command_schedules
                SET show_notification = NOT show_notification
                WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(self.pool)
        .await?;

        Ok(())
    }
}
