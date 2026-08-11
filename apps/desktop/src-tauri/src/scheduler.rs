use std::str::FromStr;
use std::time::Duration;

use chrono::{DateTime, Local, Utc};
use cron::Schedule;
use tauri::{AppHandle, Manager};

use crate::db;
use crate::executor;
use crate::models::*;
use crate::state::AppState;

const TICK_INTERVAL: Duration = Duration::from_secs(60);

pub async fn start(app: AppHandle) {
    loop {
        tick(&app);
        tokio::time::sleep(TICK_INTERVAL).await;
    }
}

fn tick(app: &AppHandle) {
    let state = app.state::<AppState>();
    let schedules = {
        let conn = match state.db.lock() {
            Ok(c) => c,
            Err(_) => return,
        };
        match db::list_enabled_schedules(&conn) {
            Ok(s) => s,
            Err(_) => return,
        }
    };

    let now = Utc::now();

    for schedule in schedules {
        let should_fire = match schedule.mode {
            ScheduleMode::Once => {
                if let Some(ref run_at_str) = schedule.run_at {
                    DateTime::parse_from_rfc3339(run_at_str)
                        .map(|dt| dt.with_timezone(&Utc) <= now)
                        .unwrap_or(false)
                } else {
                    false
                }
            }
            ScheduleMode::Recurring => {
                if let Some(ref next_str) = schedule.next_run_at {
                    DateTime::parse_from_rfc3339(next_str)
                        .map(|dt| dt.with_timezone(&Utc) <= now)
                        .unwrap_or(false)
                } else {
                    // missing/unparseable next_run_at should never trigger a run
                    false
                }
            }
        };

        if !should_fire {
            continue;
        }

        let command = {
            let conn = match state.db.lock() {
                Ok(c) => c,
                Err(_) => continue,
            };
            db::get_command(&conn, &schedule.command_id).ok().flatten()
        };

        if let Some(command) = command {
            let _ = executor::run_command(app, &command.id);

            let conn = match state.db.lock() {
                Ok(c) => c,
                Err(_) => continue,
            };

            match schedule.mode {
                ScheduleMode::Once => {
                    let _ = db::disable_schedule(&conn, &schedule.id);
                }
                ScheduleMode::Recurring => {
                    let next = schedule
                        .cron_expr
                        .as_ref()
                        .and_then(|expr| {
                            Schedule::from_str(expr)
                                .ok()
                                .and_then(|s| s.upcoming(Local).next())
                                .map(|dt| dt.to_rfc3339())
                        });
                    let _ = db::update_schedule_next_run(&conn, &schedule.id, next.as_deref());
                }
            }
        }
    }
}
