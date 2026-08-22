use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Manager,
};

use crate::brand;
use crate::db;
use crate::executor;
use crate::state::AppState;

pub fn rebuild_menu(app: &AppHandle) {
    let menu = match Menu::new(app) {
        Ok(m) => m,
        Err(_) => return,
    };

    if let Ok(item) = MenuItem::with_id(
        app,
        "open",
        format!("Open {}", brand::APP_NAME),
        true,
        None::<&str>,
    ) {
        let _ = menu.append(&item);
    }

    let groups = {
        let state = app.state::<AppState>();
        let conn = match state.db.lock() {
            Ok(c) => c,
            Err(_) => return,
        };
        db::list_groups(&conn).unwrap_or_default()
    };

    let mut has_any_command = false;

    {
        let state = app.state::<AppState>();
        let conn = match state.db.lock() {
            Ok(c) => c,
            Err(_) => return,
        };

        for group in &groups {
            let commands = db::list_commands_by_group(&conn, &group.id).unwrap_or_default();
            if commands.is_empty() {
                continue;
            }

            has_any_command = true;
            let submenu = match Submenu::with_id(
                app,
                format!("grp:{}", group.id),
                &group.name,
                true,
            ) {
                Ok(s) => s,
                Err(_) => continue,
            };

            for cmd in &commands {
                if let Ok(item) = MenuItem::with_id(
                    app,
                    format!("cmd:{}", cmd.id),
                    &cmd.name,
                    true,
                    None::<&str>,
                ) {
                    let _ = submenu.append(&item);
                }
            }

            let _ = menu.append(&submenu);
        }
    }

    if has_any_command {
        if let Ok(sep) = PredefinedMenuItem::separator(app) {
            let _ = menu.append(&sep);
        }
    }

    if let Ok(item) = MenuItem::with_id(
        app,
        "quit",
        format!("Quit {}", brand::APP_NAME),
        true,
        None::<&str>,
    ) {
        let _ = menu.append(&item);
    }

    if let Some(tray) = app.tray_by_id("main_tray") {
        let _ = tray.set_menu(Some(menu));
    }
}

pub fn handle_menu_event(app: &AppHandle, id: &str) {
    match id {
        "open" => {
            crate::show_window(app);
        }
        "quit" => {
            app.exit(0);
        }
        cmd_id if cmd_id.starts_with("cmd:") => {
            let command_id = &cmd_id[4..];
            let _ = executor::run_command_gated(app, command_id);
        }
        _ => {}
    }
}
