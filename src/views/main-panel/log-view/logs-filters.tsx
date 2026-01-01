import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useCleanupOldLogsMutation } from "@/store";
import type { CommandResponse } from "@/store/types";
import { Trash2 } from "lucide-react";

interface LogsFiltersProps {
  commands: CommandResponse[];
  commandFilter: string;
  statusFilter: string;
  onCommandFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export function LogsFilters({
  commands,
  commandFilter,
  statusFilter,
  onCommandFilterChange,
  onStatusFilterChange,
}: LogsFiltersProps) {
  const [cleanupOldLogs, { isLoading: isCleaningUp }] =
    useCleanupOldLogsMutation();

  const handleClearLogs = async () => {
    if (
      confirm("Are you sure you want to clear old logs (older than 30 days)?")
    ) {
      try {
        await cleanupOldLogs({ days: 30 }).unwrap();
        toast.success("Old logs cleared successfully");
      } catch (error) {
        toast.error("Failed to clear logs");
      }
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-medium">Execution Log</h2>
      <div className="flex gap-2">
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
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="timeout">Timeout</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="destructive"
          onClick={handleClearLogs}
          disabled={isCleaningUp}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear Old Logs
        </Button>
      </div>
    </div>
  );
}
