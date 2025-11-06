//! Error types and validation helpers for the Ordito application.
//!
//! This module provides:
//!
//! - **AppError**: A comprehensive error enum for all application errors
//! - **AppResult**: A type alias for `Result<T, AppError>`
//! - **Validation functions**: Helpers to validate user inputs before processing
//!
//! # Error Types
//!
//! The `AppError` enum covers all major error categories:
//! - Database operations
//! - Command execution
//! - Scheduling operations
//! - Input validation
//! - I/O operations
//! - Parsing errors
//!
//! All error variants are serializable for Tauri error responses.
//!
//! # Validation
//!
//! Validation functions ensure that user inputs are safe and valid:
//! - Cron expressions are parseable
//! - UUIDs are well-formed
//! - Directories exist and are accessible
//! - Environment variables don't contain dangerous values
//! - Commands don't contain null bytes
//! - Timeouts are within acceptable ranges

use serde::{Deserialize, Serialize};
use std::fmt;

/// Custom error types for the application
///
/// This enum provides structured error handling across all application layers.
/// All variants implement Serialize for Tauri error responses.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    /// Database operation failed
    DatabaseError(String),

    /// Command execution failed
    ExecutionError(String),

    /// Scheduler operation failed
    SchedulerError(String),

    /// Notification delivery failed
    NotificationError(String),

    /// Input validation failed
    ValidationError(String),

    /// Resource not found
    NotFoundError(String),

    /// Parsing or serialization error
    ParseError(String),

    /// I/O operation failed
    IoError(String),

    /// Permission denied
    PermissionError(String),

    /// Timeout occurred
    TimeoutError(String),

    /// Operation was cancelled
    CancelledError(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            AppError::ExecutionError(msg) => write!(f, "Execution error: {}", msg),
            AppError::SchedulerError(msg) => write!(f, "Scheduler error: {}", msg),
            AppError::NotificationError(msg) => write!(f, "Notification error: {}", msg),
            AppError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            AppError::NotFoundError(msg) => write!(f, "Not found: {}", msg),
            AppError::ParseError(msg) => write!(f, "Parse error: {}", msg),
            AppError::IoError(msg) => write!(f, "I/O error: {}", msg),
            AppError::PermissionError(msg) => write!(f, "Permission denied: {}", msg),
            AppError::TimeoutError(msg) => write!(f, "Timeout: {}", msg),
            AppError::CancelledError(msg) => write!(f, "Cancelled: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

// ============================================================================
// Conversions from common error types
// ============================================================================

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => AppError::NotFoundError("Record not found".to_string()),
            sqlx::Error::Database(db_err) => {
                AppError::DatabaseError(format!("Database error: {}", db_err))
            }
            _ => AppError::DatabaseError(err.to_string()),
        }
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        match err.kind() {
            std::io::ErrorKind::NotFound => {
                AppError::NotFoundError(format!("File or directory not found: {}", err))
            }
            std::io::ErrorKind::PermissionDenied => {
                AppError::PermissionError(format!("Permission denied: {}", err))
            }
            std::io::ErrorKind::TimedOut => AppError::TimeoutError(err.to_string()),
            _ => AppError::IoError(err.to_string()),
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::ParseError(format!("JSON error: {}", err))
    }
}

impl From<uuid::Error> for AppError {
    fn from(err: uuid::Error) -> Self {
        AppError::ParseError(format!("UUID error: {}", err))
    }
}

impl From<cron::error::Error> for AppError {
    fn from(err: cron::error::Error) -> Self {
        AppError::ValidationError(format!("Invalid cron expression: {}", err))
    }
}

impl From<tokio::time::error::Elapsed> for AppError {
    fn from(err: tokio::time::error::Elapsed) -> Self {
        AppError::TimeoutError(err.to_string())
    }
}

