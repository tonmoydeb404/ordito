use crate::commands;
use crate::models::CommandGroup;
use crate::state::AppState;
use std::collections::HashMap;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, State,
};

pub struct TrayManager;

impl TrayManager {
    /// Setup system tray with menu based on current groups
    pub fn setup_system_tray(
        app: &tauri::App,
        groups: &HashMap<String, CommandGroup>,
    ) -> tauri::Result<()> {
        // Create tray menu
        let menu = Self::create_tray_menu(app, groups)?;

        let _tray = TrayIconBuilder::with_id("main-tray")
            .icon(app.default_window_icon().unwrap().clone())
            .menu(&menu)
            .show_menu_on_left_click(false)
            .tooltip("Command Runner - Right click for menu, left click to show window")
            .on_menu_event(|app, event| {
                Self::handle_tray_menu_event(app, event);
            })
            .on_tray_icon_event(|tray, event| match event {
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => {
                    log::debug!("Tray icon left-clicked - showing window");
                    let app = tray.app_handle();
                    Self::show_main_window(&app);
                }
                TrayIconEvent::DoubleClick {
                    button: MouseButton::Left,
                    ..
                } => {
                    log::debug!("Tray icon double-clicked - showing window");
                    let app = tray.app_handle();
                    Self::show_main_window(&app);
                }
                _ => {}
            })
            .build(app)?;

        log::info!("Tray icon created and should be visible in system tray");
        Ok(())
    }

    /// Create tray menu based on current groups
    fn create_tray_menu(
        app: &tauri::App,
        groups: &HashMap<String, CommandGroup>,
    ) -> tauri::Result<Menu<tauri::Wry>> {
        let menu = Menu::new(app)?;

        // Add groups as submenus
        if !groups.is_empty() {
            log::debug!("Adding {} groups to tray menu", groups.len());

            for group in groups.values() {
                let group_submenu = Self::create_group_submenu(app, group)?;
                menu.append(&group_submenu)?;
            }
            menu.append(&PredefinedMenuItem::separator(app)?)?;
        } else {
            let no_groups_item = MenuItem::with_id(
                app,
                "no_groups",
                "No command groups available",
                false,
                None::<&str>,
            )?;
            menu.append(&no_groups_item)?;
            menu.append(&PredefinedMenuItem::separator(app)?)?;
        }

        // Add application controls
        let show_item = MenuItem::with_id(app, "show_window", "Show Window", true, None::<&str>)?;
        menu.append(&show_item)?;

        let refresh_item =
            MenuItem::with_id(app, "refresh_menu", "Refresh Menu", true, None::<&str>)?;
        menu.append(&refresh_item)?;

        menu.append(&PredefinedMenuItem::separator(app)?)?;

        let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
        menu.append(&quit_item)?;

        Ok(menu)
    }

    /// Create submenu for a command group
    fn create_group_submenu(
        app: &tauri::App,
        group: &CommandGroup,
    ) -> tauri::Result<Submenu<tauri::Wry>> {
        let submenu = Submenu::with_id(app, &format!("group_{}", group.id), &group.title, true)?;

        if !group.commands.is_empty() {
            let execute_all_id = format!("execute_group_{}", group.id);
            let execute_all_item = MenuItem::with_id(
                app,
                &execute_all_id,
                &format!("Execute All ({})", group.commands.len()),
                true,
                None::<&str>,
            )?;
            submenu.append(&execute_all_item)?;

            submenu.append(&PredefinedMenuItem::separator(app)?)?;

            for command in &group.commands {
                let command_id = format!("execute_command_{}_{}", group.id, command.id);
                let icon = if command.is_detached.unwrap_or(false) {
                    "🚀"
                } else {
                    "⚡"
                };
                let label = format!("{} {}", icon, command.label);

                let command_item = MenuItem::with_id(app, &command_id, &label, true, None::<&str>)?;
                submenu.append(&command_item)?;
            }
        } else {
            let no_commands_item = MenuItem::with_id(
                app,
                &format!("no_commands_{}", group.id),
                "No commands in this group",
                false,
                None::<&str>,
            )?;
            submenu.append(&no_commands_item)?;
        }

        Ok(submenu)
    }

