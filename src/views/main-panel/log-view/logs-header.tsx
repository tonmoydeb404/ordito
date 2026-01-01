import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CommandResponse, GroupResponse } from "@/store/types";
import { RefreshCwIcon } from "lucide-react";

interface LogsHeaderProps {
  commands: CommandResponse[];
  commandFilter: string;
  statusFilter: string;
  onCommandFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onRefresh: () => void;
  group: GroupResponse;
  isRefreshing: boolean;
}

export function LogsHeader(props: LogsHeaderProps) {
  const {
    commands,
    commandFilter,
    statusFilter,
    onCommandFilterChange,
    onStatusFilterChange,
    onRefresh,
    group,
    isRefreshing,
  } = props;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold">Execution Logs</h2>
      </div>

      <div className="flex items-center gap-2">
        <Select value={commandFilter} onValueChange={onCommandFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by command" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Commands</SelectItem>
            {commands.map((command) => (
              <SelectItem key={command.id} value={command.id}>
                {command.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="timeout">Timeout</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCwIcon
            className={cn("w-4 h-4", isRefreshing && "animate-spin")}
          />
        </Button>
      </div>
    </div>
  );
}
