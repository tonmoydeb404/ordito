use crate::error::{OrditoError, Result};
use crate::models::AppSettings;
use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tracing::{debug, info, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfiguration {
    pub settings: AppSettings,
    pub window: WindowConfig,
    pub tray: TrayConfig,
    pub notifications: NotificationConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowConfig {
    pub width: u32,
    pub height: u32,
    pub min_width: u32,
    pub min_height: u32,
    pub resizable: bool,
    pub maximizable: bool,
    pub minimizable: bool,
    pub closable: bool,
    pub always_on_top: bool,
    pub skip_taskbar: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrayConfig {
    pub enabled: bool,
    pub show_menu_on_left_click: bool,
    pub double_click_action: TrayAction,
    pub close_to_tray: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationConfig {
    pub enabled: bool,
    pub show_execution_complete: bool,
    pub show_execution_failed: bool,
    pub show_schedule_executed: bool,
    pub sound_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrayAction {
    ShowWindow,
    HideWindow,
    ToggleWindow,
    DoNothing,
}

impl Default for AppConfiguration {
    fn default() -> Self {
        Self {
            settings: AppSettings::default(),
            window: WindowConfig::default(),
            tray: TrayConfig::default(),
            notifications: NotificationConfig::default(),
        }
    }
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            width: 1200,
            height: 800,
            min_width: 800,
            min_height: 600,
            resizable: true,
            maximizable: true,
            minimizable: true,
            closable: true,
            always_on_top: false,
            skip_taskbar: false,
        }
    }
}

impl Default for TrayConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            show_menu_on_left_click: false,
            double_click_action: TrayAction::ToggleWindow,
            close_to_tray: true,
        }
    }
}

impl Default for NotificationConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            show_execution_complete: true,
            show_execution_failed: true,
            show_schedule_executed: true,
            sound_enabled: false,
        }
    }
}

#[derive(Debug)]
pub struct ConfigManager {
    config: AppConfiguration,
    config_path: PathBuf,
}

impl ConfigManager {
    pub fn new() -> Result<Self> {
        let config_path = Self::get_config_path()?;
        let config = if config_path.exists() {
            Self::load_from_file(&config_path)?
        } else {
            info!("Configuration file not found, creating default");
            AppConfiguration::default()
        };

        Ok(Self {
            config,
            config_path,
        })
    }

    pub fn get_config(&self) -> &AppConfiguration {
        &self.config
    }

    pub fn get_config_mut(&mut self) -> &mut AppConfiguration {
        &mut self.config
    }

    pub fn save(&self) -> Result<()> {
        debug!("Saving configuration to {:?}", self.config_path);

        let json = serde_json::to_string_pretty(&self.config)?;

        if let Some(parent) = self.config_path.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent)?;
            }
        }

        fs::write(&self.config_path, json)?;
        info!("Configuration saved successfully");
        Ok(())
    }

    pub fn reset_to_defaults(&mut self) -> Result<()> {
        info!("Resetting configuration to defaults");
        self.config = AppConfiguration::default();
        self.save()?;
        Ok(())
    }

    pub fn update_settings(&mut self, settings: AppSettings) -> Result<()> {
        debug!("Updating app settings");
        self.config.settings = settings;
        self.save()?;
        Ok(())
    }

    pub fn update_window_config(&mut self, window: WindowConfig) -> Result<()> {
        debug!("Updating window configuration");
        self.config.window = window;
        self.save()?;
        Ok(())
    }

    pub fn update_tray_config(&mut self, tray: TrayConfig) -> Result<()> {
        debug!("Updating tray configuration");
        self.config.tray = tray;
        self.save()?;
        Ok(())
    }

    pub fn update_notification_config(&mut self, notifications: NotificationConfig) -> Result<()> {
        debug!("Updating notification configuration");
        self.config.notifications = notifications;
        self.save()?;
        Ok(())
    }

    pub fn export_config(&self) -> String {
        serde_json::to_string_pretty(&self.config).unwrap_or_default()
    }

    pub fn import_config(&mut self, config_json: &str) -> Result<()> {
        info!("Importing configuration from JSON");
        let imported_config: AppConfiguration = serde_json::from_str(config_json)
            .map_err(|e| OrditoError::Config(format!("Invalid configuration format: {}", e)))?;

        // Validate the imported configuration
        self.validate_config(&imported_config)?;

        self.config = imported_config;
        self.save()?;
        info!("Configuration imported successfully");
        Ok(())
    }

    fn validate_config(&self, config: &AppConfiguration) -> Result<()> {
        // Validate window dimensions
        if config.window.width < config.window.min_width {
            return Err(OrditoError::Config(
                "Window width cannot be less than minimum width".to_string(),
            ));
        }
        if config.window.height < config.window.min_height {
            return Err(OrditoError::Config(
                "Window height cannot be less than minimum height".to_string(),
            ));
        }

        // Validate minimum dimensions
        if config.window.min_width < 400 {
            return Err(OrditoError::Config(
                "Minimum window width cannot be less than 400".to_string(),
            ));
        }
        if config.window.min_height < 300 {
            return Err(OrditoError::Config(
                "Minimum window height cannot be less than 300".to_string(),
            ));
        }

        Ok(())
    }

    fn get_config_path() -> Result<PathBuf> {
        let project_dirs = ProjectDirs::from("com", "ordito", "ordito").ok_or_else(|| {
            OrditoError::Config("Unable to determine config directory".to_string())
        })?;

        let config_dir = project_dirs.config_dir();

        if !config_dir.exists() {
            fs::create_dir_all(config_dir)?;
        }

        Ok(config_dir.join("app_config.json"))
    }

    fn load_from_file(path: &PathBuf) -> Result<AppConfiguration> {
        debug!("Loading configuration from {:?}", path);

        let contents = fs::read_to_string(path)
            .map_err(|e| OrditoError::Config(format!("Failed to read config file: {}", e)))?;

        let config: AppConfiguration = serde_json::from_str(&contents).map_err(|e| {
            warn!("Failed to parse config file, using defaults: {}", e);
            // Create a backup of the invalid config
            if let Err(backup_err) = fs::copy(path, path.with_extension("json.backup")) {
                warn!("Failed to create backup of invalid config: {}", backup_err);
            }
            OrditoError::Config(format!("Failed to parse config file: {}", e))
        })?;

        info!("Configuration loaded successfully");
        Ok(config)
    }

    pub fn create_backup(&self) -> Result<PathBuf> {
        let backup_path = self.config_path.with_extension(format!(
            "backup.{}.json",
            chrono::Utc::now().format("%Y%m%d_%H%M%S")
        ));

        fs::copy(&self.config_path, &backup_path)?;
        info!("Configuration backup created at {:?}", backup_path);
        Ok(backup_path)
    }
}

impl Default for ConfigManager {
    fn default() -> Self {
        Self::new().expect("Failed to initialize configuration manager")
    }
}
