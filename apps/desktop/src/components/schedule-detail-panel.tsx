import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, ChevronRight, LucideX, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CronEditor } from "@/components/cron-editor";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@packages/ui/components/button";
import { FieldGroup } from "@packages/ui/components/field";
import { Separator } from "@packages/ui/components/separator";
import { Switch } from "@packages/ui/components/switch";
import {
  RhfControlled,
  RhfDateTimePicker,
  RhfInput,
  RhfSelect,
} from "@packages/ui/fields/rhf";

import { useOrdito } from "@/context/ordito-context";
import { describeCron } from "@/lib/cron";
import { formatNextRun } from "@/lib/format";
import type { BackendScheduleInput, ScheduleMode } from "@/types";

const scheduleSchema = z
  .object({
    commandId: z.string().min(1, "Select a command to schedule"),
    mode: z.enum(["recurring", "once"]),
    cronExpr: z.string(),
    runAt: z.string(),
    label: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "recurring") {
      if (!data.cronExpr.trim()) {
        ctx.addIssue({
          path: ["cronExpr"],
          code: "custom",
          message: "A cron expression is required for recurring schedules",
        });
      } else if (!describeCron(data.cronExpr.trim()).ok) {
        ctx.addIssue({
          path: ["cronExpr"],
          code: "custom",
          message: "This is not a valid cron expression",
        });
      }
    }
    if (data.mode === "once" && !data.runAt) {
      ctx.addIssue({
        path: ["runAt"],
        code: "custom",
        message: "Pick a date and time for the one-time schedule",
      });
    }
  });

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

const CREATE_DEFAULTS: ScheduleFormValues = {
  commandId: "",
  mode: "recurring",
  cronExpr: "",
  runAt: "",
  label: "",
};

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <dt className="text-[0.68rem] font-[760] text-faint">{label}</dt>
      <dd className="text-[0.8rem] text-ink">{children}</dd>
    </div>
  );
}

export function ScheduleDetailPanel() {
  const {
    commands,
    selectedSchedule,
    selectSchedule,
    isCreatingSchedule,
    cancelCreateSchedule,
    toggleSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useOrdito();

  const isEditing = isCreatingSchedule || selectedSchedule !== null;
  const editingSchedule = isCreatingSchedule ? null : selectedSchedule;

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: CREATE_DEFAULTS,
    mode: "onTouched",
  });
  const { control, reset, handleSubmit, watch, formState } = form;
  const mode = watch("mode");

  useEffect(() => {
    if (!isEditing) return;

    if (editingSchedule) {
      reset({
        commandId: editingSchedule.commandId,
        mode: editingSchedule.mode,
        cronExpr: editingSchedule.cronExpr ?? "",
        runAt: editingSchedule.runAt ?? "",
        label: editingSchedule.label,
      });
    } else {
      reset({
        ...CREATE_DEFAULTS,
        commandId: commands[0]?.id ?? "",
      });
    }
  }, [isEditing, editingSchedule, commands, reset]);

  if (!isEditing) {
    return (
      <aside className="flex h-full w-full flex-col bg-panel">
        <EmptyState
          className="w-full h-full border-0"
          icon={<CalendarClock size={24} />}
          title="No schedule selected"
          description="Select a schedule from the list to see its details."
        />
      </aside>
    );
  }

  const commandName = editingSchedule
    ? (commands.find((c) => c.id === editingSchedule.commandId)?.name ??
      "Unknown")
    : null;

  async function onSubmit(data: ScheduleFormValues) {
    try {
      const input: BackendScheduleInput = {
        command_id: data.commandId,
        mode: data.mode as ScheduleMode,
        label: data.label.trim() || "Custom schedule",
      };

      if (data.mode === "recurring") {
        input.cron_expr = data.cronExpr.trim();
      } else {
        input.run_at = new Date(data.runAt).toISOString();
      }

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, input);
      } else {
        await createSchedule(input);
      }
    } catch (err) {
      console.error("Failed to save schedule:", err);
      toast.error("Failed to save schedule.");
    }
  }

  function handleDelete() {
    if (!editingSchedule) return;
    deleteSchedule(editingSchedule.id);
  }

  const heading = editingSchedule ? "Edit schedule" : "New schedule";

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-panel">
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h2 className="truncate text-[0.88rem] font-[720] text-ink">
            {heading}
          </h2>
          {editingSchedule && (
            <span className="text-[0.68rem] text-faint">{commandName}</span>
          )}
        </div>

        {editingSchedule && (
          <div className="flex items-center gap-2">
            <Switch
              checked={editingSchedule.enabled}
              onCheckedChange={() => toggleSchedule(editingSchedule.id)}
              aria-label="Toggle schedule"
            />
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => selectSchedule(null)}
            >
              <LucideX size={14} />
            </Button>
          </div>
        )}
        {!editingSchedule && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={cancelCreateSchedule}
          >
            <LucideX size={14} />
          </Button>
        )}
      </div>

      <Separator />

      <form
        id="schedule-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <FieldGroup className="min-h-0 flex-1 gap-4 overflow-auto scrollbar-thin p-4">
          <RhfSelect
            control={control}
            name="commandId"
            label="Command"
            placeholder={
              commands.length === 0 ? "No commands available" : undefined
            }
            renderValue={(value) => commands.find((c) => c.id === value)?.name}
            options={commands.map((c) => ({ label: c.name, value: c.id }))}
          />

          <RhfSelect
            control={control}
            name="mode"
            label="Repeat"
            options={[
              { label: "Recurring (cron)", value: "recurring" },
              { label: "One-time", value: "once" },
            ]}
          />

          {mode === "recurring" ? (
            <RhfControlled
              control={control}
              name="cronExpr"
              label="Cron expression"
              render={(field) => (
                <CronEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          ) : (
            <RhfDateTimePicker control={control} name="runAt" label="Run at" />
          )}

          <RhfInput
            control={control}
            name="label"
            id="sched-label"
            label="Label"
            placeholder="Custom schedule"
          />

          {editingSchedule && (
            <DetailField label="Next run">
              {editingSchedule.enabled
                ? formatNextRun(editingSchedule.nextRunAt)
                : "Paused"}
            </DetailField>
          )}
        </FieldGroup>

        <Separator />

        <div className="flex items-center gap-2 px-4 py-3">
          {editingSchedule ? (
            <Button
              variant="outline"
              size="icon"
              aria-label="Delete schedule"
              onClick={handleDelete}
            >
              <Trash2 size={14} />
            </Button>
          ) : (
            <Button variant="secondary" onClick={cancelCreateSchedule}>
              Cancel
            </Button>
          )}
          <Button
            className="flex-1"
            type="submit"
            disabled={formState.isSubmitting}
          >
            {editingSchedule ? "Save changes" : "Create schedule"}
            <ChevronRight size={15} />
          </Button>
        </div>
      </form>
    </aside>
  );
}
