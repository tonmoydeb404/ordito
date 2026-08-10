# AGENTS.md

## Build & Verify Commands

### Frontend (React + TypeScript + Vite)
- Type check: `npx tsc --noEmit`
- Full build: `pnpm build` (runs tsc + vite build)
- Dev server: `pnpm dev`

### Backend (Rust + Tauri)
- Type check: `cargo check` (in `src-tauri/`)
- Lint: `cargo clippy` (in `src-tauri/`)
- Full desktop build: `pnpm tauri build`

## Architecture

Tauri 2 desktop app. Backend is Rust (in-process IPC via `invoke()`, not HTTP).
Frontend is React 19 + TypeScript + Tailwind v4.

### Key directories
- `src/` — frontend (React)
- `src-tauri/src/` — backend (Rust)
- `src/lib/api.ts` — all `invoke()` wrappers + event listeners
- `src/lib/format.ts` — timestamp/duration formatting utilities
- `src/context/ordito-context.tsx` — global state provider (data loading, CRUD, event subscriptions)
- `src-tauri/src/commands.rs` — all IPC command definitions
- `src-tauri/src/db.rs` — SQLite data access layer
- `src-tauri/src/executor.rs` — process execution engine
- `src-tauri/src/scheduler.rs` — cron-based scheduler

### Data flow
Frontend calls `invoke("command_name", args)` → Rust Tauri command → SQLite.
Backend emits events (`command://status-changed`, `run://completed`) → frontend `listen()` in context.

### Types
Frontend types in `src/types.ts` mirror Rust serde output (snake_case for backend types).
View types (`CommandItem`, `RunItem`, `ScheduleItem`) are camelCase, mapped in the context.