// Implement From<anyhow::Error> for backward compatibility during migration
impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        // Try to downcast to known error types
        if let Some(sql_err) = err.downcast_ref::<sqlx::Error>() {
            return match sql_err {
                sqlx::Error::RowNotFound => AppError::NotFoundError("Record not found".to_string()),
                sqlx::Error::Database(db_err) => {
                    AppError::DatabaseError(format!("Database error: {}", db_err))
                }
                _ => AppError::DatabaseError(sql_err.to_string()),
            };
        }
        if let Some(io_err) = err.downcast_ref::<std::io::Error>() {
            return AppError::IoError(io_err.to_string());
        }

        // Default to execution error with the full error chain
        AppError::ExecutionError(format!("{:#}", err))
    }
}

/// Result type alias using AppError
pub type AppResult<T> = Result<T, AppError>;

// ============================================================================
// Validation helpers
// ============================================================================

/// Validates a cron expression
///
/// # Arguments
/// * `expression` - The cron expression to validate
///
/// # Returns
/// Ok(()) if valid, ValidationError if invalid
pub fn validate_cron_expression(expression: &str) -> AppResult<()> {
    use cron::Schedule;
    use std::str::FromStr;

    Schedule::from_str(expression).map_err(|e| {
        AppError::ValidationError(format!("Invalid cron expression '{}': {}", expression, e))
    })?;

    Ok(())
}

/// Validates a UUID string
///
/// # Arguments
/// * `uuid_str` - The UUID string to validate
/// * `field_name` - Name of the field for error messages
///
/// # Returns
/// Ok(Uuid) if valid, ValidationError if invalid
pub fn validate_uuid(uuid_str: &str, field_name: &str) -> AppResult<uuid::Uuid> {
    uuid::Uuid::parse_str(uuid_str).map_err(|_| {
        AppError::ValidationError(format!("Invalid UUID for {}: '{}'", field_name, uuid_str))
    })
}

/// Validates that a directory path exists and is accessible
///
/// # Arguments
/// * `path` - The directory path to validate
///
/// # Returns
/// Ok(()) if valid, appropriate error if not
pub fn validate_directory(path: &str) -> AppResult<()> {
    if path.is_empty() {
        return Err(AppError::ValidationError(
            "Directory path cannot be empty".to_string(),
        ));
    }

    let path_buf = std::path::Path::new(path);

    if !path_buf.exists() {
        return Err(AppError::NotFoundError(format!(
            "Directory does not exist: {}",
            path
        )));
    }

    if !path_buf.is_dir() {
        return Err(AppError::ValidationError(format!(
            "Path is not a directory: {}",
            path
        )));
    }

    // Check if we can read the directory
    std::fs::read_dir(path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            AppError::PermissionError(format!("Cannot access directory: {}", path))
        } else {
            AppError::IoError(format!("Cannot read directory {}: {}", path, e))
        }
    })?;

    Ok(())
}

/// Validates environment variables for dangerous patterns
///
/// # Arguments
/// * `env_vars` - JSON string containing environment variables
///
/// # Returns
/// Ok(HashMap) if valid, ValidationError if invalid
pub fn validate_env_vars(env_vars: &str) -> AppResult<std::collections::HashMap<String, String>> {
    if env_vars.is_empty() {
        return Ok(std::collections::HashMap::new());
    }

    let vars: std::collections::HashMap<String, String> = serde_json::from_str(env_vars)
        .map_err(|e| AppError::ValidationError(format!("Invalid environment variables JSON: {}", e)))?;

    // Check for dangerous environment variables
    const DANGEROUS_VARS: &[&str] = &["LD_PRELOAD", "LD_LIBRARY_PATH", "DYLD_INSERT_LIBRARIES"];

    for dangerous_var in DANGEROUS_VARS {
        if vars.contains_key(*dangerous_var) {
            return Err(AppError::ValidationError(format!(
                "Dangerous environment variable not allowed: {}",
                dangerous_var
            )));
        }
    }

    // Limit number of environment variables
    const MAX_ENV_VARS: usize = 100;
    if vars.len() > MAX_ENV_VARS {
        return Err(AppError::ValidationError(format!(
            "Too many environment variables (max {})",
            MAX_ENV_VARS
        )));
    }

    // Check each variable name and value
    for (key, value) in &vars {
        // Variable names should be valid identifiers
        if key.is_empty() || !key.chars().all(|c| c.is_alphanumeric() || c == '_') {
            return Err(AppError::ValidationError(format!(
                "Invalid environment variable name: '{}'",
                key
            )));
        }

        // Check for null bytes in values
        if value.contains('\0') {
            return Err(AppError::ValidationError(format!(
                "Environment variable '{}' contains null bytes",
                key
            )));
        }

        // Limit value length
        const MAX_VALUE_LENGTH: usize = 10_000;
        if value.len() > MAX_VALUE_LENGTH {
            return Err(AppError::ValidationError(format!(
                "Environment variable '{}' value too long (max {} bytes)",
                key, MAX_VALUE_LENGTH
            )));
        }
    }

    Ok(vars)
}

