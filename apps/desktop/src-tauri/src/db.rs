use std::collections::HashSet;
use std::fs;
use std::path::Path;

use chrono::{Duration, Utc};
use rusqlite::{params, Connection, OptionalExtension};

use crate::models::*;

pub type DbResult<T> = Result<T, rusqlite::Error>;

const MAX_PREVIEW_LEN: usize = 2000;

pub fn open_connection(app_data_dir: &Path) -> DbResult<Connection> {
    fs::create_dir_all(app_data_dir).ok();
    let db_path = app_data_dir.join("ordito.db");
    let mut conn = Connection::open(db_path)?;

    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "foreign_keys", "ON")?;
    conn.busy_timeout(std::time::Duration::from_secs(5))?;

    crate::migrations::migrations()
        .to_latest(&mut conn)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;

    seed_defaults(&conn)?;
    cleanup_orphaned_logs(&conn, &app_data_dir.join("logs"))?;
    expire_old_logs(&conn, &app_data_dir.join("logs"))?;

    Ok(conn)
}

fn seed_defaults(conn: &Connection) -> DbResult<()> {
    crate::seed::seed_defaults(conn)
}

pub fn seed_starter_data(conn: &Connection) -> DbResult<()> {
    crate::seed::seed_starter_data(conn)
}

pub fn get_setting(conn: &Connection, key: &str) -> Option<String> {
    conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        params![key],
        |r| r.get(0),
    )
    .ok()
}

pub fn get_setting_int(conn: &Connection, key: &str, default: i64) -> i64 {
    get_setting(conn, key)
        .and_then(|v| v.parse().ok())
        .unwrap_or(default)
}

pub fn set_setting(conn: &Connection, key: &str, value: &str) -> DbResult<()> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = ?2",
        params![key, value],
    )?;
    Ok(())
}

pub fn get_all_settings(conn: &Connection) -> DbResult<Vec<(String, String)>> {
    let mut stmt = conn.prepare("SELECT key, value FROM settings ORDER BY key")?;
    let rows = stmt.query_map([], |r| Ok((r.get(0)?, r.get(1)?)))?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

fn now_rfc3339() -> String {
    Utc::now().to_rfc3339()
}

pub fn list_groups(conn: &Connection) -> DbResult<Vec<CommandGroup>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, icon, position, created_at, updated_at
         FROM command_groups ORDER BY position, name",
    )?;
    let rows = stmt.query_map([], row_to_group)?;
    let mut groups = Vec::new();
    for row in rows {
        groups.push(row?);
    }
    Ok(groups)
}

fn row_to_group(r: &rusqlite::Row) -> rusqlite::Result<CommandGroup> {
    Ok(CommandGroup {
        id: r.get(0)?,
        name: r.get(1)?,
        icon: r.get(2)?,
        position: r.get(3)?,
        created_at: r.get(4)?,
        updated_at: r.get(5)?,
    })
}

#[allow(dead_code)]
pub fn get_group_by_name(conn: &Connection, name: &str) -> DbResult<Option<CommandGroup>> {
    conn.query_row(
        "SELECT id, name, icon, position, created_at, updated_at FROM command_groups WHERE name = ?1 COLLATE NOCASE",
        params![name],
        row_to_group,
    )
    .optional()
}

pub fn create_group(conn: &Connection, input: &GroupInput) -> DbResult<CommandGroup> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = now_rfc3339();
    let position = input.position.unwrap_or_else(|| {
        let max: Option<i32> = conn
            .query_row("SELECT MAX(position) FROM command_groups", [], |r| r.get(0))
            .unwrap_or(None);
        max.unwrap_or(-1) + 1
    });

    conn.execute(
        "INSERT INTO command_groups (id, name, icon, position, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
        params![id, input.name, input.icon, position, now],
    )?;

    conn.query_row(
        "SELECT id, name, icon, position, created_at, updated_at FROM command_groups WHERE id = ?1",
        params![id],
        row_to_group,
    )
}

pub fn update_group(conn: &Connection, id: &str, input: &GroupInput) -> DbResult<CommandGroup> {
    let now = now_rfc3339();
    conn.execute(
        "UPDATE command_groups SET name = ?1, icon = ?2, position = ?3, updated_at = ?4 WHERE id = ?5",
        params![input.name, input.icon, input.position.unwrap_or(0), now, id],
    )?;

    conn.query_row(
        "SELECT id, name, icon, position, created_at, updated_at FROM command_groups WHERE id = ?1",
        params![id],
        row_to_group,
    )
}

