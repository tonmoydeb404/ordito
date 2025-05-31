<div align="center">
  <img src="public/logo.svg" alt="Ordito Logo" width="120" height="120">
  
  # Ordito

**Organize. Execute. Simplify.**

A powerful desktop application that brings command execution to your system tray. Organize your frequently used commands into groups and execute them with a single click - no more switching between terminal windows or remembering complex command syntax.

[![Release](https://img.shields.io/github/v/release/tonmoydeb404/ordito)](https://github.com/tonmoydeb404/ordito/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-blue)]()

</div>

---

## ✨ Features

### 🎯 **Command Management**

- **Create Command Groups** - Organize related commands together (Development, Docker, Git, etc.)
- **Quick Command Execution** - Execute any command with a single click from the tray menu
- **Detached Mode** - Run background processes without blocking the UI
- **Batch Execution** - Execute all commands in a group at once

### 🖥️ **System Tray Integration**

- **Always Available** - Lives quietly in your system tray, ready when you need it
- **Right-Click Menu** - Access all your commands directly from the tray
- **Hide to Tray** - Minimize to tray instead of closing completely
- **Auto-Start Support** - Launch automatically on system startup

### 📊 **Data & Settings**

- **Export/Import** - Backup and share your command configurations
- **Auto-Save** - All changes are saved automatically
- **Startup Control** - Toggle auto-start behavior from settings
- **Persistent Storage** - Your data stays safe between app restarts

### 🎨 **User Experience**

- **Modern Interface** - Clean, intuitive design built with React
- **Real-Time Feedback** - Instant notifications for command results
- **Error Handling** - Clear error messages and execution status
- **Cross-Platform** - Works on Windows and Linux

## 💡 Use Cases

### **🧑‍💻 For Developers**

```bash
# VS Code Projects
code ~/my-project
code C:\Projects\MyApp

# Development Servers
npm run dev
python manage.py runserver
cargo run

# Build Commands
npm run build
cargo build --release
docker build -t myapp .

# Quick Browser Access
chrome https://localhost:3000
firefox http://127.0.0.1:8000

# Git Workflows
git status
git pull origin main
git push origin feature-branch
```

### **⚙️ For System Administrators**

```bash
# System Updates
sudo apt update && sudo apt upgrade
sudo yum update
sudo pacman -Syu

# Service Management
systemctl restart nginx
systemctl status postgresql
docker-compose restart

# Log Monitoring
tail -f /var/log/syslog
journalctl -f
docker logs -f container_name

# Network Diagnostics
ping google.com
netstat -tulpn
ss -tulpn
```

### **🚀 For Daily Productivity**

```bash
# Open Websites
chrome https://github.com
firefox https://gmail.com
start https://calendar.google.com

# File Operations
code ~/Documents/notes.md
nautilus ~/Downloads
explorer C:\Users\username\Desktop

# Environment Setup
docker-compose up -d && npm start
source ~/.bashrc && conda activate myenv
cd ~/project && git pull && npm install
```

### **🔧 For Power Users**

```bash
# File Management
find . -name "*.log" -delete
rsync -av /source/ /backup/
zip -r backup.zip important_folder/

# Process Management
ps aux | grep chrome
kill -9 $(pgrep firefox)
htop

# Custom Scripts
./deploy.sh production
python scripts/cleanup.py
bash ~/scripts/backup-routine.sh
```

## 📥 Download

### Windows

**[📦 Download ordito.exe](https://github.com/tonmoydeb404/ordito/releases/latest/download/ordito.exe)**

- Portable executable - no installation required
- Simply download and run

### Linux

**[📦 Download .deb](https://github.com/tonmoydeb404/ordito/releases/latest)** (Ubuntu/Debian)

```bash
sudo dpkg -i ordito_1.0.0_amd64.deb
```

**[📦 Download .AppImage](https://github.com/tonmoydeb404/ordito/releases/latest)** (Universal Linux)

```bash
chmod +x ordito_1.0.0_amd64.AppImage
./ordito_1.0.0_amd64.AppImage
```

**[📦 Download .rpm](https://github.com/tonmoydeb404/ordito/releases/latest)** (Red Hat/Fedora)

```bash
sudo rpm -i ordito-1.0.0-1.x86_64.rpm
```

## 🚀 Quick Start

1. **Launch Ordito** - Look for the icon in your system tray
2. **Right-click the tray icon** to see the menu
3. **Click "Show Window"** to open the main interface
4. **Create a group** - Click the "+" button and name your group (e.g., "Development")
5. **Add commands** - Click "Add Command" and enter:
   - **Label**: `Start Dev Server`
   - **Command**: `npm run dev`
   - **Detached**: ✅ (for long-running processes)
6. **Execute from tray** - Right-click tray → Development → Start Dev Server

## 🔧 Development

### Prerequisites

- Node.js (v18 or later)
- Rust (latest stable)
- Platform-specific build tools:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Standard build tools (gcc, pkg-config, etc.)

### Setup

```bash
# Clone the repository
git clone https://github.com/tonmoydeb404/ordito.git
cd ordito

# Install dependencies
pnpm install

# Start development server
pnpm tauri dev
```

### Build

```bash
# Build for production
pnpm tauri build
```

### Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Rust, Tauri
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **Notifications**: Sonner (toast notifications)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have feature requests:

1. Check the [Issues](https://github.com/tonmoydeb404/ordito/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your system and the issue

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - For the amazing framework
- [React](https://reactjs.org/) - For the UI library
- [Rust](https://www.rust-lang.org/) - For the backend language
- [shadcn/ui](https://ui.shadcn.com/) - For the beautiful UI components

---

**Developer**: [tonmoydeb404](https://github.com/tonmoydeb404)

Made with ❤️ using Tauri and React

**Ordito** - _Organize. Execute. Simplify._