/// Validates command string for basic safety
///
/// # Arguments
/// * `command` - The command string to validate
///
/// # Returns
/// Ok(()) if valid, ValidationError if suspicious patterns detected
pub fn validate_command(command: &str) -> AppResult<()> {
    if command.trim().is_empty() {
        return Err(AppError::ValidationError(
            "Command cannot be empty".to_string(),
        ));
    }

    // Check for null bytes
    if command.contains('\0') {
        return Err(AppError::ValidationError(
            "Command contains null bytes".to_string(),
        ));
    }

    // Warn about potentially dangerous patterns (but don't block them)
    // This is informational only, as legitimate commands may use these patterns
    const SUSPICIOUS_PATTERNS: &[&str] = &[
        "rm -rf /",
        "mkfs",
        "dd if=/dev/zero",
        ":(){ :|:& };:",  // Fork bomb
    ];

    for pattern in SUSPICIOUS_PATTERNS {
        if command.contains(pattern) {
            tracing::warn!(
                "Command contains potentially dangerous pattern: '{}'",
                pattern
            );
        }
    }

    Ok(())
}

/// Validates timeout value
///
/// # Arguments
/// * `timeout` - Optional timeout in seconds
///
/// # Returns
/// Ok(()) if valid, ValidationError if out of range
pub fn validate_timeout(timeout: Option<u32>) -> AppResult<()> {
    if let Some(t) = timeout {
        const MAX_TIMEOUT: u32 = 86400; // 24 hours
        if t == 0 {
            return Err(AppError::ValidationError(
                "Timeout must be greater than 0".to_string(),
            ));
        }
        if t > MAX_TIMEOUT {
            return Err(AppError::ValidationError(format!(
                "Timeout too large (max {} seconds / 24 hours)",
                MAX_TIMEOUT
            )));
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_cron_expression() {
        assert!(validate_cron_expression("0 0 * * *").is_ok());
        assert!(validate_cron_expression("*/5 * * * *").is_ok());
        assert!(validate_cron_expression("invalid").is_err());
    }

    #[test]
    fn test_validate_uuid() {
        let valid_uuid = "550e8400-e29b-41d4-a716-446655440000";
        assert!(validate_uuid(valid_uuid, "test").is_ok());
        assert!(validate_uuid("invalid", "test").is_err());
    }

    #[test]
    fn test_validate_env_vars() {
        // Valid cases
        assert!(validate_env_vars("{}").is_ok());
        assert!(validate_env_vars(r#"{"FOO":"bar"}"#).is_ok());

        // Invalid JSON
        assert!(validate_env_vars("not json").is_err());

        // Dangerous variables
        assert!(validate_env_vars(r#"{"LD_PRELOAD":"evil.so"}"#).is_err());

        // Invalid variable names
        assert!(validate_env_vars(r#"{"":"value"}"#).is_err());
        assert!(validate_env_vars(r#"{"var-name":"value"}"#).is_err());
    }

    #[test]
    fn test_validate_command() {
        assert!(validate_command("ls -la").is_ok());
        assert!(validate_command("").is_err());
        assert!(validate_command("   ").is_err());
        assert!(validate_command("command\0null").is_err());
    }

    #[test]
    fn test_validate_timeout() {
        assert!(validate_timeout(None).is_ok());
        assert!(validate_timeout(Some(60)).is_ok());
        assert!(validate_timeout(Some(0)).is_err());
        assert!(validate_timeout(Some(86401)).is_err());
    }
}