pub fn delete_group(conn: &Connection, id: &str) -> DbResult<()> {
    conn.execute("DELETE FROM command_groups WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn list_commands(conn: &Connection) -> DbResult<Vec<Command>> {
    let mut stmt = conn.prepare(
        "SELECT id, group_id, name, command, cwd, requires_confirmation,
                run_in_background, last_run_status, last_run_at, icon, position,
                created_at, updated_at
         FROM commands ORDER BY position, name",
    )?;
    let rows = stmt.query_map([], row_to_command)?;
    let mut commands = Vec::new();
    for row in rows {
        commands.push(row?);
    }
    Ok(commands)
}

pub fn list_commands_by_group(conn: &Connection, group_id: &str) -> DbResult<Vec<Command>> {
    let mut stmt = conn.prepare(
        "SELECT id, group_id, name, command, cwd, requires_confirmation,
                run_in_background, last_run_status, last_run_at, icon, position,
                created_at, updated_at
         FROM commands WHERE group_id = ?1 ORDER BY position, name",
    )?;
    let rows = stmt.query_map(params![group_id], row_to_command)?;
    let mut commands = Vec::new();
    for row in rows {
        commands.push(row?);
    }
    Ok(commands)
}

fn row_to_command(r: &rusqlite::Row) -> rusqlite::Result<Command> {
    let status_str: String = r.get(7)?;
    Ok(Command {
        id: r.get(0)?,
        group_id: r.get(1)?,
        name: r.get(2)?,
        command: r.get(3)?,
        cwd: r.get(4)?,
        requires_confirmation: r.get::<_, i32>(5)? != 0,
        run_in_background: r.get::<_, i32>(6)? != 0,
        last_run_status: CommandStatus::from_str(&status_str),
        last_run_at: r.get(8)?,
        icon: r.get(9)?,
        position: r.get(10)?,
        created_at: r.get(11)?,
        updated_at: r.get(12)?,
    })
}

pub fn get_command(conn: &Connection, id: &str) -> DbResult<Option<Command>> {
    conn.query_row(
        "SELECT id, group_id, name, command, cwd, requires_confirmation,
                run_in_background, last_run_status, last_run_at, icon, position,
                created_at, updated_at
         FROM commands WHERE id = ?1",
        params![id],
        row_to_command,
    )
    .optional()
}

pub fn create_command(conn: &Connection, input: &CommandInput) -> DbResult<Command> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = now_rfc3339();
    let position = input.position.unwrap_or_else(|| {
        let max: Option<i32> = conn
            .query_row(
                "SELECT MAX(position) FROM commands WHERE group_id = ?1",
                params![input.group_id],
                |r| r.get(0),
            )
            .unwrap_or(None);
        max.unwrap_or(-1) + 1
    });

    conn.execute(
        "INSERT INTO commands (id, group_id, name, command, cwd, requires_confirmation,
                               run_in_background, last_run_status, icon, position, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'idle', ?8, ?9, ?10, ?10)",
        params![
            id,
            input.group_id,
            input.name,
            input.command,
            input.cwd,
            input.requires_confirmation as i32,
            input.run_in_background as i32,
            input.icon,
            position,
            now,
        ],
    )?;

    get_command(conn, &id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
}

