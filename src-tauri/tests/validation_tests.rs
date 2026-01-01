/// Validation-focused tests that don't require database setup
/// These tests focus on the error handling and validation logic
use ordito_lib::app::error::{
    validate_command, validate_cron_expression, validate_directory, validate_env_vars,
    validate_timeout, validate_uuid, AppError,
};

// ============================================================================
// Validation Tests
// ============================================================================

#[test]
fn test_validate_cron_expression_valid() {
    // Note: cron crate expects 6 fields: sec min hour day month dow year (optional)
    assert!(validate_cron_expression("0 0 0 * * *").is_ok()); // Daily at midnight
    assert!(validate_cron_expression("0 */5 * * * *").is_ok()); // Every 5 minutes
    assert!(validate_cron_expression("0 0 12 * * MON-FRI").is_ok()); // Weekdays at noon
    assert!(validate_cron_expression("0 0 0 1 * *").is_ok()); // First day of month
}

#[test]
fn test_validate_cron_expression_invalid() {
    assert!(validate_cron_expression("invalid").is_err());
    assert!(validate_cron_expression("* * * *").is_err()); // Missing fields (needs 6)
    assert!(validate_cron_expression("0 60 * * * *").is_err()); // Invalid minute
    assert!(validate_cron_expression("").is_err());
    assert!(validate_cron_expression("0 0 0 * *").is_err()); // Only 5 fields
}

#[test]
fn test_validate_uuid_valid() {
    let valid = "550e8400-e29b-41d4-a716-446655440000";
    assert!(validate_uuid(valid, "test").is_ok());

    let result = validate_uuid(valid, "test").unwrap();
    assert_eq!(result.to_string(), valid);
}

#[test]
fn test_validate_uuid_invalid() {
    assert!(validate_uuid("invalid", "test").is_err());
    assert!(validate_uuid("", "test").is_err());
    assert!(validate_uuid("not-a-uuid", "test").is_err());
    assert!(validate_uuid("123-456-789", "test").is_err());
}

#[test]
fn test_validate_uuid_error_message() {
    let result = validate_uuid("bad_uuid", "command_id");
    assert!(result.is_err());

    let err = result.unwrap_err();
    let err_msg = err.to_string();
    assert!(err_msg.contains("command_id"));
    assert!(err_msg.contains("bad_uuid"));
}

#[test]
fn test_validate_directory_valid() {
    let temp_dir = std::env::temp_dir();
    assert!(validate_directory(temp_dir.to_str().unwrap()).is_ok());

    // Current directory should be valid
    assert!(validate_directory(".").is_ok());
}

#[test]
fn test_validate_directory_invalid() {
    assert!(validate_directory("").is_err());
    assert!(validate_directory("/nonexistent/directory/path/that/does/not/exist").is_err());
}

#[test]
fn test_validate_directory_not_a_directory() {
    // Create a temporary file
    let temp_file = std::env::temp_dir().join("test_file_not_dir.txt");
    std::fs::write(&temp_file, "test").unwrap();

    let result = validate_directory(temp_file.to_str().unwrap());
    assert!(result.is_err());

    // Clean up
    std::fs::remove_file(temp_file).ok();
}

