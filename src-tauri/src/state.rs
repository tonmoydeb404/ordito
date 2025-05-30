use crate::models::CommandGroup;
use std::collections::HashMap;
use std::sync::Mutex;

pub type AppState = Mutex<HashMap<String, CommandGroup>>;
