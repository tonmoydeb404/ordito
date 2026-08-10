export type DocPage = {
  slug: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  body: { heading: string; text: string }[];
  shortcuts?: { keys: string; action: string }[];
};

export const docs: DocPage[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    h1: "Getting started with Ordito",
    metaTitle: "Getting Started — Ordito Docs",
    metaDescription:
      "Install Ordito on macOS, Windows, or Ubuntu, save your first command, run it from the tray, schedule recurring runs, and review execution history.",
    intro:
      "Ordito keeps repeatable shell work one click away. Here is how to go from install to a quieter daily workflow in a few minutes.",
    body: [
      {
        heading: "1. Install Ordito",
        text: "Download the latest build for macOS, Windows, or Ubuntu from GitHub Releases, then launch it. Ordito lives in your system tray. On macOS it appears in the menu bar; on Windows and Ubuntu it appears in the system tray.",
      },
      {
        heading: "2. Save your first command",
        text: "Open the panel and create a command. Give it a name, paste its exact shell instruction, set a working directory, and file it under a named group. Ordito remembers the syntax so you never retype it.",
      },
      {
        heading: "3. Run it",
        text: "Run a saved command from the panel, or straight from the system tray menu without opening the panel at all. No terminal window is required — commands run as background processes and their output is captured.",
      },
      {
        heading: "4. Schedule recurring work",
        text: "Turn any command into a recurring cron schedule or a one-time run. Pause schedules and check the next run time from the Schedule view.",
      },
      {
        heading: "5. Review the result",
        text: "History captures every run: status, start time, duration, exit code, and output. Filter by status and expand any run to inspect what happened.",
      },
    ],
    shortcuts: [
      { keys: "⌘K / Ctrl K", action: "Focus the command search" },
      { keys: "↑ ↓", action: "Move selection through commands" },
      { keys: "Enter", action: "Run the selected command" },
    ],
  },
  {
    slug: "commands",
    title: "Commands & groups",
    h1: "Organize commands into groups",
    metaTitle: "Commands & Groups — Ordito Docs",
    metaDescription:
      "Save shell commands with names, working directories, and environment. Organize them into named groups and find them instantly with Command/Control K.",
    intro:
      "Ordito gives your commands a real home instead of a flat alias list. Name them, group them, and find them instantly with the keyboard.",
    body: [
      {
        heading: "What a command stores",
        text: "Each command keeps its name, its exact shell instruction, a working directory, and any environment details you set. Everything is saved locally so it persists across sessions and reboots.",
      },
      {
        heading: "Named groups",
        text: "File commands under groups that match how you work — by project, environment, or task. Groups keep related commands together so the one you need is never more than a glance away.",
      },
      {
        heading: "Instant keyboard search",
        text: "Press Command K or Control K to focus search, use the arrow keys to move the selection, and press Enter to run. The whole flow stays on the keyboard, so you never reach for the mouse.",
      },
      {
        heading: "More than aliases",
        text: "Unlike shell aliases, your saved commands are organized, searchable, available outside the terminal, and ready to schedule or review later. Short aliases you type constantly still belong in your shell.",
      },
    ],
  },
  {
    slug: "scheduling",
    title: "Scheduling",
    h1: "Schedule shell commands with cron",
    metaTitle: "Scheduling & Cron — Ordito Docs",
    metaDescription:
      "Create recurring cron schedules or one-time runs for saved shell commands. Pause schedules and see the next run time from the Schedule view.",
    intro:
      "Turn any saved command into a recurring cron schedule or a one-time run. Ordito handles the timing and records every execution.",
    body: [
      {
        heading: "Recurring cron schedules",
        text: "Describe the cadence with a cron expression and let Ordito run the command on schedule. Nightly builds, weekly deploys, and hourly syncs all work the same way. Ordito uses cron expressions but runs its scheduler in-process as part of the desktop app, not the system crontab.",
      },
      {
        heading: "One-time runs",
        text: "Fire off a command once without saving a schedule, or schedule a single future run for a specific task. One-time runs keep History complete without cluttering your recurring schedules.",
      },
      {
        heading: "Pause and resume",
        text: "Pause a schedule to stop it temporarily without deleting it, then resume it when you are ready. The Schedule view shows active and paused schedules together.",
      },
      {
        heading: "Always visible",
        text: "The Schedule view lists every schedule with its next run time, so you always know what is coming up and can confirm a job is still active.",
      },
    ],
  },
  {
    slug: "history",
    title: "Run history",
    h1: "Review every command run",
    metaTitle: "Run History — Ordito Docs",
    metaDescription:
      "Every run is recorded with status, start time, duration, exit code, and captured output. Filter by status and inspect what happened.",
    intro:
      "Ordito records what happened every time a command runs, so you can stop wondering whether a scheduled job actually succeeded.",
    body: [
      {
        heading: "Everything captured",
        text: "Each run stores its status, start time, duration, exit code, and captured output. Completed and failed runs sit side by side for easy comparison.",
      },
      {
        heading: "Filter and find",
        text: "Filter history by status and group runs by time to find the execution you care about without scrolling through a terminal buffer.",
      },
      {
        heading: "Trust your scheduled work",
        text: "For scheduled commands especially, history turns a fire-and-forget job into something you can verify after the fact. If a nightly task fails, the exit code and output are waiting for you.",
      },
    ],
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    h1: "Troubleshooting Ordito",
    metaTitle: "Troubleshooting — Ordito Docs",
    metaDescription:
      "Fix common Ordito issues: commands that do not run, where your data is stored, and how to inspect exit codes and output in History.",
    intro:
      "If something is not working, these steps cover the most common causes. Most issues come down to the command itself, its environment, or where data is stored.",
    body: [
      {
        heading: "My command did not run",
        text: "First, confirm the command works in a normal terminal with the same working directory and environment. Check History for the run: its status, exit code, and captured output usually show exactly what happened.",
      },
      {
        heading: "Check the working directory and environment",
        text: "A command that depends on a specific directory or environment variable will fail if those are not set on the saved command. Verify the working directory matches where the command expects to run.",
      },
      {
        heading: "Where your data is stored",
        text: "Everything — commands, groups, schedules, and run history — is kept in a local SQLite database in your operating system's standard application data directory. Nothing is sent to a server.",
      },
      {
        heading: "Read the exit code",
        text: "A non-zero exit code means the command itself reported a failure. Ordito captures the code and output so you can reproduce the command in a terminal to debug it further.",
      },
      {
        heading: "Still stuck",
        text: "If none of this helps, report it on GitHub. Include your OS, the command's working directory and environment, and the exit code and output shown in History.",
      },
    ],
  },
];

export function getDoc(slug: string) {
  return docs.find((doc) => doc.slug === slug);
}
