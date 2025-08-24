use crate::error::{OrditoError, Result};
use chrono::{DateTime, Utc};
use cron::Schedule;
use std::str::FromStr;

pub use crate::services::scheduler_service::SchedulerService;

pub fn parse_cron_expression(expression: &str) -> Result<Schedule> {
    Schedule::from_str(expression).map_err(|e| {
        OrditoError::CronExpression(format!("Invalid cron expression '{}': {}", expression, e))
    })
}

pub fn get_next_execution_time(expression: &str) -> Result<DateTime<Utc>> {
    let schedule = parse_cron_expression(expression)?;
    let mut upcoming = schedule.upcoming(chrono_tz::UTC).take(1);

    upcoming
        .next()
        .map(|dt| dt.with_timezone(&Utc))
        .ok_or_else(|| OrditoError::CronExpression("No upcoming execution time found".to_string()))
}

pub fn get_next_n_execution_times(expression: &str, count: usize) -> Result<Vec<DateTime<Utc>>> {
    let schedule = parse_cron_expression(expression)?;
    let upcoming: Vec<DateTime<Utc>> = schedule
        .upcoming(chrono_tz::UTC)
        .take(count)
        .map(|dt| dt.with_timezone(&Utc))
        .collect();

    if upcoming.is_empty() {
        return Err(OrditoError::CronExpression(
            "No upcoming execution times found".to_string(),
        ));
    }

    Ok(upcoming)
}

pub fn is_cron_expression_valid(expression: &str) -> bool {
    parse_cron_expression(expression).is_ok()
}

pub fn format_cron_description(expression: &str) -> String {
    match expression {
        "0 * * * *" => "Every hour".to_string(),
        "0 0 * * *" => "Daily at midnight".to_string(),
        "0 0 * * 0" => "Weekly on Sunday at midnight".to_string(),
        "0 0 1 * *" => "Monthly on the 1st at midnight".to_string(),
        "0 0 1 1 *" => "Yearly on January 1st at midnight".to_string(),
        _ => {
            if let Ok(schedule) = parse_cron_expression(expression) {
                // Try to get next few executions to provide a description
                let upcoming: Vec<DateTime<Utc>> = schedule
                    .upcoming(chrono_tz::UTC)
                    .take(3)
                    .map(|dt| dt.with_timezone(&Utc))
                    .collect();
                if !upcoming.is_empty() {
                    format!(
                        "Next runs: {}",
                        upcoming
                            .iter()
                            .map(|dt| dt.format("%Y-%m-%d %H:%M UTC").to_string())
                            .collect::<Vec<_>>()
                            .join(", ")
                    )
                } else {
                    "Valid cron expression".to_string()
                }
            } else {
                "Invalid cron expression".to_string()
            }
        }
    }
}

pub fn suggest_common_cron_patterns() -> Vec<(String, String)> {
    vec![
        ("*/5 * * * *".to_string(), "Every 5 minutes".to_string()),
        ("*/15 * * * *".to_string(), "Every 15 minutes".to_string()),
        ("*/30 * * * *".to_string(), "Every 30 minutes".to_string()),
        ("0 * * * *".to_string(), "Every hour".to_string()),
        ("0 */2 * * *".to_string(), "Every 2 hours".to_string()),
        ("0 */6 * * *".to_string(), "Every 6 hours".to_string()),
        ("0 0 * * *".to_string(), "Daily at midnight".to_string()),
        ("0 6 * * *".to_string(), "Daily at 6 AM".to_string()),
        ("0 12 * * *".to_string(), "Daily at noon".to_string()),
        ("0 18 * * *".to_string(), "Daily at 6 PM".to_string()),
        (
            "0 0 * * 1".to_string(),
            "Weekly on Monday at midnight".to_string(),
        ),
        (
            "0 0 * * 0".to_string(),
            "Weekly on Sunday at midnight".to_string(),
        ),
        ("0 0 1 * *".to_string(), "Monthly on the 1st".to_string()),
        (
            "0 0 1,15 * *".to_string(),
            "Twice monthly (1st and 15th)".to_string(),
        ),
        ("0 0 1 1 *".to_string(), "Yearly on January 1st".to_string()),
        ("0 9 * * 1-5".to_string(), "Weekdays at 9 AM".to_string()),
        (
            "0 0 * * 6,0".to_string(),
            "Weekends at midnight".to_string(),
        ),
    ]
}

pub fn validate_and_describe_cron(expression: &str) -> Result<String> {
    if !is_cron_expression_valid(expression) {
        return Err(OrditoError::CronExpression(format!(
            "Invalid cron expression: {}",
            expression
        )));
    }

    Ok(format_cron_description(expression))
}

