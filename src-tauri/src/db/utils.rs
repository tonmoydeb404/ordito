use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
pub use sqlx::Row;
use uuid::Uuid;

/// Parse UUID from TEXT column
pub fn parse_uuid(text: &str, field_name: &str) -> Result<Uuid> {
    Uuid::parse_str(text)
        .with_context(|| format!("Failed to parse UUID from field '{}'", field_name))
}

/// Parse optional UUID from nullable TEXT column
pub fn parse_optional_uuid(text: Option<String>, field_name: &str) -> Result<Option<Uuid>> {
    match text {
        Some(s) => Ok(Some(Uuid::parse_str(&s).with_context(|| {
            format!("Failed to parse UUID from field '{}'", field_name)
        })?)),
        None => Ok(None),
    }
}

/// Parse DateTime from TEXT column
pub fn parse_datetime(text: &str, field_name: &str) -> Result<DateTime<Utc>> {
    text.parse::<DateTime<Utc>>()
        .with_context(|| format!("Failed to parse DateTime from field '{}'", field_name))
}

/// Parse optional DateTime from nullable TEXT column
pub fn parse_optional_datetime(
    text: Option<String>,
    field_name: &str,
) -> Result<Option<DateTime<Utc>>> {
    match text {
        Some(s) => Ok(Some(s.parse::<DateTime<Utc>>().with_context(|| {
            format!("Failed to parse DateTime from field '{}'", field_name)
        })?)),
        None => Ok(None),
    }
}

/// Helper to get string from row
pub fn get_string(row: &sqlx::sqlite::SqliteRow, field: &str) -> String {
    row.get::<String, _>(field)
}

/// Helper to get optional string from row
pub fn get_optional_string(row: &sqlx::sqlite::SqliteRow, field: &str) -> Option<String> {
    row.get::<Option<String>, _>(field)
}
