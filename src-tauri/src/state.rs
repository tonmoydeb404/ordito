use crate::models::{CommandGroup, Schedule};
use std::collections::HashMap;
use std::sync::Mutex;

pub type AppState = Mutex<HashMap<String, CommandGroup>>;
pub type ScheduleState = Mutex<HashMap<String, Schedule>>;