pub fn update_command(conn: &Connection, id: &str, input: &CommandInput) -> DbResult<Command> {
    let now = now_rfc3339();
    conn.execute(
        "UPDATE commands SET name = ?1, command = ?2, cwd = ?3, group_id = ?4,
                requires_confirmation = ?5, run_in_background = ?6, icon = ?7, updated_at = ?8
         WHERE id = ?9",
        params![
            input.name,
            input.command,
            input.cwd,
            input.group_id,
            input.requires_confirmation as i32,
            input.run_in_background as i32,
            input.icon,
            now,
            id,
        ],
    )?;

    get_command(conn, id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
}

pub fn delete_command(conn: &Connection, id: &str) -> DbResult<()> {
    conn.execute("DELETE FROM commands WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn update_command_status(
    conn: &Connection,
    id: &str,
    status: CommandStatus,
    last_run_at: Option<&str>,
) -> DbResult<()> {
    let now = now_rfc3339();
    conn.execute(
        "UPDATE commands SET last_run_status = ?1, last_run_at = ?2, updated_at = ?3 WHERE id = ?4",
        params![status.as_str(), last_run_at, now, id],
    )?;
    Ok(())
}

pub fn create_run(conn: &Connection, run: &Run) -> DbResult<()> {
    let now = now_rfc3339();
    conn.execute(
        "INSERT INTO runs (id, command_id, status, mode, started_at, finished_at,
                           duration_ms, exit_code, output_preview, output_path, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            run.id,
            run.command_id,
            run.status.as_str(),
            run.mode.as_str(),
            run.started_at,
            run.finished_at,
            run.duration_ms,
            run.exit_code,
            run.output_preview,
            run.output_path,
            now,
        ],
    )?;
    Ok(())
}

pub fn finalize_run(conn: &Connection, id: &str, c: &RunCompletion) -> DbResult<()> {
    let preview = truncate_output(&c.output_preview);
    conn.execute(
        "UPDATE runs SET status = ?1, finished_at = ?2, duration_ms = ?3,
                exit_code = ?4, output_preview = ?5, output_path = ?6
         WHERE id = ?7",
        params![
            c.status.as_str(),
            c.finished_at,
            c.duration_ms,
            c.exit_code,
            preview,
            c.output_path,
            id
        ],
    )?;
    Ok(())
}

pub fn list_runs(conn: &Connection, status_filter: Option<&str>) -> DbResult<Vec<Run>> {
    let mut stmt;
    let rows = if let Some(status) = status_filter {
        stmt = conn.prepare(
            "SELECT id, command_id, status, mode, started_at, finished_at,
                    duration_ms, exit_code, output_preview, output_path
             FROM runs WHERE status = ?1 ORDER BY started_at DESC LIMIT 500",
        )?;
        stmt.query_map(params![status], row_to_run)?
    } else {
        stmt = conn.prepare(
            "SELECT id, command_id, status, mode, started_at, finished_at,
                    duration_ms, exit_code, output_preview, output_path
             FROM runs ORDER BY started_at DESC LIMIT 500",
        )?;
        stmt.query_map([], row_to_run)?
    };

    let mut runs = Vec::new();
    for row in rows {
        runs.push(row?);
    }
    Ok(runs)
}

pub fn get_run_output_path(conn: &Connection, run_id: &str) -> DbResult<Option<String>> {
    let result = conn.query_row(
        "SELECT output_path FROM runs WHERE id = ?1",
        params![run_id],
        |r| r.get::<_, Option<String>>(0),
    );
    match result {
        Ok(path) => Ok(path),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

fn row_to_run(r: &rusqlite::Row) -> rusqlite::Result<Run> {
    let status_str: String = r.get(2)?;
    let mode_str: String = r.get(3)?;
    Ok(Run {
        id: r.get(0)?,
        command_id: r.get(1)?,
        status: RunStatus::from_str(&status_str),
        mode: RunMode::from_str(&mode_str),
        started_at: r.get(4)?,
        finished_at: r.get(5)?,
        duration_ms: r.get(6)?,
        exit_code: r.get(7)?,
        output_preview: r.get(8)?,
        output_path: r.get(9)?,
    })
}

pub fn list_schedules(conn: &Connection) -> DbResult<Vec<Schedule>> {
    let mut stmt = conn.prepare(
        "SELECT id, command_id, enabled, mode, cron_expr, run_at, label,
                next_run_at, created_at, updated_at
         FROM schedules ORDER BY created_at",
    )?;
    let rows = stmt.query_map([], row_to_schedule)?;
    let mut schedules = Vec::new();
    for row in rows {
        schedules.push(row?);
    }
    Ok(schedules)
}

pub fn list_enabled_schedules(conn: &Connection) -> DbResult<Vec<Schedule>> {
    let mut stmt = conn.prepare(
        "SELECT id, command_id, enabled, mode, cron_expr, run_at, label,
                next_run_at, created_at, updated_at
         FROM schedules WHERE enabled = 1 ORDER BY next_run_at",
    )?;
    let rows = stmt.query_map([], row_to_schedule)?;
    let mut schedules = Vec::new();
    for row in rows {
        schedules.push(row?);
    }
    Ok(schedules)
}

fn row_to_schedule(r: &rusqlite::Row) -> rusqlite::Result<Schedule> {
    let mode_str: String = r.get(3)?;
    Ok(Schedule {
        id: r.get(0)?,
        command_id: r.get(1)?,
        enabled: r.get::<_, i32>(2)? != 0,
        mode: ScheduleMode::from_str(&mode_str),
        cron_expr: r.get(4)?,
        run_at: r.get(5)?,
        label: r.get(6)?,
        next_run_at: r.get(7)?,
        created_at: r.get(8)?,
        updated_at: r.get(9)?,
    })
}

pub fn create_schedule(conn: &Connection, input: &ScheduleInput) -> DbResult<Schedule> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = now_rfc3339();
    let next_run_at = compute_next_run_at(input);

    conn.execute(
        "INSERT INTO schedules (id, command_id, enabled, mode, cron_expr, run_at,
                                label, next_run_at, created_at, updated_at)
         VALUES (?1, ?2, 1, ?3, ?4, ?5, ?6, ?7, ?8, ?8)",
        params![
            id,
            input.command_id,
            input.mode.as_str(),
            input.cron_expr,
            input.run_at,
            input.label,
            next_run_at,
            now,
        ],
    )?;

    conn.query_row(
        "SELECT id, command_id, enabled, mode, cron_expr, run_at, label,
                next_run_at, created_at, updated_at
         FROM schedules WHERE id = ?1",
        params![id],
        row_to_schedule,
    )
}

pub fn update_schedule(conn: &Connection, id: &str, input: &ScheduleInput) -> DbResult<Schedule> {
    let now = now_rfc3339();
    let next_run_at = compute_next_run_at(input);

    conn.execute(
        "UPDATE schedules SET command_id = ?1, mode = ?2, cron_expr = ?3, run_at = ?4,
                              label = ?5, next_run_at = ?6, updated_at = ?7
         WHERE id = ?8",
        params![
            input.command_id,
            input.mode.as_str(),
            input.cron_expr,
            input.run_at,
            input.label,
            next_run_at,
            now,
            id,
        ],
    )?;

    conn.query_row(
        "SELECT id, command_id, enabled, mode, cron_expr, run_at, label,
                next_run_at, created_at, updated_at
         FROM schedules WHERE id = ?1",
        params![id],
        row_to_schedule,
    )
}

pub fn toggle_schedule(conn: &Connection, id: &str) -> DbResult<Schedule> {
    let now = now_rfc3339();
    conn.execute(
        "UPDATE schedules SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END, updated_at = ?1
         WHERE id = ?2",
        params![now, id],
    )?;

    conn.query_row(
        "SELECT id, command_id, enabled, mode, cron_expr, run_at, label,
                next_run_at, created_at, updated_at
         FROM schedules WHERE id = ?1",
        params![id],
        row_to_schedule,
    )
}

pub fn delete_schedule(conn: &Connection, id: &str) -> DbResult<()> {
    conn.execute("DELETE FROM schedules WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn update_schedule_next_run(
    conn: &Connection,
    id: &str,
    next_run_at: Option<&str>,
) -> DbResult<()> {
    let now = now_rfc3339();
    conn.execute(
        "UPDATE schedules SET next_run_at = ?1, updated_at = ?2 WHERE id = ?3",
        params![next_run_at, now, id],
    )?;
    Ok(())
}

pub fn disable_schedule(conn: &Connection, id: &str) -> DbResult<()> {
    let now = now_rfc3339();
    conn.execute(
        "UPDATE schedules SET enabled = 0, updated_at = ?1 WHERE id = ?2",
        params![now, id],
    )?;
    Ok(())
}

fn compute_next_run_at(input: &ScheduleInput) -> Option<String> {
    match input.mode {
        ScheduleMode::Once => input.run_at.clone(),
        ScheduleMode::Recurring => {
            if let Some(ref expr) = input.cron_expr {
                parse_next_cron(expr).map(|dt| dt.to_rfc3339())
            } else {
                None
            }
        }
    }
}

fn parse_next_cron(expr: &str) -> Option<chrono::DateTime<chrono::Utc>> {
    use cron::Schedule;
    use std::str::FromStr;
    Schedule::from_str(expr)
        .ok()?
        .upcoming(chrono::Utc)
        .next()
}

pub fn truncate_output(s: &str) -> String {
    if s.len() <= MAX_PREVIEW_LEN {
        return s.to_string();
    }
    let start = s.len() - MAX_PREVIEW_LEN;
    let truncated = &s[start..];
    truncated.strip_prefix('\u{FFFD}').unwrap_or(truncated).to_string()
}

pub fn prune_runs(conn: &Connection) -> DbResult<Vec<String>> {
    let max_runs = get_setting_int(conn, "max_history_runs", 500);

    let deleted: Vec<String> = {
        let mut stmt = conn.prepare(
            "DELETE FROM runs WHERE id NOT IN (
                SELECT id FROM runs ORDER BY started_at DESC LIMIT ?1
            ) RETURNING id",
        )?;
        let rows = stmt.query_map(params![max_runs], |r| r.get::<_, String>(0))?;
        let mut ids = Vec::new();
        for row in rows {
            ids.push(row?);
        }
        ids
    };

    Ok(deleted)
}

pub fn cleanup_orphaned_logs(conn: &Connection, logs_dir: &Path) -> DbResult<()> {
    if !logs_dir.exists() {
        fs::create_dir_all(logs_dir).ok();
        return Ok(());
    }

    let valid_ids: HashSet<String> = {
        let mut stmt = conn.prepare("SELECT id FROM runs")?;
        let rows = stmt.query_map([], |r| r.get::<_, String>(0))?;
        let mut ids = HashSet::new();
        for row in rows {
            ids.insert(row?);
        }
        ids
    };

    if let Ok(entries) = fs::read_dir(logs_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                if !valid_ids.contains(stem) {
                    let _ = fs::remove_file(&path);
                }
            }
        }
    }

    Ok(())
}

