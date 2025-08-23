use crate::error::{OrditoError, Result};
use directories::ProjectDirs;
use std::path::PathBuf;
use std::str::FromStr;

pub fn get_app_data_dir() -> Result<PathBuf> {
    let project_dirs = ProjectDirs::from("com", "ordito", "ordito")
        .ok_or_else(|| OrditoError::Config("Unable to determine app data directory".to_string()))?;

    let data_dir = project_dirs.data_dir();

    if !data_dir.exists() {
        std::fs::create_dir_all(data_dir)?;
    }

    Ok(data_dir.to_path_buf())
}

pub fn get_config_file_path() -> Result<PathBuf> {
    let mut path = get_app_data_dir()?;
    path.push("config.json");
    Ok(path)
}

pub fn get_logs_dir() -> Result<PathBuf> {
    let mut path = get_app_data_dir()?;
    path.push("logs");

    if !path.exists() {
        std::fs::create_dir_all(&path)?;
    }

    Ok(path)
}

pub fn validate_cron_expression(expression: &str) -> Result<()> {
    cron::Schedule::from_str(expression)
        .map_err(|e| OrditoError::CronExpression(format!("Invalid cron expression: {}", e)))?;
    Ok(())
}

pub fn sanitize_filename(filename: &str) -> String {
    filename
        .chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            c => c,
        })
        .collect()
}

pub fn format_duration(seconds: u64) -> String {
    if seconds < 60 {
        format!("{}s", seconds)
    } else if seconds < 3600 {
        format!("{}m {}s", seconds / 60, seconds % 60)
    } else {
        format!(
            "{}h {}m {}s",
            seconds / 3600,
            (seconds % 3600) / 60,
            seconds % 60
        )
    }
}
