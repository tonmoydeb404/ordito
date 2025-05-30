use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommandItem {
    pub id: String,
    pub label: String,
    pub cmd: String,
    pub is_detached: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommandGroup {
    pub id: String,
    pub title: String,
    pub commands: Vec<CommandItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppData {
    pub groups: HashMap<String, CommandGroup>,
}
