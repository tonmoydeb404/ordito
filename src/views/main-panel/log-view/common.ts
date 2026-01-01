import { BadgeVariant } from "@/components/ui/badge";
import { LogResponse } from "@/store";

export const variants: Record<LogResponse["status"], BadgeVariant> = {
  success: "success",
  failed: "destructive",
  timeout: "warning",
  cancelled: "secondary",
  running: "info",
};

export const formatDuration = (startedAt: string, finishedAt?: string) => {
  const start = new Date(startedAt);
  const end = finishedAt ? new Date(finishedAt) : new Date();
  const duration = end.getTime() - start.getTime();

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};