pub struct CronExpressionBuilder {
    minute: String,
    hour: String,
    day_of_month: String,
    month: String,
    day_of_week: String,
}

impl Default for CronExpressionBuilder {
    fn default() -> Self {
        Self {
            minute: "*".to_string(),
            hour: "*".to_string(),
            day_of_month: "*".to_string(),
            month: "*".to_string(),
            day_of_week: "*".to_string(),
        }
    }
}

impl CronExpressionBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn minute(mut self, minute: &str) -> Self {
        self.minute = minute.to_string();
        self
    }

    pub fn hour(mut self, hour: &str) -> Self {
        self.hour = hour.to_string();
        self
    }

    pub fn day_of_month(mut self, day: &str) -> Self {
        self.day_of_month = day.to_string();
        self
    }

    pub fn month(mut self, month: &str) -> Self {
        self.month = month.to_string();
        self
    }

    pub fn day_of_week(mut self, day: &str) -> Self {
        self.day_of_week = day.to_string();
        self
    }

    pub fn build(self) -> String {
        format!(
            "{} {} {} {} {}",
            self.minute, self.hour, self.day_of_month, self.month, self.day_of_week
        )
    }

    pub fn build_and_validate(self) -> Result<String> {
        let expression = self.build();
        validate_and_describe_cron(&expression)?;
        Ok(expression)
    }
}

pub fn time_until_next_execution(expression: &str) -> Result<chrono::Duration> {
    let next_time = get_next_execution_time(expression)?;
    let now = Utc::now();

    if next_time <= now {
        return Err(OrditoError::CronExpression(
            "Next execution time is in the past".to_string(),
        ));
    }

    Ok(next_time - now)
}

pub fn format_time_until_execution(expression: &str) -> Result<String> {
    let duration = time_until_next_execution(expression)?;

    let total_seconds = duration.num_seconds();

    if total_seconds < 60 {
        Ok(format!("{}s", total_seconds))
    } else if total_seconds < 3600 {
        let minutes = total_seconds / 60;
        let seconds = total_seconds % 60;
        Ok(format!("{}m {}s", minutes, seconds))
    } else if total_seconds < 86400 {
        let hours = total_seconds / 3600;
        let minutes = (total_seconds % 3600) / 60;
        Ok(format!("{}h {}m", hours, minutes))
    } else {
        let days = total_seconds / 86400;
        let hours = (total_seconds % 86400) / 3600;
        Ok(format!("{}d {}h", days, hours))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_valid_cron_expressions() {
        let valid_expressions = vec![
            "0 0 * * *",    // Daily at midnight
            "*/5 * * * *",  // Every 5 minutes
            "0 12 * * 1-5", // Weekdays at noon
            "0 0 1 * *",    // Monthly
        ];

        for expr in valid_expressions {
            assert!(
                parse_cron_expression(expr).is_ok(),
                "Expression '{}' should be valid",
                expr
            );
        }
    }

    #[test]
    fn test_parse_invalid_cron_expressions() {
        let invalid_expressions = vec![
            "invalid",
            "60 * * * *", // Invalid minute
            "* 25 * * *", // Invalid hour
            "* * 32 * *", // Invalid day
            "* * * 13 *", // Invalid month
            "* * * * 8",  // Invalid day of week
        ];

        for expr in invalid_expressions {
            assert!(
                parse_cron_expression(expr).is_err(),
                "Expression '{}' should be invalid",
                expr
            );
        }
    }

    #[test]
    fn test_cron_expression_builder() {
        let expr = CronExpressionBuilder::new()
            .minute("0")
            .hour("12")
            .day_of_week("1-5")
            .build();

        assert_eq!(expr, "0 12 * * 1-5");
        assert!(is_cron_expression_valid(&expr));
    }

    #[test]
    fn test_get_next_execution_time() {
        let expr = "0 0 * * *"; // Daily at midnight
        let next_time = get_next_execution_time(expr).unwrap();

        // Should be some time in the future
        assert!(next_time > Utc::now());
    }

    #[test]
    fn test_format_cron_description() {
        assert_eq!(format_cron_description("0 0 * * *"), "Daily at midnight");
        assert_eq!(format_cron_description("0 * * * *"), "Every hour");
        assert_eq!(
            format_cron_description("0 0 * * 0"),
            "Weekly on Sunday at midnight"
        );
    }

    #[test]
    fn test_suggest_common_patterns() {
        let patterns = suggest_common_cron_patterns();
        assert!(!patterns.is_empty());

        // Check that all suggested patterns are valid
        for (expr, _desc) in patterns {
            assert!(
                is_cron_expression_valid(&expr),
                "Pattern '{}' should be valid",
                expr
            );
        }
    }
}
