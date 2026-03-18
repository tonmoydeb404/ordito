use crate::commands;
use crate::error::lock_state;
use crate::models::CommandGroup;
use crate::system::notification::NotificationManager;
use crate::state::AppState;
use crate::system::window::WindowManager;
use std::collections::HashMap;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, State,
};

pub struct TrayManager;

impl TrayManager {
    pub fn setup_system_tray(
        app: &tauri::App,
        groups: &HashMap<String, CommandGroup>,
    ) -> tauri::Result<()> {
        let app_handle = app.handle();
        let is_visible = true;
        let menu = Self::build_tray_menu(app_handle, groups, is_visible)?;

        TrayIconBuilder::with_id("main-tray")
            .icon(app.default_window_icon().unwrap().clone())
            .menu(&menu)
            .show_menu_on_left_click(false)
            .tooltip("Ordito - Right click for menu, left click to show window")
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

    pub fn refresh_tray_menu(app_handle: AppHandle) -> Result<(), String> {
        let state: State<AppState> = app_handle.state();
        let groups = lock_state(&state)?.clone();
        let is_visible = WindowManager::is_window_visible(&app_handle).unwrap_or(true);
        let new_menu =
            Self::build_tray_menu(&app_handle, &groups, is_visible).map_err(|e| e.to_string())?;

        app_handle
            .tray_by_id("main-tray")
            .ok_or("Tray not found")?
            .set_menu(Some(new_menu))
            .map_err(|e| e.to_string())?;

        log::info!("Tray refreshed: {} groups", groups.len());
        Ok(())
    }

    fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
        let result = match event.id().as_ref() {
            "show_window" => WindowManager::show_window(app),
            "hide_to_tray" => WindowManager::hide_to_tray(app),
            "refresh_menu" => Self::refresh_tray_menu(app.clone()),
            "quit_app" => {
                log::info!("Quitting application");
                app.exit(0);
                return;
            }
            id if id.starts_with("execute_group_") => {
                Self::execute_group(app, &id[14..]);
                return;
            }
            id if id.starts_with("execute_command_") => {
                Self::execute_command_by_id(app, &id[16..]);
                return;
            }
            _ => return,
        };

        if let Err(e) = result {
            NotificationManager::show(app, "Error", &e);
        }
    }

    fn execute_command_by_id(app: &AppHandle, id_part: &str) {
        let parts: Vec<&str> = id_part.split('_').collect();
        if parts.len() >= 2 {
            Self::execute_command(app.clone(), parts[0].to_string(), parts[1].to_string());
        }
    }

    fn execute_group(app: &AppHandle, group_id: &str) {
        let app_handle = app.clone();
        let group_id = group_id.to_string();

        tauri::async_runtime::spawn(async move {
            let state: State<AppState> = app_handle.state();
            match commands::execute::execute_group_commands(state, group_id).await {
                Ok(results) => Self::notify_execution_results(&app_handle, results),
                Err(e) => NotificationManager::show(&app_handle, "Group Failed", &e),
            }
        });
    }

    fn execute_command(app_handle: AppHandle, group_id: String, command_id: String) {
        tauri::async_runtime::spawn(async move {
            let state: State<AppState> = app_handle.state();
            let command = {
                match lock_state(&state) {
                    Ok(groups) => groups
                        .get(&group_id)
                        .and_then(|g| g.commands.iter().find(|c| c.id == command_id).cloned()),
                    Err(e) => {
                        NotificationManager::show(&app_handle, "Error", &e);
                        return;
                    }
                }
            };

            match command {
                Some(cmd) => {
                    let result = if cmd.is_detached.unwrap_or(false) {
                        commands::execute::execute_command_detached(cmd.cmd).await
                    } else {
                        commands::execute::execute_command(cmd.cmd).await
                    };

                    match result {
                        Ok(_) => NotificationManager::show(
                            &app_handle,
                            "Success",
                            &format!("'{}' completed", cmd.label),
                        ),
                        Err(e) => NotificationManager::show(
                            &app_handle,
                            "Failed",
                            &format!("'{}': {}", cmd.label, e),
                        ),
                    }
                }
                None => NotificationManager::show(&app_handle, "Error", "Command not found"),
            }
        });
    }

    fn notify_execution_results(app: &AppHandle, results: Vec<(String, String)>) {
        let (success, errors) = results.iter().fold((0, 0), |(s, e), (_, output)| {
            if output.starts_with("Error:") { (s, e + 1) } else { (s + 1, e) }
        });

        let (title, message) = match (success, errors) {
            (s, 0) => ("Group Completed", format!("All {} commands succeeded", s)),
            (0, e) => ("Group Failed", format!("All {} commands failed", e)),
            (s, e) => ("Partial Success", format!("{} succeeded, {} failed", s, e)),
        };

        NotificationManager::show(app, title, &message);
    }

    fn build_tray_menu(
        app_handle: &AppHandle,
        groups: &HashMap<String, CommandGroup>,
        is_visible: bool,
    ) -> tauri::Result<Menu<tauri::Wry>> {
        let menu = Menu::new(app_handle)?;

        if groups.is_empty() {
            menu.append(&MenuItem::with_id(
                app_handle, "no_groups", "No command groups", false, None::<&str>,
            )?)?;
        } else {
            for group in groups.values() {
                menu.append(&Self::create_group_submenu(app_handle, group)?)?;
            }
        }

        menu.append(&PredefinedMenuItem::separator(app_handle)?)?;

        if is_visible {
            menu.append(&MenuItem::with_id(
                app_handle, "hide_to_tray", "Hide to Tray", true, None::<&str>,
            )?)?;
        } else {
            menu.append(&MenuItem::with_id(
                app_handle, "show_window", "Show Window", true, None::<&str>,
            )?)?;
        }

        menu.append(&MenuItem::with_id(
            app_handle, "refresh_menu", "Refresh Menu", true, None::<&str>,
        )?)?;
        menu.append(&PredefinedMenuItem::separator(app_handle)?)?;
        menu.append(&MenuItem::with_id(
            app_handle, "quit_app", "Quit", true, None::<&str>,
        )?)?;

        Ok(menu)
    }

    fn create_group_submenu(
        app_handle: &AppHandle,
        group: &CommandGroup,
    ) -> tauri::Result<Submenu<tauri::Wry>> {
        let submenu =
            Submenu::with_id(app_handle, &format!("group_{}", group.id), &group.title, true)?;

        if group.commands.is_empty() {
            submenu.append(&MenuItem::with_id(
                app_handle,
                &format!("no_commands_{}", group.id),
                "No commands",
                false,
                None::<&str>,
            )?)?;
        } else {
            submenu.append(&MenuItem::with_id(
                app_handle,
                &format!("execute_group_{}", group.id),
                &format!("⚡ Execute All ({})", group.commands.len()),
                true,
                None::<&str>,
            )?)?;
            submenu.append(&PredefinedMenuItem::separator(app_handle)?)?;

            for cmd in &group.commands {
                let icon = if cmd.is_detached.unwrap_or(false) { "🚀" } else { "⚡" };
                submenu.append(&MenuItem::with_id(
                    app_handle,
                    &format!("execute_command_{}_{}", group.id, cmd.id),
                    &format!("{} {}", icon, cmd.label),
                    true,
                    None::<&str>,
                )?)?;
            }
        }

        Ok(submenu)
    }
}
