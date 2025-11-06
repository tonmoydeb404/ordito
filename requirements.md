# Ordito - Command Management System

## Overview
Ordito is a Tauri-based desktop application for managing, executing, and scheduling shell commands with comprehensive logging and organization features.

## Core Features

### 1. Command Management
- **Create, Read, Update, Delete (CRUD)** commands
- **Command Properties:**
  - Title (descriptive name)
  - Command value (actual shell command)
  - Working directory
  - Environment variables (stored as JSON)
  - Timeout settings
  - Background execution support
  - Favorite marking capability
- **Search & Filter:**
  - Search commands by title
  - Filter by favorites
  - Group by categories
- **Persistence:** SQLite database with foreign key constraints

### 2. Command Organization (Groups)
- **Hierarchical grouping** with parent-child relationships
- **Group Operations:**
  - Create/update/delete groups
  - Nest groups (parent_id support)
  - Get root groups and children
  - Cascade deletion (deleting a group removes all commands in it)
- **Use Cases:**
  - Organize commands by project
  - Categorize by environment (dev, staging, prod)
  - Group by functionality

### 3. Command Execution
- **Execute saved commands** with configured parameters
- **Execution Options:**
  - Custom working directory per command
  - Environment variable injection
  - Timeout management
  - Run in foreground or background
- **Real-time Monitoring:**
  - Track execution status (running, success, failed, timeout, cancelled)
  - Capture stdout/stderr output
  - Record exit codes
  - Track execution duration

### 4. Command Scheduling
- **Cron-based scheduling** for automated command execution
- **Schedule Properties:**
  - Cron expression for timing
  - Linked to specific commands
  - Optional notification on completion
  - Multiple schedules per command
- **Schedule Management:**
  - Create/update/delete schedules
  - Toggle notifications
  - View schedules by command
- **Database Tracking:**
  - Link scheduled executions to logs
  - Maintain history of scheduled runs

### 5. Execution Logging
- **Comprehensive logging system** with file-based output storage
- **Log Metadata (Database):**
  - Command reference
  - Schedule reference (if triggered by schedule)
  - Execution status
  - Exit code
  - Working directory
  - Environment variables used
  - Start and finish timestamps
  - Background execution flag
  - Timeout settings
- **Log Output (File System):**
  - Separate log files per execution (stored in `/tmp/ordito/logs/`)
  - UUID-based file naming
  - Append support for streaming output
  - Async read/write operations
- **Log Queries:**
  - Get logs by command ID
  - Filter by status
  - View running commands
  - Cleanup old logs (by days)
  - Count logs by status
- **Storage Optimization:**
  - Output stored in files, not database (avoids large BLOB storage)
  - Automatic directory creation
  - File cleanup utilities

## Technical Architecture

### Domain Layer (`src/domain/`)
- **Pure domain models:**
  - `Command` - Command entity with all properties
  - `CommandGroup` - Hierarchical group structure
  - `CommandSchedule` - Cron schedule configuration
  - `CommandLog` - Execution log with status enum
  - `CommandLogRow` - Internal DB row representation
- **Type Safety:** Uses UUID, DateTime<Utc>, enums for status

### Database Layer (`src/db/`)
- **SQLite with SQLx** for type-safe queries
- **Repository Pattern:**
  - `CommandRepository` - 15+ query methods
  - `CommandGroupRepository` - Hierarchical queries
  - `CommandScheduleRepository` - Schedule CRUD
  - `CommandLogRepository` - Logging with file integration
- **Database Features:**
  - Foreign key constraints with cascading deletes
  - Optimized indexes on frequently queried columns
  - Transaction support
  - Connection pooling (max 5 connections)
- **Schema Management:**
  - `init_db_pool()` - Connection setup
  - `create_tables()` - Schema initialization

### I/O Layer (`src/io/`)
- **LogStorage** - File system abstraction for log outputs
  - Async file operations with Tokio
  - Path management
  - Append and cleanup utilities
  - Error handling with anyhow

### Application Layer (`src/app/`)
- **Future implementation** - Tauri commands, business logic, scheduling engine

## Database Schema

### Tables
1. **command_groups** - Hierarchical command organization
2. **commands** - Command definitions with metadata
3. **command_schedules** - Cron-based scheduling
4. **command_logs** - Execution history metadata

### Indexes
- `idx_commands_group_id` - Fast group lookups
- `idx_command_groups_parent_id` - Hierarchical queries
- `idx_command_schedules_command_id` - Schedule lookups
- `idx_command_logs_command_id` - Log history by command
- `idx_command_logs_schedule_id` - Scheduled execution tracking
- `idx_command_logs_status` - Status filtering

## Dependencies
- **Tauri** - Desktop application framework
- **SQLx** - Type-safe SQL with compile-time verification
- **Tokio** - Async runtime
- **Chrono** - Date/time handling
- **UUID** - Unique identifiers
- **Anyhow** - Error handling
- **Dotenv** - Environment configuration

## Configuration
- **DATABASE_URL** - SQLite database path (from .env)
- **LOG_DIR** - `/tmp/ordito/logs/` for execution outputs

## Future Enhancements (Potential)
- Command execution engine implementation
- Cron scheduler background service
- UI for command management
- Export/import command collections
- Command templates
- Parameter substitution in commands
- Notification system for scheduled tasks
- Log retention policies
- Full-text search in logs
- Command execution history analytics
- Team/shared command collections
- Command versioning
