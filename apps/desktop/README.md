# Ordito Desktop

<!-- @brand:descriptionLong -->Ordito organizes your shell commands into named groups and runs them with a single click — from the panel or directly from the system tray. No terminal, no command recall, no friction. It schedules recurring (cron) and one-time runs, tracks every execution with full output history and exit codes, and lives in the tray until you need it.<!-- /@brand:descriptionLong -->

Part of the [Ordito monorepo](../../README.md). This package (`@apps/desktop`) holds both the React frontend (`src/`) and the Rust backend (`src-tauri/`).

---

## Features

- **One-click tray execution** — Run any saved command from the macOS menu bar or Windows/Linux tray. The panel doesn't even need to be open.
- **Groups & search** — Organize commands into groups. Auto-focus search with ⌘K finds anything fast.
- **Cron scheduling** — Recurring runs (nightly builds, weekly deploys, hourly syncs) with next-run timing.
- **Every run, tracked** — Full history with exit code, duration, and captured output for every execution.
- **One-time runs** — Fire off a command once without saving it.
- **Auto-start & updates** — Launch on system startup; self-updates via signed releases.

## Quick start

1. **Launch Ordito** — look for the icon in your system tray / menu bar.
2. **Open the panel** from the tray, or use the tray's right-click menu directly.
3. **Create a group** (e.g. "Development"), then **add a command** — name it, paste the command, pick a group.
4. **Run from tray** — click the tray icon, pick the command. It runs instantly; output and exit code are captured in History.

## Tech stack

- **Shell:** [Tauri 2](https://tauri.app/) — Rust backend, in-process IPC (no HTTP).
- **Frontend:** React 19 + TypeScript + Tailwind v4 (Vite).
- **Storage:** SQLite via `rusqlite` (bundled) + `rusqlite_migration`.
- **Runtime:** `tokio` (async process execution, scheduling).
- **Scheduling:** `cron` crate (cron-based scheduler).
- **UI:** shadcn/ui primitives, [`@packages/ui`](../../packages/ui) shared components, Lucide + Iconify icons.
- **Plugins:** Tauri `updater`, `dialog`, `process`, `opener`, `autostart`.

## Architecture

Tauri 2 desktop app. The frontend and backend run in one process and communicate via Tauri's IPC.

```
Frontend (React)
  invoke("command_name", args)  →  Rust Tauri command  →  SQLite
Backend (Rust)
  emits events ("command://status-changed", "run://completed")
  →  frontend listen() in src/context/ordito-context.tsx
```

Frontend types in `src/types.ts` mirror Rust serde output (snake_case for backend types). View types (`CommandItem`, `RunItem`, `ScheduleItem`) are camelCase, mapped in the context. See [`../../AGENTS.md`](../../AGENTS.md) for the full architecture map.

### Key directories

```
src/                          React frontend
  lib/api.ts                  invoke() wrappers + event listeners
  lib/format.ts               timestamp/duration formatting
  context/ordito-context.tsx  global state (data loading, CRUD, events)
  types.ts                    types mirroring Rust serde output
src-tauri/src/                Rust backend
  commands.rs                 all IPC command definitions
  db.rs                       SQLite data access layer
  executor.rs                 process execution engine
  scheduler.rs                cron-based scheduler
  tray.rs                     system tray menu
  models.rs / state.rs / seed.rs / brand.rs
```

## Prerequisites

- **Node.js** 18+ and [pnpm](https://pnpm.io/)
- **Rust** stable toolchain (https://www.rust-lang.org/)
- Platform build tools:
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Windows:** Visual Studio Build Tools (MSVC)
  - **Linux:** `gcc`, `pkg-config`, and the usual Tauri system dependencies (see the [Tauri prerequisites](https://tauri.app/start/prerequisites/))

## Run commands

Run from the **repository root** (this is a pnpm workspace):

```sh
pnpm install              # install all workspace dependencies
pnpm dev:desktop          # Tauri dev (builds Rust + runs Vite at :1420)
pnpm tauri build          # production desktop build for the current OS
```

Or run from within `apps/desktop`:

```sh
pnpm dev                  # = tauri dev
pnpm dev:vite             # frontend only (Vite at :1420)
pnpm build                # tsc + vite build (frontend only)
pnpm check-types          # tsc --noEmit
pnpm lint                 # eslint --max-warnings 0
```

Backend (Rust) checks, from `src-tauri/`:

```sh
cargo check               # type check
cargo clippy              # lint
```

## Download

Pre-built binaries: **<!-- @brand:downloadUrl -->https://github.com/tonmoydeb404/ordito-new/releases/latest<!-- /@brand:downloadUrl -->**

## Links

- Website: <!-- @brand:website -->https://ordito.tonmoydeb.com<!-- /@brand:website -->
- Repository: <!-- @brand:repository -->https://github.com/tonmoydeb404/ordito-new<!-- /@brand:repository -->

## License

[MIT](../../LICENSE) — <!-- @brand:copyright -->Copyright (c) 2026 Tonmoy Deb<!-- /@brand:copyright -->
