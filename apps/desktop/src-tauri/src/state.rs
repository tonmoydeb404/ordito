use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;

use rusqlite::Connection;

pub struct AppState {
    pub db: Mutex<Connection>,
    pub app_data_dir: PathBuf,
    pub running_pids: Mutex<HashMap<String, u32>>,
}

impl AppState {
    pub fn new(conn: Connection, app_data_dir: PathBuf) -> Self {
        AppState {
            db: Mutex::new(conn),
            app_data_dir,
            running_pids: Mutex::new(HashMap::new()),
        }
    }

    pub fn logs_dir(&self) -> PathBuf {
        self.app_data_dir.join("logs")
    }
}
