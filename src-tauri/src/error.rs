use std::sync::{Mutex, MutexGuard};

pub fn lock_state<T>(mutex: &Mutex<T>) -> Result<MutexGuard<'_, T>, String> {
    mutex
        .lock()
        .map_err(|e| format!("State lock poisoned: {}", e))
}
