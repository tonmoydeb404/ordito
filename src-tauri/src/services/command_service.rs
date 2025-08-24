use crate::error::{OrditoError, Result};
use crate::models::*;
use crate::services::ExecutorService;
use crate::storage::StorageHandle;
use std::sync::Arc;
use tracing::{debug, info};
use uuid::Uuid;

#[derive(Debug)]
pub struct CommandService {
    storage: StorageHandle,
    executor: Arc<ExecutorService>,
}

impl CommandService {
    pub fn new(storage: StorageHandle, executor: Arc<ExecutorService>) -> Self {
        Self { storage, executor }
    }

    pub async fn get_commands(&self) -> Result<Vec<Command>> {
        let storage = self.storage.read().await;
        Ok(storage.get_config().commands.clone())
    }

    pub async fn get_command_by_id(&self, id: Uuid) -> Result<Option<Command>> {
        let storage = self.storage.read().await;
        Ok(storage
            .get_config()
            .commands
            .iter()
            .find(|c| c.id == id)
            .cloned())
    }

    pub async fn create_command(&self, request: CreateCommandRequest) -> Result<Command> {
        info!("Creating command: {}", request.name);

        let mut command = Command::new(request.name, request.command);
        command.working_directory = request.working_directory;
        command.environment_variables = request.environment_variables;
        command.group_id = request.group_id;
        command.tags = request.tags;

        let mut storage = self.storage.write().await;
        let config = storage.get_config_mut();

        if config.commands.iter().any(|c| c.name == command.name) {
            return Err(OrditoError::Command(
                "Command with this name already exists".to_string(),
            ));
        }

        config.commands.push(command.clone());
        storage.save().await?;

        debug!("Command created with ID: {}", command.id);
        Ok(command)
    }

    pub async fn update_command(&self, request: UpdateCommandRequest) -> Result<Command> {
        info!("Updating command: {}", request.id);

        let mut storage = self.storage.write().await;

        // First check for name conflicts
        if let Some(name) = &request.name {
            let config = storage.get_config();
            let name_exists = config
                .commands
                .iter()
                .any(|c| c.id != request.id && c.name == *name);
            if name_exists {
                return Err(OrditoError::Command(
                    "Command with this name already exists".to_string(),
                ));
            }
        }

        let config = storage.get_config_mut();
        let command = config
            .commands
            .iter_mut()
            .find(|c| c.id == request.id)
            .ok_or_else(|| OrditoError::Command("Command not found".to_string()))?;

        if let Some(name) = request.name {
            command.name = name;
        }

        if let Some(cmd) = request.command {
            command.command = cmd;
        }

        if let Some(working_directory) = request.working_directory {
            command.working_directory = Some(working_directory);
        }

        if let Some(environment_variables) = request.environment_variables {
            command.environment_variables = environment_variables;
        }

        if let Some(group_id) = request.group_id {
            command.group_id = Some(group_id);
        }

        if let Some(is_favorite) = request.is_favorite {
            command.is_favorite = is_favorite;
        }

        if let Some(tags) = request.tags {
            command.tags = tags;
        }

        command.update();

        let updated_command = command.clone();
        storage.save().await?;

        debug!("Command updated: {}", updated_command.id);
        Ok(updated_command)
    }

    pub async fn delete_command(&self, id: Uuid) -> Result<()> {
        info!("Deleting command: {}", id);

        let mut storage = self.storage.write().await;
        let config = storage.get_config_mut();

        let initial_len = config.commands.len();
        config.commands.retain(|c| c.id != id);

        if config.commands.len() == initial_len {
            return Err(OrditoError::Command("Command not found".to_string()));
        }

        config.schedules.retain(|s| s.command_id != Some(id));

        storage.save().await?;

        debug!("Command deleted: {}", id);
        Ok(())
    }

    pub async fn execute_command(&self, id: Uuid, detached: bool) -> Result<Uuid> {
        let command = self
            .get_command_by_id(id)
            .await?
            .ok_or_else(|| OrditoError::Command("Command not found".to_string()))?;

        info!("Executing command: {} ({})", command.name, command.id);

        let execution_id = self.executor.execute_command(&command, detached).await?;

        {
            let mut storage = self.storage.write().await;
            let config = storage.get_config_mut();
            if let Some(cmd) = config.commands.iter_mut().find(|c| c.id == id) {
                cmd.mark_executed();
            }
            storage.save().await?;
        }

        Ok(execution_id)
    }

    pub async fn get_commands_by_group(&self, group_id: Option<Uuid>) -> Result<Vec<Command>> {
        let storage = self.storage.read().await;
        Ok(storage
            .get_config()
            .commands
            .iter()
            .filter(|c| c.group_id == group_id)
            .cloned()
            .collect())
    }

