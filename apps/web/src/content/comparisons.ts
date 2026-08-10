export type ComparisonRow = {
  capability: string;
  ordito: string;
  other: string;
};

export type Comparison = {
  slug: string;
  tool: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  orditoPitch: string;
  bestForOrdito: string;
  bestForTool: string;
  table: ComparisonRow[];
  faq: { question: string; answer: string }[];
};

export const comparisons: Comparison[] = [
  {
    slug: "cron",
    tool: "cron",
    h1: "Ordito vs cron: a cron alternative with a UI",
    metaTitle: "Ordito vs cron — A cron alternative with a UI",
    metaDescription:
      "cron schedules tasks but has no UI, no tray, and no run history. Ordito brings cron scheduling, one-click tray execution, and full history together.",
    intro:
      "cron is the time-tested scheduler built into Unix systems. It runs commands on a schedule and stays out of the way. But it has no interface, no tray access, and no record of what happened when a job ran.",
    orditoPitch:
      "Ordito gives you cron-style scheduling plus a panel, a system tray menu, and a complete run history. You create recurring or one-time schedules the same way you save a command, and every run is recorded with its status, duration, and output.",
    bestForOrdito:
      "Running repeatable commands from the tray and confirming they actually succeeded.",
    bestForTool:
      "Unattended server-side jobs that must run regardless of whether you are logged in.",
    table: [
      {
        capability: "Schedule recurring runs",
        ordito: "Yes, cron expressions",
        other: "Yes, crontab syntax",
      },
      {
        capability: "One-time runs",
        ordito: "Yes, from the panel",
        other: "Manual (at/one-shot scripts)",
      },
      {
        capability: "Run from the system tray",
        ordito: "Yes",
        other: "No",
      },
      {
        capability: "Run history with output",
        ordito: "Yes, per run",
        other: "No (redirect to logs yourself)",
      },
      {
        capability: "Graphical interface",
        ordito: "Yes",
        other: "No",
      },
      {
        capability: "Setup",
        ordito: "Save a command",
        other: "Edit crontab by hand",
      },
    ],
    faq: [
      {
        question: "Does Ordito use cron under the hood?",
        answer:
          "Ordito uses cron expressions to describe schedules, but it runs the scheduler in-process as part of the desktop app rather than relying on the system crontab.",
      },
      {
        question: "Should I replace cron with Ordito?",
        answer:
          "Ordito is for local, interactive, repeatable commands. Server-side daemons that must run whether or not you are logged in should stay on cron or your system scheduler.",
      },
    ],
  },
  {
    slug: "raycast",
    tool: "Raycast",
    h1: "Ordito vs Raycast: running saved commands vs launching things",
    metaTitle: "Ordito vs Raycast — Which is right for your commands?",
    metaDescription:
      "Raycast is a powerful launcher. Ordito is a tray-resident command runner with scheduling and run history. See how they compare.",
    intro:
      "Raycast is a fast launcher that replaces Spotlight and can run script commands and extensions. It is excellent at finding and opening things. It is not built around repeatable shell commands that live in your tray and get scheduled.",
    orditoPitch:
      "Ordito is purpose-built for the commands you already know and run over and over. It lives in the system tray, runs commands with one click, schedules them, and keeps a full history of every execution. It complements a launcher rather than replacing one.",
    bestForOrdito:
      "A dedicated home for repeatable shell commands with scheduling and history.",
    bestForTool:
      "A general launcher for apps, calculations, clipboard, and extensions.",
    table: [
      {
        capability: "Run saved shell commands",
        ordito: "Yes, one click from tray",
        other: "Yes, via script commands",
      },
      {
        capability: "System tray residence",
        ordito: "Yes",
        other: "Launcher overlay",
      },
      {
        capability: "Schedule recurring runs",
        ordito: "Yes",
        other: "No",
      },
      {
        capability: "Run history with output",
        ordito: "Yes",
        other: "No",
      },
      {
        capability: "Named command groups",
        ordito: "Yes",
        other: "Via extensions/folders",
      },
    ],
    faq: [
      {
        question: "Do I have to choose between Ordito and Raycast?",
        answer:
          "No. Many users keep a launcher for general tasks and use Ordito specifically for repeatable commands that benefit from scheduling and history.",
      },
      {
        question: "Can Raycast do what Ordito does?",
        answer:
          "With custom script commands and extensions you can run commands, but Raycast does not provide tray-resident execution, cron scheduling, or a persistent run-history view.",
      },
    ],
  },
  {
    slug: "alfred",
    tool: "Alfred",
    h1: "Ordito vs Alfred: a free, cross-platform alternative for commands",
    metaTitle: "Ordito vs Alfred — A free, cross-platform Alfred alternative",
    metaDescription:
      "Alfred is a beloved macOS launcher. Ordito runs saved shell commands from the tray with scheduling and history, on macOS and Windows, for free.",
    intro:
      "Alfred is a polished macOS launcher. Its scripting and workflow features (most of which require the paid Powerpack) can run commands. It is macOS only and built as a launcher, not a command runner.",
    orditoPitch:
      "Ordito focuses on repeatable shell commands: tray execution, groups and search, scheduling, and full run history. It is free and open source, and it runs on macOS and Windows.",
    bestForOrdito:
      "Repeatable commands with scheduling and history, cross-platform and free.",
    bestForTool:
      "macOS launchers, snippets, and workflows for Powerpack users.",
    table: [
      {
        capability: "Run saved shell commands",
        ordito: "Yes",
        other: "Yes (workflows, Powerpack)",
      },
      {
        capability: "Platforms",
        ordito: "macOS and Windows",
        other: "macOS only",
      },
      {
        capability: "Price",
        ordito: "Free, MIT",
        other: "Free core; Powerpack paid",
      },
      {
        capability: "Schedule recurring runs",
        ordito: "Yes",
        other: "No",
      },
      {
        capability: "Run history with output",
        ordito: "Yes",
        other: "No",
      },
    ],
    faq: [
      {
        question: "Is Ordito a good Alfred alternative on Windows?",
        answer:
          "Alfred is macOS only. Ordito runs on both macOS and Windows, so it can serve as a cross-platform home for repeatable commands.",
      },
    ],
  },
  {
    slug: "shell-aliases",
    tool: "shell aliases",
    h1: "Ordito vs shell aliases: saved commands that travel with you",
    metaTitle: "Ordito vs Shell Aliases — Beyond a flat alias list",
    metaDescription:
      "Shell aliases are fast but flat, session-bound, and keep no history. Ordito organizes commands into groups, schedules them, and records every run.",
    intro:
      "Shell aliases and functions are the classic way to shorten commands you run often. They are fast and free, but they live in a flat dotfile, are tied to one shell session, and keep no record of what ran or whether it worked.",
    orditoPitch:
      "Ordito keeps your repeatable commands in named groups, runs them from the tray or the panel, schedules recurring runs, and records output and exit codes for every execution. Your saved commands live outside any single terminal session.",
    bestForOrdito:
      "Commands you want organized, scheduled, and tracked across sessions.",
    bestForTool:
      "Tiny shortcuts you type constantly inside a single shell.",
    table: [
      {
        capability: "Organized in named groups",
        ordito: "Yes",
        other: "Flat list in dotfiles",
      },
      {
        capability: "Available outside the terminal",
        ordito: "Yes, from the tray",
        other: "No, terminal session only",
      },
      {
        capability: "Schedule recurring runs",
        ordito: "Yes",
        other: "No",
      },
      {
        capability: "Run history with output",
        ordito: "Yes",
        other: "No",
      },
      {
        capability: "Search",
        ordito: "Instant (Command/Control K)",
        other: "Shell history grep",
      },
    ],
    faq: [
      {
        question: "Will Ordito replace my shell aliases?",
        answer:
          "Not entirely. Short aliases you type constantly still belong in your shell. Ordito is for commands you want to organize, schedule, run from the tray, or check back on later.",
      },
    ],
  },
];

export function getComparison(slug: string) {
  return comparisons.find((comparison) => comparison.slug === slug);
}
