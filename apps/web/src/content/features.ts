export type Feature = {
  slug: string;
  title: string;
  metaDescription: string;
};

export const features: Feature[] = [
  {
    slug: "tray-execution",
    title: "Tray execution",
    metaDescription:
      "Run any saved shell command from the macOS menu bar or Windows tray without opening a terminal. One click, captured output, no friction.",
  },
  {
    slug: "command-groups",
    title: "Groups & search",
    metaDescription:
      "Save command names, shell instructions, and working directories in named groups. Instant search with Command/Control K, arrow-key navigation, Enter to run.",
  },
  {
    slug: "scheduling",
    title: "Scheduling",
    metaDescription:
      "Create recurring cron schedules or one-time runs for saved shell commands. Pause schedules and see the next run time from the Schedule view.",
  },
  {
    slug: "history",
    title: "Run history",
    metaDescription:
      "Every run is recorded with status, start time, duration, exit code, and captured output. Filter by status and inspect what happened.",
  },
];
