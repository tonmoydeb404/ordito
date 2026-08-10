<div align="center">
  <img src="apps/web/public/logo.svg" alt="Ordito" width="120" height="120">

  # Ordito

  **Your commands, one tray-click away.**

  Available for macOS, Windows & Linux. Free and open source (MIT).

<!-- @brand:start badges -->

[![Release](https://img.shields.io/github/v/release/tonmoydeb404/ordito-new)](https://github.com/tonmoydeb404/ordito-new/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)](#download)

<!-- @brand:end badges -->
</div>

---

Ordito is a desktop app that organizes your shell commands into named groups and runs them with a single click — from the panel or directly from the system tray. No terminal window, no command recall, no friction. It schedules recurring (cron) and one-time runs, tracks every execution with full output history and exit codes, and lives in the tray until you need it.

<!-- @brand:start downloadLink -->

[Download the latest release &raquo;](https://github.com/tonmoydeb404/ordito-new/releases/latest)

<!-- @brand:end downloadLink -->

---

## Why Ordito

Power users run the same commands every day — builds, deploys, syncs, dev servers. They live in a terminal because that's where commands live, even when the command is already known and never changes. Ordito removes that round trip: save a command once, then run it from the menu bar without opening a terminal, recalling syntax, or context-switching.

> Success is a user who never opens a terminal for a command they've already saved.

## Features

- **One-click tray execution** — Run any saved command from the macOS menu bar or Windows tray. The panel doesn't even need to be open.
- **Groups & search** — Organize commands into groups. Auto-focus search with ⌘K finds anything fast.
- **Cron scheduling** — Set it and forget it. Nightly builds, weekly deploys, hourly syncs.
- **Every run, tracked** — Full history with exit code, duration, and captured output for every execution.
- **One-time runs** — Fire off a command once without saving it.
- **Quiet by design** — Lives in the tray, respects your attention and screen space.

## How it works

1. **Save a command** — Name it, paste the command, pick a group. Ordito remembers the syntax so you never type it again.
2. **Click from tray** — Ordito lives in your menu bar. Click the icon, pick a command. It runs instantly.
3. **You're done** — Output is captured, exit codes tracked, history logged. You're back to work in seconds.

## Use cases

### For developers

```bash
# Open a project
code ~/my-project

# Development servers
npm run dev
python manage.py runserver
cargo run

# Builds
npm run build
cargo build --release
docker build -t myapp .

# Git workflows
git status
git pull origin main
git push origin feature-branch
```

### For system administrators

```bash
# System updates
sudo apt update && sudo apt upgrade

# Service management
systemctl restart nginx
systemctl status postgresql
docker-compose restart

# Log monitoring
tail -f /var/log/syslog
journalctl -f
docker logs -f container_name

# Network diagnostics
ping google.com
ss -tulpn
```

### For daily productivity

```bash
# Open websites
chrome https://github.com
firefox https://gmail.com
start https://calendar.google.com

# File operations
code ~/Documents/notes.md
nautilus ~/Downloads

# Chained setup
docker-compose up -d && npm start
cd ~/project && git pull && npm install
```

### For power users

```bash
# File management
find . -name "*.log" -delete
rsync -av /source/ /backup/
zip -r backup.zip important_folder/

# Process management
ps aux | grep chrome
kill -9 $(pgrep firefox)
htop

# Custom scripts
./deploy.sh production
python scripts/cleanup.py
bash ~/scripts/backup-routine.sh
```

## Download

Pre-built binaries are published on GitHub Releases:

**<!-- @brand:downloadUrl -->https://github.com/tonmoydeb404/ordito-new/releases/latest<!-- /@brand:downloadUrl -->**

| Platform | Installer |
| --- | --- |
| macOS | `.dmg` |
| Windows | `.exe` / `.msi` |
| Linux | `.deb` / `.AppImage` / `.rpm` |

## Project structure

This is a pnpm + Turborepo monorepo. Each app and package has its own README with run commands and tech details.

```
apps/
  desktop/     Tauri 2 desktop app — see apps/desktop/README.md
  web/         Next.js marketing site — see apps/web/README.md
packages/
  ui/                  Shared React component library — see packages/ui/README.md
  eslint-config/       Shared ESLint flat config — see packages/eslint-config/README.md
  typescript-config/   Shared tsconfig bases — see packages/typescript-config/README.md
```

## Links

- Website: <!-- @brand:website -->https://ordito.tonmoydeb.com<!-- /@brand:website -->
- Repository: <!-- @brand:repository -->https://github.com/tonmoydeb404/ordito-new<!-- /@brand:repository -->
- Releases: <!-- @brand:downloadUrl -->https://github.com/tonmoydeb404/ordito-new/releases/latest<!-- /@brand:downloadUrl -->

## License

[MIT](./LICENSE) — <!-- @brand:copyright -->Copyright (c) 2026 Tonmoy Deb<!-- /@brand:copyright -->
