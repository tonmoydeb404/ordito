// src/tray.rs - Super optimized tray manager
use crate::{
    commands, models::CommandGroup, notification::NotificationManager, state::AppState,
    window::WindowManager,
};
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
            .on_tray_icon_event(|tray, event| {
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
                    let _ = WindowManager::show_window(tray.app_handle());
                }
            })
            .build(app)?;

        log::info!("Tray icon created");
        Ok(())
    }

    /// Handle menu click events
    fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
        let result = match event.id().as_ref() {
            "show_window" => WindowManager::show_window(app),
            "hide_to_tray" => WindowManager::hide_to_tray(app),
            "refresh_menu" => Self::refresh_tray_menu(app.clone()),
            "quit_app" => {
                Self::quit_application(app);
                return;
            }
            id if id.starts_with("execute_group_") => {
                Self::execute_group(app, &id[14..]); // Skip "execute_group_"
                return;
            }
            id if id.starts_with("execute_command_") => {
                Self::execute_command_by_id(app, &id[16..]); // Skip "execute_command_"
                return;
            }
            _ => return,
        };

        if let Err(e) = result {
            NotificationManager::show_error(app, "Error", &e);
        }
    }

    /// Execute command by parsing ID
    fn execute_command_by_id(app: &AppHandle, id_part: &str) {
        let parts: Vec<&str> = id_part.split('_').collect();
        if parts.len() >= 2 {
            Self::execute_command(app.clone(), parts[0].to_string(), parts[1].to_string());
        }
    }

    /// Quit application
    fn quit_application(app: &AppHandle) {
        log::info!("🚪 Quitting application");
        app.exit(0);
    }

    /// Execute group from tray (async spawn)
    fn execute_group(app: &AppHandle, group_id: &str) {
        let app_handle = app.clone();
        let group_id = group_id.to_string();

        tauri::async_runtime::spawn(async move {
            let state: State<AppState> = app_handle.state();
            match commands::execute::execute_group_commands(state, group_id).await {
                Ok(results) => Self::handle_execution_results(&app_handle, results),
                Err(e) => NotificationManager::show_error(&app_handle, "Group Failed", &e),
            }
        });
    }

    /// Execute single command (async spawn)
    fn execute_command(app_handle: AppHandle, group_id: String, command_id: String) {
        tauri::async_runtime::spawn(async move {
            let state: State<AppState> = app_handle.state();
            let command = {
                state
                    .lock()
                    .unwrap()
                    .get(&group_id)
                    .and_then(|g| g.commands.iter().find(|c| c.id == command_id).cloned())
            };

            match command {
                Some(cmd) => {
                    let result = if cmd.is_detached.unwrap_or(false) {
                        commands::execute::execute_command_detached(cmd.cmd).await
                    } else {
                        commands::execute::execute_command(cmd.cmd).await
                    };

                    match result {
                        Ok(_) => NotificationManager::show_success(
                            &app_handle,
                            "Success",
                            &format!("'{}' completed", cmd.label),
                        ),
                        Err(e) => NotificationManager::show_error(
                            &app_handle,
                            "Failed",
                            &format!("'{}': {}", cmd.label, e),
                        ),
                    }
                }
                None => NotificationManager::show_error(&app_handle, "Error", "Command not found"),
            }
        });
    }

    /// Handle execution results with fold
    fn handle_execution_results(app: &AppHandle, results: Vec<(String, String)>) {
        let (success, errors) = results.iter().fold((0, 0), |(s, e), (_, output)| {
            if output.starts_with("Error:") {
                (s, e + 1)
            } else {
                (s + 1, e)
            }
        });

        let (title, message) = match (success, errors) {
            (s, 0) => ("Group Completed", format!("All {} commands succeeded", s)),
            (0, e) => ("Group Failed", format!("All {} commands failed", e)),
            (s, e) => ("Partial Success", format!("{} succeeded, {} failed", s, e)),
        };

        if errors > 0 {
            NotificationManager::show_warning(app, title, &message);
        } else {
            NotificationManager::show_success(app, title, &message);
        }
    }

    /// Build unified menu with conditional window controls
    fn build_menu<R: Runtime>(
        manager: &impl Manager<R>,
        groups: &HashMap<String, CommandGroup>,
    ) -> tauri::Result<Menu<R>> {
        let menu = Menu::new(manager)?;

        // Add groups or no-groups message
        if groups.is_empty() {
            menu.append(&MenuItem::with_id(
                manager,
                "no_groups",
                "No command groups",
                false,
                None::<&str>,
            )?)?;
        } else {
            for group in groups.values() {
                menu.append(&Self::create_group_submenu(manager, group)?)?;
            }
        }

        menu.append(&PredefinedMenuItem::separator(manager)?)?;

        // Add window controls (both show and hide - user will only see relevant one)
        menu.append(&MenuItem::with_id(
            manager,
            "show_window",
            "Show Window",
            true,
            None::<&str>,
        )?)?;
        menu.append(&MenuItem::with_id(
            manager,
            "hide_to_tray",
            "Hide to Tray",
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
            "quit_app",
            "Quit",
            true,
            None::<&str>,
        )?)?;

        Ok(menu)
    }

    /// Build menu for AppHandle with conditional window controls
    fn build_menu_with_visibility(
        app_handle: &AppHandle,
        groups: &HashMap<String, CommandGroup>,
    ) -> tauri::Result<Menu<tauri::Wry>> {
        let menu = Menu::new(app_handle)?;

        // Add groups or no-groups message
        if groups.is_empty() {
            menu.append(&MenuItem::with_id(
                app_handle,
                "no_groups",
                "No command groups",
                false,
                None::<&str>,
            )?)?;
        } else {
            for group in groups.values() {
                menu.append(&Self::create_group_submenu(app_handle, group)?)?;
            }
        }

        menu.append(&PredefinedMenuItem::separator(app_handle)?)?;

        // Conditionally add window controls based on current visibility
        let is_visible = WindowManager::is_window_visible(app_handle).unwrap_or(true);
        if is_visible {
            menu.append(&MenuItem::with_id(
                app_handle,
                "hide_to_tray",
                "Hide to Tray",
                true,
                None::<&str>,
            )?)?;
        } else {
            menu.append(&MenuItem::with_id(
                app_handle,
                "show_window",
                "Show Window",
                true,
                None::<&str>,
            )?)?;
        }

        menu.append(&MenuItem::with_id(
            app_handle,
            "refresh_menu",
            "Refresh Menu",
            true,
            None::<&str>,
        )?)?;
        menu.append(&PredefinedMenuItem::separator(app_handle)?)?;
        menu.append(&MenuItem::with_id(
            app_handle,
            "quit_app",
            "Quit",
            true,
            None::<&str>,
        )?)?;

        Ok(menu)
    }

    /// Create optimized group submenu
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
        } else {
            // Execute all
            submenu.append(&MenuItem::with_id(
                manager,
                &format!("execute_group_{}", group.id),
                &format!("⚡ Execute All ({})", group.commands.len()),
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
        }

        Ok(submenu)
    }

    /// Refresh tray menu with conditional visibility
    pub fn refresh_tray_menu(app_handle: AppHandle) -> Result<(), String> {
        let state: State<AppState> = app_handle.state();
        let groups = state.lock().unwrap().clone();
        let new_menu =
            Self::build_menu_with_visibility(&app_handle, &groups).map_err(|e| e.to_string())?;

        app_handle
            .tray_by_id("main-tray")
            .ok_or("Tray not found")?
            .set_menu(Some(new_menu))
            .map_err(|e| e.to_string())?;

        log::info!("Tray refreshed: {} groups", groups.len());
        Ok(())
    }
}