pub fn expire_old_logs(conn: &Connection, logs_dir: &Path) -> DbResult<()> {
    let max_age_days = get_setting_int(conn, "log_retention_days", 30);
    let cutoff = Utc::now() - Duration::days(max_age_days);
    let cutoff_str = cutoff.to_rfc3339();

    let old_runs: Vec<(String, Option<String>)> = {
        let mut stmt = conn.prepare(
            "SELECT id, output_path FROM runs WHERE started_at < ?1 AND output_path IS NOT NULL",
        )?;
        let rows = stmt.query_map(params![cutoff_str], |r| {
            Ok((r.get::<_, String>(0)?, r.get::<_, Option<String>>(1)?))
        })?;
        let mut runs = Vec::new();
        for row in rows {
            runs.push(row?);
        }
        runs
    };

    for (run_id, path) in old_runs {
        if let Some(ref p) = path {
            let full_path = std::path::Path::new(p);
            let resolved = if full_path.is_absolute() {
                full_path.to_path_buf()
            } else {
                logs_dir.join(p)
            };
            let _ = fs::remove_file(&resolved);
        }
        conn.execute(
            "UPDATE runs SET output_path = NULL WHERE id = ?1",
            params![run_id],
        )?;
    }

    Ok(())
}

pub fn export_config(conn: &Connection) -> DbResult<ConfigExport> {
    let groups = list_groups(conn)?;
    let commands = list_commands(conn)?;
    let schedules = list_schedules(conn)?;
    Ok(ConfigExport {
        groups,
        commands,
        schedules,
    })
}