#[test]
fn test_validate_env_vars_valid() {
    assert!(validate_env_vars("{}").is_ok());
    assert!(validate_env_vars(r#"{"FOO":"bar"}"#).is_ok());
    assert!(validate_env_vars(r#"{"FOO":"bar","BAZ":"qux"}"#).is_ok());
    assert!(validate_env_vars(r#"{"PATH_VAR":"/usr/local/bin"}"#).is_ok());
    assert!(validate_env_vars(r#"{"MY_VAR_123":"value"}"#).is_ok());
}

#[test]
fn test_validate_env_vars_empty_string() {
    // Empty string should be treated as valid (no env vars)
    assert!(validate_env_vars("").is_ok());
}

#[test]
fn test_validate_env_vars_invalid_json() {
    assert!(validate_env_vars("not json").is_err());
    assert!(validate_env_vars("{invalid}").is_err());
    assert!(validate_env_vars("[1,2,3]").is_err()); // Array instead of object
}

#[test]
fn test_validate_env_vars_dangerous() {
    assert!(validate_env_vars(r#"{"LD_PRELOAD":"evil.so"}"#).is_err());
    assert!(validate_env_vars(r#"{"LD_LIBRARY_PATH":"/bad/path"}"#).is_err());
    assert!(validate_env_vars(r#"{"DYLD_INSERT_LIBRARIES":"bad.dylib"}"#).is_err());
}

#[test]
fn test_validate_env_vars_invalid_names() {
    assert!(validate_env_vars(r#"{"":"value"}"#).is_err());
    assert!(validate_env_vars(r#"{"var-name":"value"}"#).is_err());
    assert!(validate_env_vars(r#"{"var.name":"value"}"#).is_err());
    assert!(validate_env_vars(r#"{"var name":"value"}"#).is_err());
}

#[test]
fn test_validate_env_vars_null_bytes() {
    let json = format!(r#"{{"VAR":"value{}with{}null"}}"#, '\0', '\0');
    assert!(validate_env_vars(&json).is_err());
}

#[test]
fn test_validate_env_vars_too_many() {
    // Create a JSON with over 100 variables
    let mut vars = Vec::new();
    for i in 0..101 {
        vars.push(format!(r#""VAR_{}":"value""#, i));
    }
    let json = format!("{{{}}}", vars.join(","));

    assert!(validate_env_vars(&json).is_err());
}

#[test]
fn test_validate_command_valid() {
    assert!(validate_command("ls -la").is_ok());
    assert!(validate_command("echo 'hello world'").is_ok());
    assert!(validate_command("cargo build --release").is_ok());
    assert!(validate_command("python script.py").is_ok());
}

#[test]
fn test_validate_command_invalid() {
    assert!(validate_command("").is_err());
    assert!(validate_command("   ").is_err());
    assert!(validate_command("\t\n").is_err());
}

#[test]
fn test_validate_command_null_bytes() {
    let cmd = format!("command{}null", '\0');
    assert!(validate_command(&cmd).is_err());
}

#[test]
fn test_validate_command_dangerous_patterns() {
    // These should still pass validation (just logged as warnings)
    // We don't block them because they might be legitimate in some contexts
    assert!(validate_command("rm -rf /tmp/test").is_ok());
}

#[test]
fn test_validate_timeout_valid() {
    assert!(validate_timeout(None).is_ok());
    assert!(validate_timeout(Some(1)).is_ok());
    assert!(validate_timeout(Some(60)).is_ok());
    assert!(validate_timeout(Some(3600)).is_ok());
    assert!(validate_timeout(Some(86400)).is_ok()); // Max: 24 hours
}

#[test]
fn test_validate_timeout_invalid() {
    assert!(validate_timeout(Some(0)).is_err());
    assert!(validate_timeout(Some(86401)).is_err()); // Over 24 hours
    assert!(validate_timeout(Some(u32::MAX)).is_err());
}

#[test]
fn test_validate_timeout_boundary() {
    // Test exact boundary
    assert!(validate_timeout(Some(86400)).is_ok());
    assert!(validate_timeout(Some(86401)).is_err());
}

// ============================================================================
// Error Type Tests
// ============================================================================

#[test]
fn test_app_error_from_sqlx() {
    let sql_err = sqlx::Error::RowNotFound;
    let app_err: AppError = sql_err.into();

    match app_err {
        AppError::NotFoundError(_) => {}
        _ => panic!("Expected NotFoundError"),
    }
}

#[test]
fn test_app_error_from_io_not_found() {
    let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
    let app_err: AppError = io_err.into();

    match app_err {
        AppError::NotFoundError(_) => {}
        _ => panic!("Expected NotFoundError"),
    }
}

#[test]
fn test_app_error_from_io_permission() {
    let io_err = std::io::Error::new(std::io::ErrorKind::PermissionDenied, "access denied");
    let app_err: AppError = io_err.into();

    match app_err {
        AppError::PermissionError(_) => {}
        _ => panic!("Expected PermissionError"),
    }
}

#[test]
fn test_app_error_from_uuid() {
    let uuid_err = uuid::Uuid::parse_str("invalid").unwrap_err();
    let app_err: AppError = uuid_err.into();

    match app_err {
        AppError::ParseError(_) => {}
        _ => panic!("Expected ParseError"),
    }
}

#[test]
fn test_app_error_from_json() {
    let json_err = serde_json::from_str::<serde_json::Value>("invalid json").unwrap_err();
    let app_err: AppError = json_err.into();

    match app_err {
        AppError::ParseError(_) => {}
        _ => panic!("Expected ParseError"),
    }
}

#[test]
fn test_app_error_serialization() {
    let err = AppError::ValidationError("Invalid input".to_string());
    let json = serde_json::to_string(&err).unwrap();

    assert!(json.contains("ValidationError"));
    assert!(json.contains("Invalid input"));
}

#[test]
fn test_app_error_display() {
    let err = AppError::DatabaseError("Connection failed".to_string());
    let msg = format!("{}", err);

    assert!(msg.contains("Database error"));
    assert!(msg.contains("Connection failed"));
}

#[test]
fn test_app_error_all_variants() {
    let errors = vec![
        AppError::DatabaseError("db".to_string()),
        AppError::ExecutionError("exec".to_string()),
        AppError::SchedulerError("sched".to_string()),
        AppError::NotificationError("notif".to_string()),
        AppError::ValidationError("valid".to_string()),
        AppError::NotFoundError("404".to_string()),
        AppError::ParseError("parse".to_string()),
        AppError::IoError("io".to_string()),
        AppError::PermissionError("perm".to_string()),
        AppError::TimeoutError("timeout".to_string()),
        AppError::CancelledError("cancel".to_string()),
    ];

    for err in errors {
        // Test that all variants can be serialized
        let json = serde_json::to_string(&err).unwrap();
        assert!(!json.is_empty());

        // Test that all variants have a display implementation
        let msg = format!("{}", err);
        assert!(!msg.is_empty());
    }
}
