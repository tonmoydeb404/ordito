import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useScheduleMutations } from "@/contexts/hooks/schedule";
import { TModalProps } from "@/hooks/use-modal";
import { TScheduleInfo } from "@/types/schedule";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ScheduleDeleteModal({
  isOpen,
  close,
  data,
}: TModalProps<TScheduleInfo>) {
  if (!data) return null;

  const { deleteSchedule, loading } = useScheduleMutations();

  // Helper function to get human-readable cron description
  const getCronDescription = (cronExpression: string): string => {
    const descriptions: Record<string, string> = {
      "* * * * *": "Every minute",
      "0 * * * *": "Every hour",
      "0 9 * * *": "Daily at 9:00 AM",
      "0 9 * * 1-5": "Weekdays at 9:00 AM",
      "0 9 * * 1": "Every Monday at 9:00 AM",
      "*/15 * * * *": "Every 15 minutes",
      "*/30 * * * *": "Every 30 minutes",
      "0 */2 * * *": "Every 2 hours",
      "0 0 * * *": "Daily at midnight",
      "0 12 * * *": "Daily at noon",
    };

    return descriptions[cronExpression] || cronExpression;
  };

  const handleDelete = async () => {
    try {
      await deleteSchedule(data.id);
      toast.success("Schedule deleted successfully");
      close();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Schedule
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The schedule will be permanently
            removed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Schedule Details */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Schedule Type:</span>
              <Badge variant={data.is_active ? "default" : "secondary"}>
                {data.is_active ? "Active" : "Paused"}
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Cron Expression:</span>
              <code className="text-xs bg-background px-2 py-1 rounded border">
                {data.cron_expression}
              </code>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Schedule:</span>
              <span className="text-sm text-muted-foreground">
                {getCronDescription(data.cron_expression)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Executions:
                </span>
                <p className="text-sm">
                  {data.execution_count}
                  {data.max_executions && ` / ${data.max_executions}`}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Next Run:
                </span>
                <p className="text-sm">
                  {new Date(data.next_execution).toLocaleDateString()}
                </p>
              </div>
            </div>

            {data.last_execution && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Last Run:
                </span>
                <p className="text-sm">
                  {new Date(data.last_execution).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <Trash2 className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Warning</p>
              <p className="text-destructive/80">
                This schedule will be permanently deleted and cannot be
                recovered.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
