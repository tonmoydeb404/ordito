use std::env;
use std::str::FromStr;

use anyhow::{anyhow, Result};
use dotenv::dotenv;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    SqlitePool,
};

pub mod command;
pub mod command_group;
pub mod command_log;
pub mod command_schedule;
pub mod utils;

pub async fn init_db_pool() -> Result<SqlitePool> {
    dotenv().ok();

    let db_url = env::var("DATABASE_URL").map_err(|_| anyhow!("DATABASE_URL missing in env"))?;

    // Configure SQLite to create database file if it doesn't exist
    let options = SqliteConnectOptions::from_str(&db_url)?.create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await
        .expect("Failed to connect to SQLite DB");

    sqlx::query("PRAGMA foreign_keys = ON;")
        .execute(&pool)
        .await?;

    return Ok(pool);
}

pub async fn create_tables(pool: &SqlitePool) -> Result<()> {
    let mut tx = pool.begin().await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS command_groups (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            parent_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (parent_id) REFERENCES command_groups(id) ON DELETE CASCADE
        );
        "#,
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS commands (
            id TEXT PRIMARY KEY NOT NULL,
            command_group_id TEXT NOT NULL,
            title TEXT NOT NULL,
            value TEXT NOT NULL,
            working_dir TEXT NOT NULL,
            timeout INTEGER,
            run_in_background BOOLEAN NOT NULL DEFAULT 0,
            is_favourite BOOLEAN NOT NULL DEFAULT 0,
            env_vars TEXT NOT NULL DEFAULT '{}',  -- JSON formatted string
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_executed_at TEXT,  -- Timestamp of last execution
            FOREIGN KEY (command_group_id) REFERENCES command_groups(id) ON DELETE CASCADE
        );
        "#,
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS command_schedules (
            id TEXT PRIMARY KEY NOT NULL,
            command_id TEXT NOT NULL,
            cron_expression TEXT NOT NULL,
            show_notification BOOLEAN NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE
        );
        "#,
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS command_logs (
            id TEXT PRIMARY KEY NOT NULL,
            command_id TEXT NOT NULL,
            command_schedule_id TEXT,
            status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'timeout', 'cancelled', 'running')),
            exit_code INTEGER,
            working_dir TEXT NOT NULL,
            run_in_background BOOLEAN NOT NULL,
            timeout INTEGER,
            env_vars TEXT NOT NULL DEFAULT '{}',  -- JSON formatted string
            started_at TEXT NOT NULL,
            finished_at TEXT,
            FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE,
            FOREIGN KEY (command_schedule_id) REFERENCES command_schedules(id) ON DELETE SET NULL
        );
        "#,
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_commands_group_id ON commands(command_group_id);")
        .execute(&mut *tx)
        .await?;

    sqlx::query(
        "CREATE INDEX IF NOT EXISTS idx_command_groups_parent_id ON command_groups(parent_id);",
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query(
        "CREATE INDEX IF NOT EXISTS idx_command_schedules_command_id ON command_schedules(command_id);"
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query(
        "CREATE INDEX IF NOT EXISTS idx_command_logs_command_id ON command_logs(command_id);",
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query(
        "CREATE INDEX IF NOT EXISTS idx_command_logs_schedule_id ON command_logs(command_schedule_id);"
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_command_logs_status ON command_logs(status);")
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(())
}
