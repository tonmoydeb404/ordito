# Ordito Implementation Todo List

## Phase 1: Dependencies & Setup

- [x] **Task 1.1**: Update Cargo.toml with required dependencies
  - Add `cron = "0.12"` for cron expression parsing
  - Add `notify-rust = "4.11"` for desktop notifications (future)
  - Add `tracing` and `tracing-subscriber` for structured logging
  - Run `cargo check` to verify dependencies resolve correctly

## Phase 2: Core Services Implementation

- [x] **Task 2.1**: Create AppState structure (`src/app/state.rs`)

  - Define `AppState` struct to hold:
    - Database pool (SqlitePool)
    - LogStorage instance
    - Shared state for running executions (Arc<Mutex<HashMap>>)
  - Implement initialization method
  - Add to mod.rs exports

- [x] **Task 2.2**: Implement ExecutionService (`src/app/execution.rs`)

  - Create `ExecutionService` struct with methods:
    - `execute_command()` - Main execution logic
    - `cancel_execution()` - Terminate running process
  - Use `tokio::process::Command` for process spawning
  - Implement real-time stdout/stderr capture
  - Apply working directory, environment variables, timeouts
  - Stream output to LogStorage using `append_log()`
  - Create CommandLog entry with "Running" status at start
  - Update CommandLog with final status (Success/Failed/Timeout/Cancelled)
  - Handle exit codes and execution duration
  - Return execution result with log ID

- [x] **Task 2.3**: Implement SchedulerService (`src/app/scheduler.rs`)

  - Create `SchedulerService` struct
  - Implement cron expression parsing using `cron` crate
  - Create background task that:
    - Fetches all schedules from database
    - Checks every minute which schedules are due
    - Executes due commands via ExecutionService
    - Links execution to schedule_id in CommandLog
  - Implement `start()` method to spawn background task
  - Handle scheduler errors gracefully (log and continue)
  - Trigger notifications after execution if enabled

- [ ] **Task 2.4**: Implement NotificationService (`src/app/notifications.rs`) - SKIPPED FOR NOW

  - Create `NotificationService` struct
  - Implement `send_notification()` method using `notify-rust`
  - Include execution details:
    - Command title
    - Status (Success/Failed/Timeout)
    - Exit code (if applicable)
  - Handle notification errors gracefully (don't crash app)
  - Support different notification types (success vs error)

- [x] **Task 2.5**: Update app/mod.rs
  - Export all service modules (state, execution, scheduler)
  - Re-export key types for easier imports

## Phase 3: Tauri Commands Integration

- [x] **Task 3.1**: Implement Tauri commands (`src/app/commands.rs`)

  - **Command Management Commands**:

    - `create_command(state, command_data) -> Result<String>` - Returns UUID
    - `get_command(state, id) -> Result<Option<Command>>`
    - `update_command(state, command_data) -> Result<()>`
    - `delete_command(state, id) -> Result<()>`
    - `list_commands(state, group_id?) -> Result<Vec<Command>>`
    - `search_commands(state, query) -> Result<Vec<Command>>`
    - `toggle_favourite(state, id) -> Result<()>`
    - `get_favourites(state) -> Result<Vec<Command>>`

  - **Group Management Commands**:

    - `create_group(state, group_data) -> Result<String>`
    - `get_group(state, id) -> Result<Option<CommandGroup>>`
    - `update_group(state, group_data) -> Result<()>`
    - `delete_group(state, id) -> Result<()>`
    - `list_groups(state) -> Result<Vec<CommandGroup>>`
    - `get_root_groups(state) -> Result<Vec<CommandGroup>>`
    - `get_children(state, parent_id) -> Result<Vec<CommandGroup>>`

  - **Schedule Management Commands**:

    - `create_schedule(state, schedule_data) -> Result<String>`
    - `get_schedule(state, id) -> Result<Option<CommandSchedule>>`
    - `update_schedule(state, schedule_data) -> Result<()>`
    - `delete_schedule(state, id) -> Result<()>`
    - `list_schedules(state, command_id?) -> Result<Vec<CommandSchedule>>`
    - `toggle_notification(state, id) -> Result<()>`

  - **Execution Commands**:

    - `execute_command(state, command_id) -> Result<String>` - Returns log_id
    - `cancel_execution(state, log_id) -> Result<()>`

  - **Log Commands**:
    - `get_log(state, id) -> Result<Option<CommandLog>>`
    - `list_logs(state, command_id?, status?) -> Result<Vec<CommandLog>>`
    - `get_running_logs(state) -> Result<Vec<CommandLog>>`
    - `cleanup_old_logs(state, days) -> Result<u64>` - Returns count deleted
    - `get_log_stats(state) -> Result<HashMap<String, i64>>` - Count by status

- [x] **Task 3.2**: Wire up services in lib.rs
  - Initialize AppState with:
    - Database pool (already initialized)
    - LogStorage instance
  - Manage state with Tauri's `.manage(app_state)`
  - Start SchedulerService background task in setup
  - Register all Tauri commands in `invoke_handler!` macro
  - Replace demo `greet` command
  - Initialize tracing/logging

## Phase 4: Error Handling & Refinements

- [ ] **Task 4.1**: Create custom error types (optional but recommended)

  - Define `AppError` enum in `src/app/error.rs`:
    - DatabaseError
    - ExecutionError
    - SchedulerError
    - NotificationError
    - ValidationError
  - Implement `From` traits for common error types
  - Implement serialization for Tauri error responses
  - Update services to use custom errors

- [ ] **Task 4.2**: Add validation and security checks

  - Validate cron expressions before saving schedules
  - Sanitize environment variables (check for dangerous values)
  - Verify working directories exist before execution
  - Add command string validation (prevent obvious injection patterns)
  - Add limits (max timeout, max env vars, etc.)

- [ ] **Task 4.3**: Add integration tests

  - Test command execution with various configurations
  - Test timeout handling
  - Test cancellation
  - Test log file creation and cleanup
  - Test cron expression parsing
  - Mock external dependencies where needed

- [ ] **Task 4.4**: Documentation and cleanup
  - Add inline documentation for all public APIs
  - Document error cases and edge cases
  - Update requirements.md with implementation status
  - Add usage examples in code comments
  - Clean up any debug prints or temporary code

## Notes

- Each task should be completed and tested before moving to the next
- Run `cargo build` after each task to catch compilation errors early
- Some tasks have dependencies (e.g., Task 3.1 depends on Task 2.2-2.4)
- Task 4.1 (custom errors) is optional but highly recommended for production quality
- Consider adding frontend integration testing after backend is complete
