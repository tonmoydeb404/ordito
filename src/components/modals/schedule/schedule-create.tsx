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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ScheduleDateTimePicker from "./date-field";
import ScheduleRecurrenceField from "./recurrence-field";

interface CreateScheduleData {
  group: TCommandGroup;
  command: TCommmand;
}

type Props = TModalProps<CreateScheduleData>;

export default function CreateScheduleModal({ isOpen, close, data }: Props) {
  const { addSchedule, loading, clearError } = useScheduleMutations();
  const groupId = data?.group.id;
  const commandId = data?.command.id;

  // Form state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("09:00");
  const [recurrence, setRecurrence] = useState<string>("once");
  const [customInterval, setCustomInterval] = useState<string>("60");
  const [maxExecutions, setMaxExecutions] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      // Initialize default date to tomorrow
      const dt = new Date();
      dt.setDate(dt.getDate() + 1);
      setDate(dt);
      setTime("09:00");
      setRecurrence("once");
      setCustomInterval("60");
      setMaxExecutions("");
      clearError();
    }
  }, [isOpen, clearError]);

  const handleCreate = async () => {
    if (!date) {
      toast.error("Please pick a date");
      return;
    }
    if (!time) {
      toast.error("Please select a time");
      return;
    }
    if (!groupId || !commandId) {
      toast.error("Missing context");
      close();
      return;
    }
    // Compute ISO datetime
    const [h, m] = time.split(":");
    const dt = new Date(date);
    dt.setHours(parseInt(h, 10), parseInt(m, 10));
    if (dt <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }
    const isoTime = dt.toISOString();
    const finalRec =
      recurrence === "custom" ? `custom:${customInterval}` : recurrence;
    let maxExec: number | undefined;
    if (maxExecutions.trim()) {
      const parsed = parseInt(maxExecutions, 10);
      if (isNaN(parsed) || parsed <= 0) {
        toast.error("Max executions must be a positive number");
        return;
      }
      maxExec = parsed;
    }

    try {
      await addSchedule(groupId, commandId, {
        scheduled_time: isoTime,
        recurrence: finalRec,
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule "{data?.command.label}"</DialogTitle>
          <DialogDescription>
            Create a new schedule for the "{data?.command.label}" command in
            group "{data?.group.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <ScheduleDateTimePicker
            date={date!}
            time={time}
            onDateChange={setDate!}
            onTimeChange={setTime}
            disabled={loading}
          />
          <ScheduleRecurrenceField
            recurrence={recurrence}
            customInterval={customInterval}
            onRecurrenceChange={setRecurrence}
            onIntervalChange={setCustomInterval}
            disabled={loading}
          />
          <div className="flex flex-col space-y-2">
            <Label>Max Executions</Label>
            <Input
              type="number"
              placeholder="Optional"
              value={maxExecutions}
              onChange={(e) => setMaxExecutions(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            Create Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
