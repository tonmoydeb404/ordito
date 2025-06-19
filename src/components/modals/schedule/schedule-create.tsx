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
import { useScheduleMutations } from "@/contexts/hooks/schedule";
import { TModalProps } from "@/hooks/use-modal";
import { TCommandGroup, TCommmand } from "@/types/command";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ScheduleDateTimePicker from "./date-field";
import ScheduleRecurrenceField from "./recurrence-field";

interface CreateScheduleData {
  group: TCommandGroup;
  command?: TCommmand;
}

type CreateProps = TModalProps<CreateScheduleData>;

export function CreateScheduleModal({ isOpen, close, data }: CreateProps) {
  const { addSchedule, loading, clearError } = useScheduleMutations();
  const groupId = data?.group.id;
  const commandId = data?.command?.id ?? null;
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [recurrence, setRecurrence] = useState("once");
  const [customInterval, setCustomInterval] = useState("60");
  const [maxExecutions, setMaxExecutions] = useState("");

  useEffect(() => {
    if (isOpen) {
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
    if (!groupId) {
      toast.error("Missing group context");
      close();
      return;
    }
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
    const maxExec = maxExecutions.trim()
      ? parseInt(maxExecutions, 10)
      : undefined;
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

  if (!data?.group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && close()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Schedule{" "}
            {data.command
              ? `"${data.command.label}"`
              : `group "${data.group.title}"`}
          </DialogTitle>
          <DialogDescription>
            Create schedule for{" "}
            {data.command
              ? `command "${data.command.label}"`
              : `group "${data.group.title}"`}
            .
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
          <label className="flex flex-col space-y-1">
            <span>Max Executions</span>
            <Input
              type="number"
              placeholder="Optional"
              value={maxExecutions}
              onChange={(e) => setMaxExecutions(e.target.value)}
              disabled={loading}
            />
          </label>
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
