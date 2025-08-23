use crate::error::{OrditoError, Result};
use crate::models::AppConfig;
use crate::utils::get_config_file_path;
use std::fs;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, info, warn};

pub type StorageHandle = Arc<RwLock<Storage>>;

#[derive(Debug)]
pub struct Storage {
    config: AppConfig,
    file_path: std::path::PathBuf,
}

impl Storage {
    pub fn new() -> Result<Self> {
        let file_path = get_config_file_path()?;
        let config = if file_path.exists() {
            Self::load_from_file(&file_path)?
        } else {
            info!("Config file not found, creating default configuration");
            AppConfig::default()
        };

        Ok(Self { config, file_path })
    }

    pub fn get_config(&self) -> &AppConfig {
        &self.config
    }

    pub fn get_config_mut(&mut self) -> &mut AppConfig {
        self.config.update();
        &mut self.config
    }

    pub async fn save(&self) -> Result<()> {
        self.save_to_file(&self.file_path).await
    }

    pub async fn save_to_file(&self, path: &std::path::Path) -> Result<()> {
        let json = serde_json::to_string_pretty(&self.config)?;

        if let Some(parent) = path.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent)?;
            }
        }

        tokio::fs::write(path, json)
            .await
            .map_err(|e| OrditoError::Storage(format!("Failed to write config file: {}", e)))?;

        debug!("Configuration saved to {:?}", path);
        Ok(())
    }

    fn load_from_file(path: &std::path::Path) -> Result<AppConfig> {
        debug!("Loading configuration from {:?}", path);

        let contents = fs::read_to_string(path)
            .map_err(|e| OrditoError::Storage(format!("Failed to read config file: {}", e)))?;

        let config: AppConfig = serde_json::from_str(&contents).map_err(|e| {
            warn!("Failed to parse config file, creating backup and using default");
            if let Err(backup_err) = fs::copy(path, path.with_extension("json.backup")) {
                warn!("Failed to create backup: {}", backup_err);
            }
            OrditoError::Storage(format!("Failed to parse config file: {}", e))
        })?;

        info!("Configuration loaded successfully");
        Ok(config)
    }

    pub async fn import_config(&mut self, import_config: AppConfig) -> Result<()> {
        info!("Importing configuration");
        self.config = import_config;
        self.config.update();
        self.save().await?;
        Ok(())
    }

    pub fn export_config(&self) -> AppConfig {
        self.config.clone()
    }

    pub async fn create_backup(&self) -> Result<std::path::PathBuf> {
        let backup_path = self.file_path.with_extension(format!(
            "backup.{}.json",
            chrono::Utc::now().format("%Y%m%d_%H%M%S")
        ));

        self.save_to_file(&backup_path).await?;
        info!("Backup created at {:?}", backup_path);
        Ok(backup_path)
    }

    pub fn validate_config(&self) -> Result<()> {
        for command in &self.config.commands {
            if command.name.trim().is_empty() {
                return Err(OrditoError::Config(
                    "Command name cannot be empty".to_string(),
                ));
            }
            if command.command.trim().is_empty() {
                return Err(OrditoError::Config("Command cannot be empty".to_string()));
            }
        }

        for group in &self.config.groups {
            if group.name.trim().is_empty() {
                return Err(OrditoError::Config(
                    "Group name cannot be empty".to_string(),
                ));
            }
        }

        for schedule in &self.config.schedules {
            if schedule.name.trim().is_empty() {
                return Err(OrditoError::Config(
                    "Schedule name cannot be empty".to_string(),
                ));
            }
            crate::utils::validate_cron_expression(&schedule.cron_expression)?;
        }

        Ok(())
    }
}

impl Default for Storage {
    fn default() -> Self {
        Self::new().expect("Failed to initialize storage")
    }
}
