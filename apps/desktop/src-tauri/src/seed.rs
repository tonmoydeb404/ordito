use chrono::Utc;
use rusqlite::{params, Connection};

use crate::db::{create_command, DbResult};
use crate::models::CommandInput;

// (command name, iconify key, macOS command, Linux command, Windows command, run in background)
// background must be false for commands that prompt for input (read/set /p), since those need a real terminal
type StarterCommand = (
    &'static str,
    &'static str,
    &'static str,
    &'static str,
    &'static str,
    bool,
);

// (group name, group icon, starter commands) seeded into new installs
const STARTER_GROUPS: &[(&str, &str, &[StarterCommand])] = &[
    (
        "Quick Launch",
        "lucide:rocket",
        &[
            (
                "Visual Studio Code",
                "simple-icons:visualstudiocode",
                "open -a \"Visual Studio Code\" .",
                "code .",
                "code .",
                true,
            ),
            (
                "Google Chrome",
                "simple-icons:googlechrome",
                "open -a \"Google Chrome\"",
                "google-chrome",
                "start chrome",
                true,
            ),
            (
                "Terminal",
                "lucide:square-terminal",
                "open -a Terminal",
                "x-terminal-emulator",
                "start cmd",
                true,
            ),
            (
                "File Manager",
                "lucide:folder-open",
                "open .",
                "xdg-open .",
                "explorer .",
                true,
            ),
            (
                "Slack",
                "simple-icons:slack",
                "open -a Slack",
                "slack",
                "start slack",
                true,
            ),
        ],
    ),
    (
        "System Utilities",
        "lucide:wrench",
        &[
            (
                "Show IP Address",
                "lucide:network",
                "ipconfig getifaddr en0",
                "hostname -I",
                "ipconfig",
                false,
            ),
            (
                "Disk Space",
                "lucide:hard-drive",
                "df -h",
                "df -h",
                "wmic logicaldisk get caption,size,freespace",
                false,
            ),
            (
                "System Uptime",
                "lucide:clock",
                "uptime",
                "uptime",
                "net stats srv",
                false,
            ),
            (
                "Ping Test",
                "lucide:wifi",
                "ping -c 4 8.8.8.8",
                "ping -c 4 8.8.8.8",
                "ping -n 4 8.8.8.8",
                false,
            ),
            (
                "Top Processes",
                "lucide:activity",
                "ps aux | sort -rk 3 | head -10",
                "ps aux | sort -rk 3 | head -10",
                "tasklist",
                false,
            ),
            (
                "Memory Usage",
                "lucide:memory-stick",
                "vm_stat",
                "free -h",
                "systeminfo | findstr /C:\"Total Physical Memory\"",
                false,
            ),
            (
                "CPU Info",
                "lucide:cpu",
                "sysctl -n machdep.cpu.brand_string",
                "lscpu",
                "wmic cpu get name",
                false,
            ),
            (
                "Battery Status",
                "lucide:battery",
                "pmset -g batt",
                "upower -i $(upower -e | grep BAT)",
                "WMIC PATH Win32_Battery get EstimatedChargeRemaining",
                false,
            ),
        ],
    ),
    (
        "Developer Tools",
        "lucide:hammer",
        &[
            (
                "Free Port",
                "lucide:unplug",
                "read -p \"Port to free: \" PORT && lsof -ti:$PORT | xargs kill -9",
                "read -p \"Port to free: \" PORT && lsof -ti:$PORT | xargs kill -9",
                "set /p PORT=\"Port to free: \" && for /f \"tokens=5\" %a in ('netstat -aon ^| findstr :%PORT%') do taskkill /F /PID %a",
                false,
            ),
            (
                "Kill Process by Name",
                "lucide:circle-x",
                "read -p \"Process name: \" NAME && pkill -9 -f \"$NAME\"",
                "read -p \"Process name: \" NAME && pkill -9 -f \"$NAME\"",
                "set /p NAME=\"Process name: \" && taskkill /F /IM %NAME%",
                false,
            ),
            (
                "Ping Host",
                "lucide:signal",
                "read -p \"Host to ping: \" HOST && ping -c 4 \"$HOST\"",
                "read -p \"Host to ping: \" HOST && ping -c 4 \"$HOST\"",
                "set /p HOST=\"Host to ping: \" && ping -n 4 %HOST%",
                false,
            ),
            (
                "DNS Lookup",
                "lucide:globe",
                "read -p \"Domain to look up: \" DOMAIN && nslookup \"$DOMAIN\"",
                "read -p \"Domain to look up: \" DOMAIN && nslookup \"$DOMAIN\"",
                "set /p DOMAIN=\"Domain to look up: \" && nslookup %DOMAIN%",
                false,
            ),
        ],
    ),
];

// picks the shell command matching the OS this binary was compiled for
fn platform_command(cmd: &StarterCommand) -> &'static str {
    let (_, _, mac, linux, windows, _) = *cmd;
    if cfg!(target_os = "windows") {
        windows
    } else if cfg!(target_os = "linux") {
        linux
    } else {
        mac
    }
}

pub fn seed_defaults(conn: &Connection) -> DbResult<()> {
    let has_groups: i64 = conn.query_row("SELECT COUNT(*) FROM command_groups", [], |r| r.get(0))?;

    if has_groups == 0 {
        for (group_position, (group_name, group_icon, commands)) in STARTER_GROUPS.iter().enumerate() {
            let now = Utc::now().to_rfc3339();
            let group_id = uuid::Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO command_groups (id, name, icon, position, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
                params![group_id, group_name, group_icon, group_position as i32, now],
            )?;

            for (position, starter) in commands.iter().enumerate() {
                let (name, icon, _, _, _, run_in_background) = *starter;
                create_command(
                    conn,
                    &CommandInput {
                        name: name.to_string(),
                        command: platform_command(starter).to_string(),
                        cwd: String::new(),
                        group_id: group_id.clone(),
                        requires_confirmation: false,
                        run_in_background,
                        icon: Some(icon.to_string()),
                        position: Some(position as i32),
                    },
                )?;
            }
        }
    }

    let has_settings: i64 = conn.query_row("SELECT COUNT(*) FROM settings", [], |r| r.get(0))?;

    if has_settings == 0 {
        conn.execute(
            "INSERT INTO settings (key, value) VALUES ('max_history_runs', '500'), ('log_retention_days', '30')",
            [],
        )?;
    }

    Ok(())
}
