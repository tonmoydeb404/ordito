import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CommandResponse, LogResponse } from "@/store/types";

interface LogItemProps {
  log: LogResponse;
  command: CommandResponse | undefined;
  isExpanded: boolean;
  onToggleExpansion: (logId: string) => void;
}

export function LogItem({
  log,
  command,
  isExpanded,
  onToggleExpansion,
}: LogItemProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "destructive";
      case "running":
        return "info";
      case "timeout":
        return "warning";
      case "cancelled":
        return "secondary";
      default:
        return "primary";
    }
  };

  const formatDuration = (startedAt: string, finishedAt?: string) => {
    if (!finishedAt) return "N/A";
    const start = new Date(startedAt).getTime();
    const end = new Date(finishedAt).getTime();
    const duration = end - start;

    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dateString));
  };

  const hasOutput = log.output && log.output.trim().length > 0;
  const commandName = command?.title || "Unknown Command";

  return (
    <div className="bg-secondary border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadge(log.status)}>{log.status}</Badge>
          <h3 className="font-medium text-sm">{commandName}</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(log.started_at)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">Duration:</span>{" "}
          {formatDuration(log.started_at, log.finished_at)}
        </div>
        <div>
          <span className="font-medium">Exit Code:</span>{" "}
          {log.exit_code ?? "N/A"}
        </div>
        <div>
          <span className="font-medium">Working Dir:</span>{" "}
          <span className="truncate" title={log.working_dir}>
            {log.working_dir}
          </span>
        </div>
        <div>
          <span className="font-medium">Timeout:</span>{" "}
          {log.timeout ? `${log.timeout}s` : "None"}
        </div>
      </div>

      {hasOutput && (
        <Collapsible
          open={isExpanded}
          onOpenChange={() => onToggleExpansion(log.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="link"
              className="p-0 h-auto text-primary text-xs hover:underline"
            >
              {isExpanded ? "Hide Output" : "Show Output"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-background rounded border p-3 max-h-60 overflow-y-auto scrollbar-thin">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                {log.output}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {!hasOutput && log.status !== "running" && (
        <div className="text-xs text-muted-foreground">No output captured</div>
      )}

      {log.status === "running" && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
          Command is currently running...
        </div>
      )}
    </div>
  );
}
