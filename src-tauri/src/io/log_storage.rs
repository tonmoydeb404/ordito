use std::path::PathBuf;

use anyhow::{Context, Result};
use tokio::fs;
use uuid::Uuid;

const LOG_DIR: &str = "/tmp/ordito/logs";

pub struct LogStorage {
    base_path: PathBuf,
}

impl LogStorage {
    pub async fn new() -> Result<Self> {
        let base_path = PathBuf::from(LOG_DIR);

        // Create directory if it doesn't exist
        fs::create_dir_all(&base_path)
            .await
            .context("Failed to create log storage directory")?;

        Ok(Self { base_path })
    }

    pub fn get_log_path(&self, log_id: &Uuid) -> PathBuf {
        self.base_path.join(format!("{}.log", log_id))
    }

    pub async fn write_log(&self, log_id: &Uuid, output: &str) -> Result<()> {
        let path = self.get_log_path(log_id);
        fs::write(&path, output)
            .await
            .context(format!("Failed to write log file: {:?}", path))?;
        Ok(())
    }

    pub async fn append_log(&self, log_id: &Uuid, output: &str) -> Result<()> {
        let path = self.get_log_path(log_id);
        let mut existing = self.read_log(log_id).await.unwrap_or_default();
        existing.push_str(output);
        fs::write(&path, existing)
            .await
            .context(format!("Failed to append to log file: {:?}", path))?;
        Ok(())
    }

    pub async fn read_log(&self, log_id: &Uuid) -> Result<String> {
        let path = self.get_log_path(log_id);
        fs::read_to_string(&path)
            .await
            .context(format!("Failed to read log file: {:?}", path))
    }

    pub async fn delete_log(&self, log_id: &Uuid) -> Result<()> {
        let path = self.get_log_path(log_id);
        if path.exists() {
            fs::remove_file(&path)
                .await
                .context(format!("Failed to delete log file: {:?}", path))?;
        }
        Ok(())
    }

    pub async fn cleanup_all(&self) -> Result<u64> {
        let mut count = 0u64;
        let mut entries = fs::read_dir(&self.base_path).await?;

        while let Some(entry) = entries.next_entry().await? {
            if entry.path().extension().and_then(|s| s.to_str()) == Some("log") {
                fs::remove_file(entry.path()).await?;
                count += 1;
            }
        }

        Ok(count)
    }

    pub async fn log_exists(&self, log_id: &Uuid) -> bool {
        self.get_log_path(log_id).exists()
    }
}
