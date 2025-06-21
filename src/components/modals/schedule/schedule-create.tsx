import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScheduleMutations } from "@/contexts/hooks/schedule";
import { TModalProps } from "@/hooks/use-modal";
import { TCommandGroup, TCommmand } from "@/types/command";
import { Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CronBuilder } from "./cron-builder";

interface CreateScheduleData {
  group: TCommandGroup;
  command?: TCommmand;
}

type CreateProps = TModalProps<CreateScheduleData>;

export function CreateScheduleModal({ isOpen, close, data }: CreateProps) {
  const { addSchedule, loading } = useScheduleMutations();
  const groupId = data?.group.id;
  const commandId = data?.command?.id ?? null;

  // Cron expression state
  const [cronExpression, setCronExpression] = useState("0 0 9 * * *");
  const [maxExecutions, setMaxExecutions] = useState("");

  const handleCreate = async () => {
    if (!cronExpression.trim()) {
      toast.error("Please provide a cron expression");
      return;
    }

    if (!groupId) {
      toast.error("Missing group context");
      close();
      return;
    }

    const maxExec = maxExecutions.trim()
      ? parseInt(maxExecutions, 10)
      : undefined;

    try {
      await addSchedule(groupId, commandId, {
        cron_expression: cronExpression,
        max_executions: maxExec,
      });
      toast.success("Schedule created successfully!");
      close();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create schedule"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && close()}>
      <DialogContent className="sm:max-w-4xl !w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {data && (
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Schedule{" "}
              {data.command
                ? `"${data.command.label}"`
                : `group "${data.group.title}"`}
            </DialogTitle>
          )}
          {data && (
            <DialogDescription>
              Create a schedule for{" "}
              {data.command
                ? `command "${data.command.label}"`
                : `group "${data.group.title}"`}
              . Use the builder below to configure when this should run.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Cron Builder */}
          <CronBuilder
            value={cronExpression}
            onChange={setCronExpression}
            resetValue="0 0 9 * * *"
          />

          {/* Max Executions */}
          <div className="space-y-2">
            <Label htmlFor="max-executions">Max Executions (Optional)</Label>
            <Input
              id="max-executions"
              type="number"
              placeholder="Leave empty for unlimited"
              value={maxExecutions}
              onChange={(e) => setMaxExecutions(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to run indefinitely, or specify a number to limit
              executions.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
