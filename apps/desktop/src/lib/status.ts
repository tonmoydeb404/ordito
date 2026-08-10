import type { CommandStatus, RunStatus } from "../types";

export const statusLabels: Record<CommandStatus | RunStatus, string> = {
  idle: "Ready",
  running: "Running",
  success: "Done",
  failed: "Failed",
};

export const statusDotClass: Record<CommandStatus, string> = {
  idle: "bg-faint",
  running: "bg-accent",
  success: "bg-success",
  failed: "bg-danger",
};

export const statusIconClass: Record<RunStatus, string> = {
  running: "text-accent-soft-text bg-accent-soft",
  success: "text-success-soft-text bg-success-soft",
  failed: "text-danger bg-danger-soft",
};

export const statusBadgeClass: Record<CommandStatus, string> = {
  idle: "text-muted-foreground bg-muted",
  running: "text-accent-soft-text bg-accent-soft",
  success: "text-success-soft-text bg-success-soft",
  failed: "text-danger-soft-text bg-danger-soft",
};

// Derived, presentation-only state: an idle command with an active schedule
// is surfaced as "Scheduled" instead of "Ready" — not a persisted CommandStatus.
export const scheduledBadgeClass = "text-warning-soft-text bg-warning-soft";
export const scheduledLabel = "Scheduled";
