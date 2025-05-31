// src/tray.rs - Optimized and compact version
use crate::commands;
use crate::models::CommandGroup;
use crate::notification::NotificationManager;
use crate::state::AppState;
use std::collections::HashMap;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Runtime, State,
};

pub struct TrayManager;

impl TrayManager {
    /// Setup system tray with menu
    pub fn setup_system_tray(
        app: &tauri::App,
        groups: &HashMap<String, CommandGroup>,
    ) -> tauri::Result<()> {
        let menu = Self::build_menu(app, groups)?;

        let _tray = TrayIconBuilder::with_id("main-tray")
            .icon(app.default_window_icon().unwrap().clone())
            .menu(&menu)
            .show_menu_on_left_click(false)
            .tooltip("Command Runner - Right click for menu, left click to show window")
            .on_menu_event(Self::handle_menu_event)
            .on_tray_icon_event(Self::handle_icon_event)
            .build(app)?;

        log::info!("Tray icon created");
        Ok(())
    }

    /// Handle tray icon click events
    fn handle_icon_event(tray: &tauri::tray::TrayIcon<tauri::Wry>, event: TrayIconEvent) {
        if matches!(
            event,
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } | TrayIconEvent::DoubleClick {
                button: MouseButton::Left,
                ..
            }
        ) {
            Self::show_window(tray.app_handle());
        }
    }

    /// Handle menu click events
    fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
        match event.id().as_ref() {
            "show_window" => Self::show_window(app),
            "refresh_menu" => Self::refresh_menu(app),
            "quit" => app.exit(0),
            id if id.starts_with("execute_group_") => {
                if let Some(group_id) = id.strip_prefix("execute_group_") {
                    Self::execute_group(app, group_id);
                }
            }
            id if id.starts_with("execute_command_") => {
                if let Some(parts) = Self::parse_command_id(id) {
                    Self::execute_command(app, parts.0, parts.1);
                }
            }
            _ => {}
        }
    }

    /// Parse command ID format: "execute_command_{group_id}_{command_id}"
    fn parse_command_id(id: &str) -> Option<(String, String)> {
        let parts: Vec<&str> = id.strip_prefix("execute_command_")?.split('_').collect();
        if parts.len() >= 2 {
            Some((parts[0].to_string(), parts[1].to_string()))
        } else {
            None
        }
    }

    /// Show main window
    fn show_window(app: &AppHandle) {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
            let _ = window.unminimize();
        } else {
            NotificationManager::show_error(app, "Error", "Main window not found");
        }
    }

    /// Refresh tray menu
    fn refresh_menu(app: &AppHandle) {
        if let Err(e) = Self::refresh_tray_menu(app.clone()) {
            NotificationManager::show_error(app, "Menu Refresh Failed", &e);
        }
    }

    /// Execute group from tray
    fn execute_group(app: &AppHandle, group_id: &str) {
        let app_handle = app.clone();
        let group_id = group_id.to_string();

        tauri::async_runtime::spawn(async move {
            let state: State<AppState> = app_handle.state();
            let group_name = Self::get_group_name(&state, &group_id);

            match commands::execute::execute_group_commands(state, group_id).await {
                Ok(results) => Self::handle_group_results(&app_handle, &group_name, results),
                Err(e) => NotificationManager::show_error(
                    &app_handle,
                    "Group Execution Failed",
                    &format!("Failed to execute group: {}", e),
                ),
            }
        });
    }

    /// Execute single command from tray
    fn execute_command(app: &AppHandle, group_id: String, command_id: String) {
        let app_handle = app.clone();

        tauri::async_runtime::spawn(async move {
            let state: State<AppState> = app_handle.state();
            let command = Self::find_command(&state, &group_id, &command_id);

            match command {
                Some(cmd) => Self::run_command(&app_handle, cmd).await,
                None => NotificationManager::show_error(&app_handle, "Error", "Command not found"),
            }
        });
    }

    /// Get group name by ID
    fn get_group_name(state: &State<AppState>, group_id: &str) -> String {
        state
            .lock()
            .unwrap()
            .get(group_id)
            .map(|g| g.title.clone())
            .unwrap_or_else(|| group_id.to_string())
    }

    /// Find command in group
    fn find_command(
        state: &State<AppState>,
        group_id: &str,
        command_id: &str,
    ) -> Option<crate::models::CommandItem> {
        state
            .lock()
            .unwrap()
            .get(group_id)?
            .commands
            .iter()
            .find(|cmd| cmd.id == command_id)
            .cloned()
    }

    /// Run a single command
    async fn run_command(app: &AppHandle, cmd: crate::models::CommandItem) {
        let result = if cmd.is_detached.unwrap_or(false) {
            commands::execute::execute_command_detached(cmd.cmd.clone()).await
        } else {
            commands::execute::execute_command(cmd.cmd.clone()).await
        };

        match result {
            Ok(_) => NotificationManager::show_success(
                app,
                "Command Completed",
                &format!("'{}' completed", cmd.label),
            ),
            Err(e) => NotificationManager::show_error(
                app,
                "Command Failed",
                &format!("'{}' failed: {}", cmd.label, e),
            ),
        }
    }

    /// Handle group execution results
    fn handle_group_results(app: &AppHandle, _group_name: &str, results: Vec<(String, String)>) {
        let (success_count, error_count) = results.iter().fold((0, 0), |(s, e), (_, output)| {
            if output.starts_with("Error:") {
                (s, e + 1)
            } else {
                (s + 1, e)
            }
        });

        match (success_count, error_count) {
            (s, 0) => NotificationManager::show_success(
                app,
                "Group Completed",
                &format!("All {} commands succeeded", s),
            ),
            (0, e) => NotificationManager::show_error(
                app,
                "Group Failed",
                &format!("All {} commands failed", e),
            ),
            (s, e) => NotificationManager::show_warning(
                app,
                "Group Partially Completed",
                &format!("{} succeeded, {} failed", s, e),
            ),
        }
    }

    /// Build tray menu (unified for both App and AppHandle)
    fn build_menu<R: Runtime>(
        manager: &impl Manager<R>,
        groups: &HashMap<String, CommandGroup>,
    ) -> tauri::Result<Menu<R>> {
        let menu = Menu::new(manager)?;

        // Add groups
        for group in groups.values() {
            menu.append(&Self::create_group_submenu(manager, group)?)?;
        }

        if !groups.is_empty() {
            menu.append(&PredefinedMenuItem::separator(manager)?)?;
        } else {
            menu.append(&MenuItem::with_id(
                manager,
                "no_groups",
                "No command groups available",
                false,
                None::<&str>,
            )?)?;
            menu.append(&PredefinedMenuItem::separator(manager)?)?;
        }

        // Add controls
        menu.append(&MenuItem::with_id(
            manager,
            "show_window",
            "Show Window",
            true,
            None::<&str>,
        )?)?;
        menu.append(&MenuItem::with_id(
            manager,
            "refresh_menu",
            "Refresh Menu",
            true,
            None::<&str>,
        )?)?;
        menu.append(&PredefinedMenuItem::separator(manager)?)?;
        menu.append(&MenuItem::with_id(
            manager,
            "quit",
            "Quit",
            true,
            None::<&str>,
        )?)?;

        Ok(menu)
    }

    /// Create submenu for a group
    fn create_group_submenu<R: Runtime>(
        manager: &impl Manager<R>,
        group: &CommandGroup,
    ) -> tauri::Result<Submenu<R>> {
        let submenu =
            Submenu::with_id(manager, &format!("group_{}", group.id), &group.title, true)?;

        if group.commands.is_empty() {
            submenu.append(&MenuItem::with_id(
                manager,
                &format!("no_commands_{}", group.id),
                "No commands",
                false,
                None::<&str>,
            )?)?;
            return Ok(submenu);
        }

        // Execute all option
        submenu.append(&MenuItem::with_id(
            manager,
            &format!("execute_group_{}", group.id),
            &format!("Execute All ({})", group.commands.len()),
            true,
            None::<&str>,
        )?)?;
        submenu.append(&PredefinedMenuItem::separator(manager)?)?;

        // Individual commands
        for cmd in &group.commands {
            let icon = if cmd.is_detached.unwrap_or(false) {
                "🚀"
            } else {
                "⚡"
            };
            submenu.append(&MenuItem::with_id(
                manager,
                &format!("execute_command_{}_{}", group.id, cmd.id),
                &format!("{} {}", icon, cmd.label),
                true,
                None::<&str>,
            )?)?;
        }

        Ok(submenu)
    }

    /// Public method to refresh tray menu
    pub fn refresh_tray_menu(app_handle: AppHandle) -> Result<(), String> {
        let state: State<AppState> = app_handle.state();
        let groups = state.lock().unwrap().clone();
        let new_menu = Self::build_menu(&app_handle, &groups).map_err(|e| e.to_string())?;

        app_handle
            .tray_by_id("main-tray")
            .ok_or("Tray not found")?
            .set_menu(Some(new_menu))
            .map_err(|e| e.to_string())?;

        log::info!("Tray menu refreshed with {} groups", groups.len());
        Ok(())
    }
}
