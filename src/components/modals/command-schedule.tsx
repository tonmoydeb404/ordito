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
import { TCommandGroup, TCommmand } from "@/types/command";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = TModalProps<{ group: TCommandGroup; command: TCommmand }>;

function CreateScheduleModal(props: Props) {
  const { close, isOpen, data } = props;

  const command = data?.command ?? null;
  const group = data?.group ?? null;
  const groupId = group?.id ?? null;
  const commandId = command?.id ?? null;

  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [recurrence, setRecurrence] = useState("once");
  const [customInterval, setCustomInterval] = useState("60");
  const [maxExecutions, setMaxExecutions] = useState("");

  // alias addSchedule as createSchedule to match modal logic
  const {
    addSchedule: createSchedule,
    loading,
    clearError,
  } = useScheduleMutations();

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split("T")[0]);
      setScheduledTime("09:00");
      setRecurrence("once");
      setCustomInterval("60");
      setMaxExecutions("");
      clearError();
    }
  }, [isOpen, clearError]);

  const handleCreate = async () => {
    if (!scheduledDate) {
      toast.error("Please select a date");
      return;
    }
    if (!scheduledTime) {
      toast.error("Please select a time");
      return;
    }
    if (!groupId || !commandId) {
      toast.error("Command not found");
      close();
      return;
    }

    if (recurrence === "custom") {
      const interval = parseInt(customInterval);
      if (isNaN(interval) || interval <= 0) {
        toast.error("Custom interval must be a positive number");
        return;
      }
    }

    let maxExec: number | undefined;
    if (maxExecutions.trim()) {
      const parsed = parseInt(maxExecutions);
      if (isNaN(parsed) || parsed <= 0) {
        toast.error("Max executions must be a positive number");
        return;
      }
      maxExec = parsed;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }

    const scheduledTimeISO = scheduledDateTime.toISOString();
    const finalRecurrence =
      recurrence === "custom" ? `custom:${customInterval}` : recurrence;

    try {
      await createSchedule(groupId, commandId, {
        scheduled_time: scheduledTimeISO,
        recurrence: finalRecurrence,
        max_executions: maxExec,
      });

      toast.success("Schedule created successfully!");
      close();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create schedule";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!loading) close();
  };

  const getRecurrenceOptions = () => [
    { value: "once", label: "Once" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "custom", label: "Custom interval" },
  ];

  const formatNextRuns = () => {
    if (!scheduledDate || !scheduledTime) return [] as string[];
    const baseDate = new Date(`${scheduledDate}T${scheduledTime}`);
    const runs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const nextDate = new Date(baseDate);
      switch (recurrence) {
        case "daily":
          nextDate.setDate(baseDate.getDate() + i);
          break;
        case "weekly":
          nextDate.setDate(baseDate.getDate() + i * 7);
          break;
        case "monthly":
          nextDate.setMonth(baseDate.getMonth() + i);
          break;
        case "custom":
          const interval = parseInt(customInterval) || 60;
          nextDate.setMinutes(baseDate.getMinutes() + i * interval);
          break;
        default:
          if (i > 0) return runs;
      }
      runs.push(nextDate.toLocaleString());
    }
    return runs;
  };

  if (!command || !group) return null;
  const isFormValid = Boolean(
    scheduledDate &&
      scheduledTime &&
      (recurrence !== "custom" ||
        (customInterval && parseInt(customInterval) > 0))
  );
  const nextRuns = formatNextRuns();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Command
          </DialogTitle>
          <DialogDescription>
            Schedule "{command.label}" from group "{group.title}" to run
            automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Date</Label>
              <Input
                id="scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                disabled={loading}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled-time">Time</Label>
              <Input
                id="scheduled-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select
              value={recurrence}
              onValueChange={setRecurrence}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recurrence pattern" />
              </SelectTrigger>
              <SelectContent>
                {getRecurrenceOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {recurrence === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-interval">Interval (minutes)</Label>
              <Input
                id="custom-interval"
                type="number"
                placeholder="e.g., 60 for every hour"
                value={customInterval}
                onChange={(e) => setCustomInterval(e.target.value)}
                disabled={loading}
                min="1"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="max-executions">Max Executions (optional)</Label>
            <Input
              id="max-executions"
              type="number"
              placeholder="e.g., 30 (leave empty for unlimited)"
              value={maxExecutions}
              onChange={(e) => setMaxExecutions(e.target.value)}
              disabled={loading}
              min="1"
            />
          </div>

          {nextRuns.length > 0 && (
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Next {recurrence === "once" ? "run" : "runs"}:
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {nextRuns.map((run, i) => (
                  <div key={i}>{run}</div>
                ))}
                {recurrence !== "once" && nextRuns.length > 1 && (
                  <div className="italic">...</div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || !isFormValid}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Creating..." : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateScheduleModal;