    /// Handle tray menu click events
    fn handle_tray_menu_event(app: &tauri::AppHandle, event: tauri::menu::MenuEvent) {
        let event_id = event.id().as_ref();
        log::debug!("Tray menu event: {}", event_id);

        match event_id {
            "show_window" => {
                log::debug!("Showing main window from tray menu");
                Self::show_main_window(app);
            }
            "refresh_menu" => {
                log::debug!("Refreshing tray menu");
                if let Err(e) = Self::refresh_tray_menu_internal(app.clone()) {
                    log::error!("Failed to refresh tray menu: {}", e);
                }
            }
            "quit" => {
                log::info!("Application quit requested from tray");
                app.exit(0);
            }
            id if id.starts_with("execute_group_") => {
                if let Some(group_id) = id.strip_prefix("execute_group_") {
                    log::info!("Executing group from tray: {}", group_id);
                    Self::execute_group_from_tray(app, group_id.to_string());
                }
            }
            id if id.starts_with("execute_command_") => {
                if let Some(command_part) = id.strip_prefix("execute_command_") {
                    let parts: Vec<&str> = command_part.split('_').collect();
                    if parts.len() >= 2 {
                        let group_id = parts[0].to_string();
                        let command_id = parts[1].to_string();
                        log::info!(
                            "Executing command from tray: {} in group: {}",
                            command_id,
                            group_id
                        );
                        Self::execute_command_from_tray(app, group_id, command_id);
                    }
                }
            }
            _ => {
                log::debug!("Unhandled tray menu event: {}", event_id);
            }
        }
    }

