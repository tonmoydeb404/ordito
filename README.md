# Ordito

A powerful desktop application built with Tauri that allows you to organize, manage, and execute commands from a convenient system tray interface. Perfect for developers, system administrators, and power users who frequently run terminal commands.

## ✨ Features

### 🎯 Core Functionality

- **Command Groups**: Organize commands into logical groups for better management
- **Quick Execution**: Execute commands with a single click from the system tray
- **Detached Mode**: Run commands in the background without blocking the UI
- **Batch Execution**: Execute all commands in a group with one action

### 🖥️ System Integration

- **System Tray**: Lightweight tray application that runs in the background
- **Auto-start**: Automatically launch on system startup (hidden in tray)
- **Cross-platform**: Available for Windows, macOS, and Linux
- **Notifications**: Real-time feedback for command execution results

### 📊 Data Management

- **Export/Import**: Backup and share your command configurations
- **Persistent Storage**: All data is automatically saved locally
- **JSON Format**: Human-readable configuration format

### 🎨 User Experience

- **Modern UI**: Clean, intuitive interface built with React
- **Dark/Light Support**: Adapts to your system preferences
- **Responsive Design**: Works well on different screen sizes
- **Error Handling**: Comprehensive error reporting and recovery

## 🚀 Quick Start

### Installation

1. **Download** the latest release for your platform:

   - Windows: `.msi` installer
   - macOS: `.dmg` disk image
   - Linux: `.deb` or `.rpm` package

2. **Install** the application using your platform's standard installation process

3. **Launch** the application - it will appear in your system tray

### First Steps

1. **Right-click** the tray icon to open the context menu
2. **Click "Show Window"** to open the main interface
3. **Create your first group** by clicking the "+" button
4. **Add commands** to your group with labels and command strings
5. **Test execution** by clicking the play button next to a command

## 📖 Usage Guide

### Creating Command Groups

Groups help organize related commands together:

```
Example Groups:
├── Development
│   ├── Start Server (npm run dev)
│   ├── Run Tests (npm test)
│   └── Build Project (npm run build)
├── System Maintenance
│   ├── Update System (sudo apt update && sudo apt upgrade)
│   ├── Clear Cache (sudo apt autoclean)
│   └── Check Disk Space (df -h)
└── Docker
    ├── List Containers (docker ps)
    ├── Clean Images (docker system prune)
    └── Start Services (docker-compose up -d)
```

### Command Types

- **Regular Commands**: Execute and wait for completion, showing output
- **Detached Commands**: Run in background, perfect for starting servers or long-running processes

### System Tray Operations

- **Left Click**: Show/hide main window
- **Right Click**: Access command menu
- **Command Execution**: Direct execution from tray menu
- **Group Execution**: Run all commands in a group

### Keyboard Shortcuts

- `Ctrl/Cmd + N`: New group
- `Ctrl/Cmd + S`: Save (auto-save is enabled)
- `Escape`: Hide window to tray

## ⚙️ Configuration

### Auto-start Setup

1. Open the main application window
2. Click the settings gear icon (⚙️) in the top right
3. Select "Enable Startup"
4. The app will now start automatically with your system (in tray mode)

### Data Location

Configuration files are stored in:

- **Windows**: `%APPDATA%\Ordito\`
- **macOS**: `~/Library/Application Support/Ordito/`
- **Linux**: `~/.local/share/Ordito/`

### Export/Import Data

- **Export**: Save your configuration to a JSON file for backup or sharing
- **Import**: Load configuration from a JSON file
- **Format**: Human-readable JSON structure for easy editing

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
npm install

# Start development server
npm run tauri dev
```

### Build

```bash
# Build for production
npm run tauri build
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
