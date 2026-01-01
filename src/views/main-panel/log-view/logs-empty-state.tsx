import { Terminal as TerminalIcon } from "lucide-react";

interface LogsEmptyStateProps {
  selectedGroup: boolean;
  hasLogs: boolean;
}

export function LogsEmptyState({
  selectedGroup,
  hasLogs,
}: LogsEmptyStateProps) {
  return (
    <div className="text-center text-muted-foreground py-12">
      <TerminalIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">No execution logs</h3>
      <p className="text-sm">
        {!selectedGroup
          ? "Select a command group to view execution logs"
          : !hasLogs
          ? "Execute commands to see their logs here"
          : "No logs match the current filters"}
      </p>
    </div>
  );
}
