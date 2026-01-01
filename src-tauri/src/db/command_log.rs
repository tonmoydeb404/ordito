use anyhow::Result;
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::db::utils::*;
use crate::domain::command_log::{CommandLog, CommandLogRow};
use crate::io::log_storage::LogStorage;

pub struct CommandLogRepository<'a> {
    pool: &'a SqlitePool,
    log_storage: &'a LogStorage,
}

impl<'a> CommandLogRepository<'a> {
    pub fn new(pool: &'a SqlitePool, log_storage: &'a LogStorage) -> Self {
        Self { pool, log_storage }
    }

    pub async fn create(&self, log: CommandLog) -> Result<()> {
        // Write output to file if present
        if let Some(ref output) = log.output {
            self.log_storage.write_log(&log.id, output).await?;
        }

        // Store metadata in database (without output)
        sqlx::query(
            r#"
                INSERT INTO command_logs (
                    id, command_id, command_schedule_id, status, exit_code,
                    working_dir, run_in_background, timeout, env_vars,
                    started_at, finished_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            "#,
        )
        .bind(log.id.to_string())
        .bind(log.command_id.to_string())
        .bind(log.command_schedule_id.map(|id| id.to_string()))
        .bind(&log.status)
        .bind(&log.exit_code)
        .bind(&log.working_dir)
        .bind(&log.run_in_background)
        .bind(&log.timeout)
        .bind(&log.env_vars)
        .bind(&log.started_at)
        .bind(&log.finished_at)
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<CommandLog>> {
        let row_opt = sqlx::query(
            r#"
                SELECT
                    id, command_id, command_schedule_id, status, exit_code,
                    working_dir, run_in_background, timeout, env_vars,
                    started_at, finished_at
                FROM command_logs
                WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_optional(self.pool)
        .await?;

        let log_row = row_opt
            .map(|row| -> Result<CommandLogRow> {
                Ok(CommandLogRow {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_id: parse_uuid(&get_string(&row, "command_id"), "command_id")?,
                    command_schedule_id: parse_optional_uuid(
                        get_optional_string(&row, "command_schedule_id"),
                        "command_schedule_id",
                    )?,
                    status: get_string(&row, "status"),
                    exit_code: row.get("exit_code"),
                    working_dir: get_string(&row, "working_dir"),
                    run_in_background: row.get("run_in_background"),
                    timeout: row.get("timeout"),
                    env_vars: get_string(&row, "env_vars"),
                    started_at: parse_datetime(&get_string(&row, "started_at"), "started_at")?,
                    finished_at: parse_optional_datetime(
                        get_optional_string(&row, "finished_at"),
                        "finished_at",
                    )?,
                })
            })
            .transpose()?;

        // Convert row to CommandLog and load output from file
        let mut log = log_row.map(CommandLog::from);
        if let Some(ref mut log) = log {
            log.output = self.log_storage.read_log(&log.id).await.ok();
        }

        Ok(log)
    }

    pub async fn get_all(&self) -> Result<Vec<CommandLog>> {
        let rows = sqlx::query(
            r#"
                SELECT
                    id, command_id, command_schedule_id, status, exit_code,
                    working_dir, run_in_background, timeout, env_vars,
                    started_at, finished_at
                FROM command_logs
                ORDER BY started_at DESC
            "#,
        )
        .fetch_all(self.pool)
        .await?;

        let log_rows = rows
            .into_iter()
            .map(|row| -> Result<CommandLogRow> {
                Ok(CommandLogRow {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_id: parse_uuid(&get_string(&row, "command_id"), "command_id")?,
                    command_schedule_id: parse_optional_uuid(
                        get_optional_string(&row, "command_schedule_id"),
                        "command_schedule_id",
                    )?,
                    status: get_string(&row, "status"),
                    exit_code: row.get("exit_code"),
                    working_dir: get_string(&row, "working_dir"),
                    run_in_background: row.get("run_in_background"),
                    timeout: row.get("timeout"),
                    env_vars: get_string(&row, "env_vars"),
                    started_at: parse_datetime(&get_string(&row, "started_at"), "started_at")?,
                    finished_at: parse_optional_datetime(
                        get_optional_string(&row, "finished_at"),
                        "finished_at",
                    )?,
                })
            })
            .collect::<Result<Vec<_>>>()?;

        // Convert rows to CommandLog and load output from files
        let mut logs: Vec<CommandLog> = log_rows.into_iter().map(CommandLog::from).collect();
        for log in &mut logs {
            log.output = self.log_storage.read_log(&log.id).await.ok();
        }

        Ok(logs)
    }

    pub async fn get_by_command_id(&self, command_id: &str) -> Result<Vec<CommandLog>> {
        let rows = sqlx::query(
            r#"
                SELECT
                    id, command_id, command_schedule_id, status, exit_code,
                    working_dir, run_in_background, timeout, env_vars,
                    started_at, finished_at
                FROM command_logs
                WHERE command_id = ?
                ORDER BY started_at DESC
            "#,
        )
        .bind(command_id)
        .fetch_all(self.pool)
        .await?;

        let log_rows = rows
            .into_iter()
            .map(|row| -> Result<CommandLogRow> {
                Ok(CommandLogRow {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_id: parse_uuid(&get_string(&row, "command_id"), "command_id")?,
                    command_schedule_id: parse_optional_uuid(
                        get_optional_string(&row, "command_schedule_id"),
                        "command_schedule_id",
                    )?,
                    status: get_string(&row, "status"),
                    exit_code: row.get("exit_code"),
                    working_dir: get_string(&row, "working_dir"),
                    run_in_background: row.get("run_in_background"),
                    timeout: row.get("timeout"),
                    env_vars: get_string(&row, "env_vars"),
                    started_at: parse_datetime(&get_string(&row, "started_at"), "started_at")?,
                    finished_at: parse_optional_datetime(
                        get_optional_string(&row, "finished_at"),
                        "finished_at",
                    )?,
                })
            })
            .collect::<Result<Vec<_>>>()?;

        // Convert rows to CommandLog and load output from files
        let mut logs: Vec<CommandLog> = log_rows.into_iter().map(CommandLog::from).collect();
        for log in &mut logs {
            log.output = self.log_storage.read_log(&log.id).await.ok();
        }

        Ok(logs)
    }

    pub async fn get_by_status(&self, status: &str) -> Result<Vec<CommandLog>> {
        let rows = sqlx::query(
            r#"
                SELECT
                    id, command_id, command_schedule_id, status, exit_code,
                    working_dir, run_in_background, timeout, env_vars,
                    started_at, finished_at
                FROM command_logs
                WHERE status = ?
                ORDER BY started_at DESC
            "#,
        )
        .bind(status)
        .fetch_all(self.pool)
        .await?;

        let log_rows = rows
            .into_iter()
            .map(|row| -> Result<CommandLogRow> {
                Ok(CommandLogRow {
                    id: parse_uuid(&get_string(&row, "id"), "id")?,
                    command_id: parse_uuid(&get_string(&row, "command_id"), "command_id")?,
                    command_schedule_id: parse_optional_uuid(
                        get_optional_string(&row, "command_schedule_id"),
                        "command_schedule_id",
                    )?,
                    status: get_string(&row, "status"),
                    exit_code: row.get("exit_code"),
                    working_dir: get_string(&row, "working_dir"),
                    run_in_background: row.get("run_in_background"),
                    timeout: row.get("timeout"),
                    env_vars: get_string(&row, "env_vars"),
                    started_at: parse_datetime(&get_string(&row, "started_at"), "started_at")?,
                    finished_at: parse_optional_datetime(
                        get_optional_string(&row, "finished_at"),
                        "finished_at",
                    )?,
                })
            })
            .collect::<Result<Vec<_>>>()?;

        // Convert rows to CommandLog and load output from files
        let mut logs: Vec<CommandLog> = log_rows.into_iter().map(CommandLog::from).collect();
        for log in &mut logs {
            log.output = self.log_storage.read_log(&log.id).await.ok();
        }

        Ok(logs)
    }

    pub async fn get_running(&self) -> Result<Vec<CommandLog>> {
        self.get_by_status("Running").await
    }

    pub async fn update(&self, log: CommandLog) -> Result<()> {
        // Update output file if present
        if let Some(ref output) = log.output {
            self.log_storage.write_log(&log.id, output).await?;
        }

        // Update database metadata
        sqlx::query(
            r#"
                UPDATE command_logs
                SET status = $1, exit_code = $2, finished_at = $3
                WHERE id = $4
            "#,
        )
        .bind(&log.status)
        .bind(&log.exit_code)
        .bind(&log.finished_at)
        .bind(log.id.to_string())
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        // Parse id to UUID for file deletion
        if let Ok(uuid) = Uuid::parse_str(id) {
            // Delete log file (ignore errors if file doesn't exist)
            let _ = self.log_storage.delete_log(&uuid).await;
        }

        // Delete database record
        sqlx::query(
            r#"
                DELETE FROM command_logs
                WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(self.pool)
        .await?;

        Ok(())
    }

    pub async fn delete_old_logs(&self, days: i64) -> Result<u64> {
        let result = sqlx::query(
            r#"
                DELETE FROM command_logs
                WHERE started_at < datetime('now', '-' || ? || ' days')
            "#,
        )
        .bind(days)
        .execute(self.pool)
        .await?;

        Ok(result.rows_affected())
    }

    pub async fn count(&self) -> Result<i64> {
        let count = sqlx::query_scalar::<_, i64>(
            r#"
                SELECT COUNT(*)
                FROM command_logs
            "#,
        )
        .fetch_one(self.pool)
        .await?;

        Ok(count)
    }

    pub async fn count_by_status(&self, status: &str) -> Result<i64> {
        let count = sqlx::query_scalar::<_, i64>(
            r#"
                SELECT COUNT(*)
                FROM command_logs
                WHERE status = $1
            "#,
        )
        .bind(status)
        .fetch_one(self.pool)
        .await?;

        Ok(count)
    }
}