pub fn import_config(conn: &Connection, data: &ConfigExport) -> DbResult<()> {
    use std::collections::HashMap;

    let mut group_map: HashMap<String, String> = HashMap::new();

    for group in &data.groups {
        let target_id = if let Some(existing) = get_group_by_name(conn, &group.name)? {
            existing.id
        } else {
            let created = create_group(
                conn,
                &GroupInput {
                    name: group.name.clone(),
                    icon: group.icon.clone(),
                    position: Some(group.position),
                },
            )?;
            created.id
        };
        group_map.insert(group.id.clone(), target_id);
    }

    let mut command_map: HashMap<String, String> = HashMap::new();

    for cmd in &data.commands {
        let group_id = group_map
            .get(&cmd.group_id)
            .cloned()
            .or_else(|| group_map.values().next().cloned())
            .unwrap_or_default();

        let input = CommandInput {
            name: cmd.name.clone(),
            command: cmd.command.clone(),
            cwd: cmd.cwd.clone(),
            group_id,
            requires_confirmation: cmd.requires_confirmation,
            run_in_background: cmd.run_in_background,
            icon: cmd.icon.clone(),
            position: Some(cmd.position),
        };

        let created = create_command(conn, &input)?;
        command_map.insert(cmd.id.clone(), created.id);
    }

    for sched in &data.schedules {
        let command_id = command_map.get(&sched.command_id).cloned().unwrap_or_default();
        if command_id.is_empty() {
            continue;
        }

        let input = ScheduleInput {
            command_id,
            mode: sched.mode,
            cron_expr: sched.cron_expr.clone(),
            run_at: sched.run_at.clone(),
            label: sched.label.clone(),
        };

        let _ = create_schedule(conn, &input);
    }

    Ok(())
}