    pub async fn search_commands(&self, query: &str) -> Result<Vec<Command>> {
        let storage = self.storage.read().await;
        let query_lower = query.to_lowercase();

        Ok(storage
            .get_config()
            .commands
            .iter()
            .filter(|c| {
                c.name.to_lowercase().contains(&query_lower)
                    || c.command.to_lowercase().contains(&query_lower)
                    || c.tags
                        .iter()
                        .any(|tag| tag.to_lowercase().contains(&query_lower))
            })
            .cloned()
            .collect())
    }

    pub async fn get_favorite_commands(&self) -> Result<Vec<Command>> {
        let storage = self.storage.read().await;
        Ok(storage
            .get_config()
            .commands
            .iter()
            .filter(|c| c.is_favorite)
            .cloned()
            .collect())
    }

    pub async fn get_command_groups(&self) -> Result<Vec<CommandGroup>> {
        let storage = self.storage.read().await;
        Ok(storage.get_config().groups.clone())
    }

    pub async fn get_command_groups_with_count(&self) -> Result<Vec<CommandGroupWithCount>> {
        let storage = self.storage.read().await;
        let config = storage.get_config();
        
        let groups_with_count = config.groups
            .iter()
            .map(|group| {
                let commands_count = config.commands
                    .iter()
                    .filter(|cmd| cmd.group_id == Some(group.id))
                    .count();
                group.clone().with_commands_count(commands_count)
            })
            .collect();
        
        Ok(groups_with_count)
    }

    pub async fn get_command_group_by_id(&self, id: Uuid) -> Result<Option<CommandGroup>> {
        let storage = self.storage.read().await;
        Ok(storage
            .get_config()
            .groups
            .iter()
            .find(|g| g.id == id)
            .cloned())
    }

    pub async fn create_command_group(&self, request: CreateGroupRequest) -> Result<CommandGroup> {
        info!("Creating command group: {}", request.name);

        let mut group = CommandGroup::new(request.name);
        group.color = request.color;
        group.icon = request.icon;

        let mut storage = self.storage.write().await;
        let config = storage.get_config_mut();

        if config.groups.iter().any(|g| g.name == group.name) {
            return Err(OrditoError::Command(
                "Group with this name already exists".to_string(),
            ));
        }

        config.groups.push(group.clone());
        storage.save().await?;

        debug!("Command group created with ID: {}", group.id);
        Ok(group)
    }

    pub async fn update_command_group(&self, request: UpdateGroupRequest) -> Result<CommandGroup> {
        info!("Updating command group: {}", request.id);

        let mut storage = self.storage.write().await;

        // First check for name conflicts
        if let Some(name) = &request.name {
            let config = storage.get_config();
            let name_exists = config
                .groups
                .iter()
                .any(|g| g.id != request.id && g.name == *name);
            if name_exists {
                return Err(OrditoError::Command(
                    "Group with this name already exists".to_string(),
                ));
            }
        }

        let config = storage.get_config_mut();
        let group = config
            .groups
            .iter_mut()
            .find(|g| g.id == request.id)
            .ok_or_else(|| OrditoError::Command("Group not found".to_string()))?;

        if let Some(name) = request.name {
            group.name = name;
        }

        if let Some(color) = request.color {
            group.color = Some(color);
        }

        if let Some(icon) = request.icon {
            group.icon = Some(icon);
        }

        if let Some(is_favorite) = request.is_favorite {
            group.is_favorite = is_favorite;
        }

        group.update();

        let updated_group = group.clone();
        storage.save().await?;

        debug!("Command group updated: {}", updated_group.id);
        Ok(updated_group)
    }

    pub async fn delete_command_group(&self, id: Uuid) -> Result<()> {
        info!("Deleting command group: {}", id);

        let mut storage = self.storage.write().await;
        let config = storage.get_config_mut();

        let initial_len = config.groups.len();
        config.groups.retain(|g| g.id != id);

        if config.groups.len() == initial_len {
            return Err(OrditoError::Command("Group not found".to_string()));
        }

        for command in &mut config.commands {
            if command.group_id == Some(id) {
                command.group_id = None;
                command.update();
            }
        }

        config.schedules.retain(|s| s.group_id != Some(id));

        storage.save().await?;

        debug!("Command group deleted: {}", id);
        Ok(())
    }

    pub async fn execute_command_group(&self, id: Uuid, detached: bool) -> Result<Vec<Uuid>> {
        let commands = self.get_commands_by_group(Some(id)).await?;

        if commands.is_empty() {
            return Err(OrditoError::Command(
                "No commands found in group".to_string(),
            ));
        }

        info!("Executing command group: {} commands", commands.len());

        let execution_ids = self
            .executor
            .execute_command_group(&commands, detached)
            .await?;

        {
            let mut storage = self.storage.write().await;
            let config = storage.get_config_mut();
            for command in &commands {
                if let Some(cmd) = config.commands.iter_mut().find(|c| c.id == command.id) {
                    cmd.mark_executed();
                }
            }
            storage.save().await?;
        }

        Ok(execution_ids)
    }
}
