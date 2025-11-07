import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type {
  CommandWithFolder,
  ExecutionLogWithCommand,
} from "@/types/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Terminal as TerminalIcon, Trash2 } from "lucide-react";
import { useState } from "react";

interface ExecutionLogProps {
  websocketMessage: any;
}

export default function ExecutionLog({ websocketMessage }: ExecutionLogProps) {
  const [commandFilter, setCommandFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery<ExecutionLogWithCommand[]>({
    queryKey: ["/api/execution-logs"],
  });

  const { data: commands = [] } = useQuery<CommandWithFolder[]>({
    queryKey: ["/api/commands"],
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/execution-logs");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/execution-logs"] });
      toast("Execution logs cleared");
    },
    onError: () => {
      toast.error("Failed to clear logs");
    },
  });

  // Filter logs based on command and time
  const filteredLogs = logs.filter((log) => {
    // Command filter
    if (commandFilter !== "all" && log.commandId !== commandFilter) {
      return false;
    }

    // Time filter
    const logTime = log.startedAt ? new Date(log.startedAt).getTime() : 0;
    const now = Date.now();
    const timeThreshold = {
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    }[timeFilter];

    if (timeThreshold && now - logTime > timeThreshold) {
      return false;
    }

    return true;
  });

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="status-success px-2 py-1 rounded text-xs">
            SUCCESS
          </span>
        );
      case "failed":
        return (
          <span className="status-error px-2 py-1 rounded text-xs">FAILED</span>
        );
      case "running":
        return (
          <span className="status-running px-2 py-1 rounded text-xs">
            RUNNING
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-muted-foreground text-white px-2 py-1 rounded text-xs">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="bg-secondary text-foreground px-2 py-1 rounded text-xs">
            UNKNOWN
          </span>
        );
    }
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(date));
  };

  // Group commands by folder for the filter dropdown
  const commandsByFolder = commands.reduce((acc, command) => {
    const folderName = command.folder?.name || "No folder";
    if (!acc[folderName]) acc[folderName] = [];
    acc[folderName].push(command);
    return acc;
  }, {} as Record<string, CommandWithFolder[]>);

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Execution Log</h2>
        <div className="flex gap-2">
          <Select value={commandFilter} onValueChange={setCommandFilter}>
            <SelectTrigger className="w-48" data-testid="select-command-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Commands</SelectItem>
              {Object.entries(commandsByFolder).map(
                ([folderName, folderCommands]) => (
                  <div key={folderName}>
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                      {folderName}
                    </div>
                    {folderCommands.map((command) => (
                      <SelectItem key={command.id} value={command.id}>
                        {command.name}
                      </SelectItem>
                    ))}
                  </div>
                )
              )}
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger data-testid="select-time-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last Week</SelectItem>
              <SelectItem value="30d">Last Month</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="destructive"
            onClick={() => clearLogsMutation.mutate()}
            disabled={clearLogsMutation.isPending}
            data-testid="button-clear-logs"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Log
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogs.has(log.id);
            const hasOutput = log.output || log.errorOutput;

            return (
              <div
                key={log.id}
                className="bg-secondary border border-border rounded p-3"
                data-testid={`log-entry-${log.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(log.status)}
                    <h3 className="font-medium">{log.command.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {"No folder"}
                    </span>
                  </div>
                  <div
                    className="text-xs text-muted-foreground"
                    data-testid={`text-log-date-${log.id}`}
                  >
                    {log.startedAt ? formatDate(log.startedAt) : "N/A"}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-4">
                  <span>Duration: {formatDuration(log.duration)}</span>
                  <span>Exit Code: {log.exitCode ?? "N/A"}</span>
                  {log.status === "running" && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse-subtle" />
                      <span>Running</span>
                    </div>
                  )}
                </div>

                {hasOutput && (
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleLogExpansion(log.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary text-xs hover:underline"
                        data-testid={`button-toggle-output-${log.id}`}
                      >
                        {isExpanded ? "Hide Output" : "Show Output"}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="bg-background rounded p-3 max-h-40 overflow-y-auto scrollbar-thin">
                        {log.output && (
                          <pre
                            className="text-xs font-mono text-foreground whitespace-pre-wrap mb-2"
                            data-testid={`text-stdout-${log.id}`}
                          >
                            {log.output}
                          </pre>
                        )}
                        {log.errorOutput && (
                          <pre
                            className="text-xs font-mono text-error whitespace-pre-wrap"
                            data-testid={`text-stderr-${log.id}`}
                          >
                            {log.errorOutput}
                          </pre>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {!hasOutput && (
                  <div className="text-xs text-muted-foreground">
                    No output captured
                  </div>
                )}
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <TerminalIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No execution logs</h3>
              <p className="text-sm">
                {logs.length === 0
                  ? "Execute commands to see their logs here"
                  : "No logs match the current filters"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
