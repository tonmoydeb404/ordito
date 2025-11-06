//! Scheduler service for executing commands on a cron schedule.
//!
//! This module provides the `SchedulerService` which runs as a background task
//! and executes commands based on their cron schedules. The scheduler:
//!
//! - Checks every minute for schedules that are due to run
//! - Executes commands via the `ExecutionService`
//! - Handles errors gracefully and continues running
//! - Links executions to their triggering schedule
//!
//! # Example
//!
//! ```no_run
//! use std::sync::Arc;
//! use ordito_lib::app::scheduler::SchedulerService;
//!
//! async fn start_scheduler(pool: Arc<sqlx::SqlitePool>, log_storage: Arc<LogStorage>) {
//!     let scheduler = SchedulerService::new(pool, log_storage);
//!     let handle = scheduler.start();
//!     // Scheduler runs in background...
//! }
//! ```

use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Result};
use chrono::Utc;
use cron::Schedule;
use sqlx::SqlitePool;
use tokio::time::sleep;
use tracing::{error, info, warn};

use crate::app::execution::ExecutionService;
use crate::db::command_schedule::CommandScheduleRepository;
use crate::io::log_storage::LogStorage;

/// Service responsible for managing scheduled command executions
pub struct SchedulerService {
    pool: Arc<SqlitePool>,
    log_storage: Arc<LogStorage>,
    check_interval: Duration,
}

impl SchedulerService {
    /// Creates a new SchedulerService
    ///
    /// # Arguments
    /// * `pool` - Database connection pool (wrapped in Arc for sharing)
    /// * `log_storage` - LogStorage instance (wrapped in Arc for sharing)
    pub fn new(pool: Arc<SqlitePool>, log_storage: Arc<LogStorage>) -> Self {
        Self {
            pool,
            log_storage,
            check_interval: Duration::from_secs(60), // Check every minute
        }
    }

    /// Starts the scheduler background task
    ///
    /// This method spawns a background task that:
    /// - Runs continuously in the background
    /// - Checks every minute for schedules that are due
    /// - Executes commands when their schedule matches
    /// - Handles errors gracefully without stopping the scheduler
    ///
    /// # Returns
    /// A JoinHandle that can be used to await the scheduler task
    pub fn start(self) -> tokio::task::JoinHandle<()> {
        info!("Starting scheduler service...");

        tokio::spawn(async move {
            loop {
                if let Err(e) = self.check_and_execute_schedules().await {
                    error!("Error in scheduler: {}", e);
                }

                // Sleep until next check interval
                sleep(self.check_interval).await;
            }
        })
    }

    /// Checks all schedules and executes commands that are due
    async fn check_and_execute_schedules(&self) -> Result<()> {
        let schedule_repo = CommandScheduleRepository::new(&self.pool);

        // Fetch all schedules from database
        let schedules = schedule_repo.get_all().await?;

        if schedules.is_empty() {
            return Ok(());
        }

        info!("Checking {} schedules...", schedules.len());

        let now = Utc::now();

        for schedule in schedules {
            // Parse cron expression
            let cron_schedule = match Schedule::from_str(&schedule.cron_expression) {
                Ok(s) => s,
                Err(e) => {
                    warn!(
                        "Invalid cron expression for schedule {}: {} - {}",
                        schedule.id, schedule.cron_expression, e
                    );
                    continue;
                }
            };

            // Check if schedule should run now
            if self.should_execute(&cron_schedule, now) {
                info!(
                    "Executing scheduled command: {} (schedule: {})",
                    schedule.command_id, schedule.id
                );

                // Execute the command
                let pool = self.pool.clone();
                let log_storage = self.log_storage.clone();
                let command_id = schedule.command_id.to_string();
                let schedule_id = schedule.id.to_string();
                let show_notification = schedule.show_notification;

                // Spawn execution in separate task to avoid blocking scheduler
                tokio::spawn(async move {
                    let execution_service = ExecutionService::new(&pool, &log_storage);

                    match execution_service
                        .execute_command(&command_id, Some(&schedule_id))
                        .await
                    {
                        Ok(result) => {
                            info!(
                                "Scheduled command executed successfully: {} (status: {:?})",
                                command_id, result.status
                            );

                            // TODO: Send notification if enabled
                            if show_notification {
                                // Notification will be implemented in Task 2.4
                                info!("Notification requested for command: {}", command_id);
                            }
                        }
                        Err(e) => {
                            error!("Failed to execute scheduled command {}: {}", command_id, e);
                        }
                    }
                });
            }
        }

        Ok(())
    }

    /// Determines if a schedule should execute based on the current time
    ///
    /// # Arguments
    /// * `schedule` - The parsed cron schedule
    /// * `now` - Current time
    ///
    /// # Returns
    /// true if the schedule should execute, false otherwise
    fn should_execute(&self, schedule: &Schedule, now: chrono::DateTime<Utc>) -> bool {
        // Get the next scheduled time after "now - check_interval"
        // This ensures we catch schedules that were due since the last check
        let check_start = now - chrono::Duration::seconds(self.check_interval.as_secs() as i64);

        // Get upcoming scheduled times
        let mut upcoming = schedule.after(&check_start);

        // Check if the next scheduled time is between our last check and now
        if let Some(next_time) = upcoming.next() {
            // Schedule is due if next_time is in the past or within the current minute
            next_time <= now && next_time > check_start
        } else {
            false
        }
    }

    /// Validates a cron expression
    ///
    /// # Arguments
    /// * `cron_expression` - Cron expression string to validate
    ///
    /// # Returns
    /// Ok(()) if valid, Err with description if invalid
    pub fn validate_cron_expression(cron_expression: &str) -> Result<()> {
        Schedule::from_str(cron_expression)
            .map(|_| ())
            .map_err(|e| anyhow!("Invalid cron expression: {}", e))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_cron_expression() {
        // Valid expressions
        assert!(SchedulerService::validate_cron_expression("0 0 * * * *").is_ok());
        assert!(SchedulerService::validate_cron_expression("*/5 * * * * *").is_ok());
        assert!(SchedulerService::validate_cron_expression("0 0 12 * * *").is_ok());

        // Invalid expressions
        assert!(SchedulerService::validate_cron_expression("invalid").is_err());
        assert!(SchedulerService::validate_cron_expression("99 99 * * * *").is_err());
        assert!(SchedulerService::validate_cron_expression("").is_err());
    }

    #[test]
    fn test_should_execute() {
        // Test with a schedule that runs every minute
        let cron_str = "0 * * * * *"; // Every minute at second 0
        let schedule = Schedule::from_str(cron_str).unwrap();

        let pool = Arc::new(
            // In a real test, use a test database
            SqlitePool::connect_lazy("sqlite::memory:").unwrap(),
        );
        let log_storage = Arc::new(LogStorage {
            base_path: std::path::PathBuf::from("/tmp/test"),
        });

        let scheduler = SchedulerService::new(pool, log_storage);

        // This is a basic structure - in real tests you'd mock the time
        let now = Utc::now();

        // Test would verify schedule execution logic
        // In practice, you'd use a time-mocking library for reliable tests
    }
}
