pub mod command_service;
pub mod executor_service;
pub mod notification_service;
pub mod scheduler_service;

use crate::error::Result;
use crate::storage::{Storage, StorageHandle};
use std::sync::Arc;
use tokio::sync::RwLock;

pub use command_service::CommandService;
pub use executor_service::ExecutorService;
pub use notification_service::NotificationService;
pub use scheduler_service::SchedulerService;

#[derive(Debug)]
pub struct AppService {
    storage: StorageHandle,
    command_service: Arc<CommandService>,
    executor_service: Arc<ExecutorService>,
    scheduler_service: Arc<SchedulerService>,
    notification_service: Option<Arc<NotificationService>>,
}

impl AppService {
    pub fn new() -> Self {
        let storage = Arc::new(RwLock::new(
            Storage::new().expect("Failed to initialize storage")
        ));

        let executor_service = Arc::new(ExecutorService::new().expect("Failed to initialize executor service"));
        let command_service = Arc::new(CommandService::new(storage.clone(), executor_service.clone()));
        let scheduler_service = Arc::new(SchedulerService::new(
            storage.clone(),
            command_service.clone(),
        ));

        Self {
            storage,
            command_service,
            executor_service,
            scheduler_service,
            notification_service: None,
        }
    }

    pub fn storage(&self) -> &StorageHandle {
        &self.storage
    }

    pub fn commands(&self) -> &Arc<CommandService> {
        &self.command_service
    }

    pub fn executor(&self) -> &Arc<ExecutorService> {
        &self.executor_service
    }

    pub fn scheduler(&self) -> &Arc<SchedulerService> {
        &self.scheduler_service
    }

    pub fn notifications(&self) -> Option<&Arc<NotificationService>> {
        self.notification_service.as_ref()
    }

    pub fn set_notification_service(&mut self, notification_service: Arc<NotificationService>) {
        self.notification_service = Some(notification_service);
    }

    pub async fn initialize(&self) -> Result<()> {
        let storage = self.storage.read().await;
        storage.validate_config()?;
        drop(storage);

        self.scheduler_service.start().await?;
        
        Ok(())
    }

    pub async fn shutdown(&self) -> Result<()> {
        self.scheduler_service.stop().await?;
        self.executor_service.shutdown().await?;
        
        let storage = self.storage.read().await;
        storage.save().await?;
        
        Ok(())
    }
}