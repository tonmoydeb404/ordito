export type ChangelogEntry = {
  version: string;
  date: string;
  summary: string;
  highlights: string[];
};

// Each shipped version appends an entry here; release downloads always live on
// GitHub Releases. Entries are newest-first.
export const changelog: ChangelogEntry[] = [
  {
    version: "v2.0.0 — Complete rewrite",
    date: "2026-08-10",
    summary:
      "Ordito rebuilt from the ground up with a new Tauri 2 + React 19 monorepo architecture, a redesigned interface, a visual cron scheduler, full execution history with output logs, and broad cross-platform support. Every layer — data layer, execution engine, scheduler, tray, and UI — has been rewritten.",
    highlights: [
      "Complete rewrite on a Tauri 2 + React 19 + TypeScript monorepo with a shared design system and a dedicated marketing site.",
      "Redesigned interface with dark and light themes, resizable master/detail panels, and a Command/Control-K command palette for instant navigation.",
      "Command groups with custom icons (full Iconify registry search), per-command working directory, confirmation gates, and background-or-foreground execution modes.",
      "One-click execution from the list, detail panel, system tray, or command palette — plus batch execution to run every command in a group at once.",
      "Foreground mode opens a real terminal window (Terminal.app, gnome-terminal, PowerShell, and more) for interactive commands while still capturing output.",
      "Visual cron scheduler with a no-code builder, live human-readable descriptions, and one-time scheduled runs with pause and next-run timing.",
      "Full execution history with status filtering, time grouping, exit codes, durations, and clickable output logs opened in the system viewer.",
      "Config import/export with smart group de-duplication and ID remapping so schedules survive the transfer.",
      "Signed auto-updates that check GitHub Releases on launch and apply silently on the next relaunch.",
      "Start-at-login support, configurable history retention, and automatic cleanup of orphaned log files.",
      "17 pre-seeded starter commands across Quick Launch, System Utilities, and Developer Tools — platform-aware out of the box.",
      "Cross-platform builds for macOS (Apple Silicon), Windows (MSI and NSIS), and Linux (DEB).",
    ],
  },
  {
    version: "v1.1.4",
    date: "2026-03-18",
    summary:
      "UI refinements across the command list, detail panel, and tray menu for a cleaner, more consistent experience.",
    highlights: [
      "Polished command list rows, status badges, and hover actions.",
      "Refined tray menu layout and spacing.",
      "General visual consistency pass across the panel.",
    ],
  },
  {
    version: "v1.1.3",
    date: "2025-08-23",
    summary:
      "Maintenance release fixing a cron day-of-week mismatch and resolving Snap packaging issues for Linux distributions.",
    highlights: [
      "Fixed cron scheduler day-of-week calculation that caused runs to fire on the wrong day.",
      "Resolved Snapcraft build and confinement issues for Linux packaging.",
    ],
  },
  {
    version: "v1.1.2",
    date: "2025-06-21",
    summary:
      "Introduced the command scheduling service, allowing recurring cron schedules and one-time runs.",
    highlights: [
      "Cron-based recurring schedules for automated, hands-off command execution.",
      "One-time scheduled runs for fire-and-forget tasks.",
      "Schedule management integrated directly into the panel.",
    ],
  },
  {
    version: "v1.1.1",
    date: "2025-06-07",
    summary:
      "Added automated Snap packaging via GitHub Actions, build verification, and an auto-update mechanism.",
    highlights: [
      "GitHub Actions workflow for building and publishing Snap packages.",
      "Automated build testing and release pipeline.",
      "Auto-update support so the app checks for and applies new releases.",
    ],
  },
  {
    version: "v1.1.0",
    date: "2025-06-01",
    summary:
      "Bug-fix release addressing configuration import issues.",
    highlights: [
      "Fixed import failures when restoring command configurations.",
    ],
  },
  {
    version: "v1.0.0 — First stable release",
    date: "2025-05-31",
    summary:
      "The first public release of Ordito. A desktop application that brings command execution to the system tray — organize commands into groups and run them with a single click, no terminal required.",
    highlights: [
      "Command groups to organize related commands (Development, Docker, Git, and more).",
      "Quick one-click execution from the tray menu.",
      "Detached mode to run background processes without blocking the UI.",
      "Batch execution to run every command in a group at once.",
      "System tray integration with right-click menu, hide-to-tray, and auto-start support.",
      "Export and import for backing up and sharing command configurations.",
      "Cross-platform support for Windows and Linux.",
    ],
  },
];
