import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { CommandResponse, LogResponse } from "@/store/types";
import { ClockIcon } from "lucide-react";
import { formatDuration, formatTime, variants } from "./common";
import { LogsEmptyState } from "./logs-empty-state";

interface LogsListProps {
  logs: LogResponse[];
  commands: CommandResponse[];
  selectedGroup: boolean;
  onSelectLog: (log: LogResponse) => void;
}

export function LogsList({
  logs,
  commands,
  selectedGroup,
  onSelectLog,
}: LogsListProps) {
  const commandMap = new Map(commands.map((cmd) => [cmd.id, cmd]));

  const getStatusBadge = (status: LogResponse["status"]) => {
    return (
      <Badge variant={variants[status]} appearance={"light"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-2 py-4 px-4">
      {logs.map((log) => {
        const command = commandMap.get(log.command_id);

        return (
          <Card
            key={log.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors p-0 rounded-md"
            onClick={() => onSelectLog(log)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="">
                  <h4 className="font-medium truncate mb-2">
                    {command?.title || "Unknown Command"}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {formatTime(log.started_at)}
                    </span>
                    {getStatusBadge(log.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {log.finished_at
                      ? `${formatDuration(log.started_at, log.finished_at)}`
                      : "Running..."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {logs.length === 0 && (
        <LogsEmptyState selectedGroup={selectedGroup} hasLogs={false} />
      )}
    </div>
  );
}