    /// Show the main application window
    fn show_main_window(app: &tauri::AppHandle) {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
            let _ = window.unminimize();
            log::debug!("Main window shown and focused");
        } else {
            log::error!("Main window not found");
        }
    }

    /// Execute all commands in a group from tray
    fn execute_group_from_tray(app: &tauri::AppHandle, group_id: String) {
        let app_handle = app.clone();
        tauri::async_runtime::spawn(async move {
            let state: State<AppState> = app_handle.state();

            match commands::execute::execute_group_commands(state, group_id.clone()).await {
                Ok(results) => {
                    log::info!("Group '{}' executed successfully", group_id);
                    for (label, output) in &results {
                        if output.starts_with("Error:") {
                            log::error!("Command '{}' failed: {}", label, output);
                        } else {
                            log::info!("Command '{}' completed: {}", label, output);
                        }
                    }
                }
                Err(e) => {
                    log::error!("Failed to execute group '{}': {}", group_id, e);
                }
            }
        });
    }

    /// Execute a single command from tray
    fn execute_command_from_tray(app: &tauri::AppHandle, group_id: String, command_id: String) {
        let app_handle = app.clone();
        tauri::async_runtime::spawn(async move {
            let state: State<AppState> = app_handle.state();

            let command = {
                let groups = state.lock().unwrap();
                if let Some(group) = groups.get(&group_id) {
                    group
                        .commands
                        .iter()
                        .find(|cmd| cmd.id == command_id)
                        .cloned()
                } else {
                    None
                }
            };

            if let Some(cmd_item) = command {
                let result = if cmd_item.is_detached.unwrap_or(false) {
                    commands::execute::execute_command_detached(cmd_item.cmd.clone()).await
                } else {
                    commands::execute::execute_command(cmd_item.cmd.clone()).await
                };

                match result {
                    Ok(output) => {
                        log::info!(
                            "Command '{}' executed successfully: {}",
                            cmd_item.label,
                            output
                        );
                    }
                    Err(e) => {
                        log::error!("Failed to execute command '{}': {}", cmd_item.label, e);
                    }
                }
            } else {
                log::error!("Command {} not found in group {}", command_id, group_id);
            }
        });
    }

    /// Refresh tray menu with current groups (internal)
    fn refresh_tray_menu_internal(app_handle: tauri::AppHandle) -> Result<(), String> {
        let state: State<AppState> = app_handle.state();
        let groups = state.lock().unwrap().clone();

        let new_menu = Self::create_tray_menu_for_handle(&app_handle, &groups)
            .map_err(|e| format!("Failed to create menu: {}", e))?;

        if let Some(tray) = app_handle.tray_by_id("main-tray") {
            tray.set_menu(Some(new_menu))
                .map_err(|e| format!("Failed to set menu: {}", e))?;
            log::info!("Tray menu refreshed with {} groups", groups.len());
        } else {
            return Err("Tray icon not found".to_string());
        }

        Ok(())
    }

    /// Public method to refresh tray menu
    pub fn refresh_tray_menu(app_handle: tauri::AppHandle) -> Result<(), String> {
        Self::refresh_tray_menu_internal(app_handle)
    }

    /// Helper functions for AppHandle (same logic, different type)
    fn create_tray_menu_for_handle(
        app_handle: &tauri::AppHandle,
        groups: &HashMap<String, CommandGroup>,
    ) -> tauri::Result<Menu<tauri::Wry>> {
        let menu = Menu::new(app_handle)?;

        if !groups.is_empty() {
            for group in groups.values() {
                let group_submenu = Self::create_group_submenu_for_handle(app_handle, group)?;
                menu.append(&group_submenu)?;
            }
            menu.append(&PredefinedMenuItem::separator(app_handle)?)?;
        } else {
            let no_groups_item = MenuItem::with_id(
                app_handle,
                "no_groups",
                "No command groups available",
                false,
                None::<&str>,
            )?;
            menu.append(&no_groups_item)?;
            menu.append(&PredefinedMenuItem::separator(app_handle)?)?;
        }

        let show_item =
            MenuItem::with_id(app_handle, "show_window", "Show Window", true, None::<&str>)?;
        menu.append(&show_item)?;

        let refresh_item = MenuItem::with_id(
            app_handle,
            "refresh_menu",
            "Refresh Menu",
            true,
            None::<&str>,
        )?;
        menu.append(&refresh_item)?;

        menu.append(&PredefinedMenuItem::separator(app_handle)?)?;

        let quit_item = MenuItem::with_id(app_handle, "quit", "Quit", true, None::<&str>)?;
        menu.append(&quit_item)?;

        Ok(menu)
    }

    fn create_group_submenu_for_handle(
        app_handle: &tauri::AppHandle,
        group: &CommandGroup,
    ) -> tauri::Result<Submenu<tauri::Wry>> {
        let submenu = Submenu::with_id(
            app_handle,
            &format!("group_{}", group.id),
            &group.title,
            true,
        )?;

        if !group.commands.is_empty() {
            let execute_all_id = format!("execute_group_{}", group.id);
            let execute_all_item = MenuItem::with_id(
                app_handle,
                &execute_all_id,
                &format!("Execute All ({})", group.commands.len()),
                true,
                None::<&str>,
            )?;
            submenu.append(&execute_all_item)?;

            submenu.append(&PredefinedMenuItem::separator(app_handle)?)?;

            for command in &group.commands {
                let command_id = format!("execute_command_{}_{}", group.id, command.id);
                let icon = if command.is_detached.unwrap_or(false) {
                    "🚀"
                } else {
                    "⚡"
                };
                let label = format!("{} {}", icon, command.label);

                let command_item =
                    MenuItem::with_id(app_handle, &command_id, &label, true, None::<&str>)?;
                submenu.append(&command_item)?;
            }
        } else {
            let no_commands_item = MenuItem::with_id(
                app_handle,
                &format!("no_commands_{}", group.id),
                "No commands in this group",
                false,
                None::<&str>,
            )?;
            submenu.append(&no_commands_item)?;
        }

        Ok(submenu)
    }
}
