use crate::models::{CommandGroup, Schedule};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

pub type AppState = Mutex<HashMap<String, CommandGroup>>;
pub type ScheduleState = Arc<Mutex<HashMap<String, Schedule>>>;
