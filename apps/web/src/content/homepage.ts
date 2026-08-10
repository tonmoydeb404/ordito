import { externalUrls } from "@/config/paths-config";

export const SITE_URL = externalUrls.site;
export const REPOSITORY_URL = externalUrls.repository;

// Primary site navigation. Route-based so every page is reachable from the
// header on both the homepage and sub-pages (PageShell).
export const primaryNav = [
  { label: "Features", href: "/features" },
  { label: "Docs", href: "/docs" },
  { label: "Alternatives", href: "/alternatives" },
] as const;

// Ordito is a full-window desktop app (not a small tray panel), so the hero
// shows one real screenshot of the main Commands view.
export const heroScreenshot = "commands" as const;

export const capabilities = [
  {
    title: "One tray click",
    description: "Run a saved command directly from the system tray.",
    icon: "mouse",
  },
  {
    title: "Local execution",
    description: "Commands run on your machine in your own environment.",
    icon: "laptop",
  },
  {
    title: "Built-in scheduling",
    description: "Create recurring cron schedules or one-time runs.",
    icon: "calendar",
  },
  {
    title: "Complete history",
    description: "Keep output, duration, status, and exit codes together.",
    icon: "history",
  },
] as const;

export const features = [
  {
    id: "tray",
    title: "Run saved commands from the tray",
    description:
      "Open Ordito, choose a command, and get back to work. The panel does not need to stay open, and there is no terminal window to manage.",
    visualTitle: "Tray command menu",
    visualDescription:
      "Reserved for a product view showing grouped commands in the native tray menu.",
    visualView: "commands",
    tone: "rose",
    span: "wide",
  },
  {
    id: "organize",
    title: "Keep every repeatable command organized",
    description:
      "Save command names, shell instructions, working directories, and environment details in named groups. Search focuses instantly with Command K or Control K.",
    visualTitle: "Commands and groups",
    visualDescription:
      "Reserved for the searchable Commands view and group navigation.",
    visualView: "commands",
    tone: "violet",
    span: "narrow",
  },
  {
    id: "quiet",
    title: "Stay out of the terminal for work you already know",
    description:
      "The terminal is still there when you need it. Ordito removes it from the repetitive commands you have already named, saved, and trusted.",
    visualTitle: "A quieter daily workflow",
    visualDescription:
      "Reserved for a final product composition connecting tray, panel, and execution history.",
    visualView: "history",
    tone: "blue",
    span: "full",
  },
] as const;

export const workflow = [
  {
    title: "Save it once",
    description:
      "Name the command and keep its exact shell instruction in Ordito.",
  },
  {
    title: "Run or schedule",
    description:
      "Start it from the tray, the panel, or let its schedule handle it.",
  },
  {
    title: "Check the result",
    description:
      "Return only when needed to review status and captured output.",
  },
] as const;

export const faqItems = [
  {
    question: "What is Ordito?",
    answer:
      "Ordito is a desktop command runner for shell workflows you use repeatedly. It organizes commands into groups, runs them from the panel or system tray, schedules them, and keeps an execution history.",
  },
  {
    question: "Do commands run on my machine?",
    answer:
      "Yes. Ordito is a Tauri desktop app and executes saved commands locally in your environment. It does not send commands to a hosted execution service.",
  },
  {
    question: "Do I need to keep a terminal window open?",
    answer:
      "No. Ordito runs saved commands as background processes and captures their output for the History view.",
  },
  {
    question: "Can Ordito run commands automatically?",
    answer:
      "Yes. You can create recurring cron schedules and one-time runs, pause schedules, and review the next run time from the Schedule view.",
  },
  {
    question: "What does Ordito keep after a run?",
    answer:
      "History includes the command status, start time, duration, exit code, and captured output so completed and failed runs can be reviewed later.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "Ordito provides desktop builds for macOS and Windows through GitHub Releases.",
  },
] as const;

export const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Alternatives", href: "/alternatives" },
      { label: "Docs", href: "/docs" },
      { label: "Changelog", href: "/changelog" },
      { label: "Download", href: "/download" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Support", href: "/support" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: REPOSITORY_URL, external: true },
      {
        label: "Releases",
        href: externalUrls.download,
        external: true,
      },
      {
        label: "MIT License",
        href: `${REPOSITORY_URL}/blob/main/LICENSE`,
        external: true,
      },
    ],
  },
] as const;
