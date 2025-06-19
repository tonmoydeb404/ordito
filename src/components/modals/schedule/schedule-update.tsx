import { Badge } from "@/components/ui/badge";
import { Button as Btn } from "@/components/ui/button";
import {
  Dialog as D,
  DialogContent as DC,
  DialogDescription as DD,
  DialogFooter as DF,
  DialogHeader as DH,
  DialogTitle as DT,
} from "@/components/ui/dialog";
import { Input as Inp } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScheduleMutations } from "@/contexts/hooks/schedule";
import { TModalProps } from "@/hooks/use-modal";
import { TCronValidationResult, TSchedule } from "@/types/schedule";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { toast as Toast } from "sonner";
import { CronBuilder } from "./cron-builder";

export function ScheduleUpdateModal({
  isOpen,
  close,
  data,
}: TModalProps<TSchedule>) {
  if (!data) return null;

  const { updateSchedule, validateCronExpression, loading } =
    useScheduleMutations();

  // Initialize state with existing schedule data
  const [cronExpression, setCronExpression] = useState(
    data.cron_expression || "0 9 * * *"
  );
  const [maxExecutions, setMaxExecutions] = useState(
    data.max_executions?.toString() || ""
  );
  const [validation, setValidation] = useState<TCronValidationResult | null>(
    null
  );

  // Reset form when modal opens or data changes
  useEffect(() => {
    if (isOpen && data) {
      setCronExpression(data.cron_expression || "0 9 * * *");
      setMaxExecutions(data.max_executions?.toString() || "");
      setValidation(null);
    }
  }, [isOpen, data]);

  // Validate cron expression when it changes
  useEffect(() => {
    const validateCron = async () => {
      if (cronExpression && cronExpression !== "* * * * *") {
        try {
          const result = await validateCronExpression(cronExpression);
          setValidation(result);
        } catch (error) {
          setValidation({
            is_valid: false,
            error_message: "Failed to validate cron expression",
            next_executions: [],
          });
        }
      }
    };
    validateCron();
  }, [cronExpression, validateCronExpression]);

  const handleSave = async () => {
    try {
      if (!cronExpression.trim()) {
        throw new Error("Please provide a cron expression");
      }

      if (!validation?.is_valid) {
        throw new Error(validation?.error_message || "Invalid cron expression");
      }

      const maxExec = maxExecutions.trim() ? +maxExecutions : undefined;

      await updateSchedule(data.id, {
        group_id: data.group_id,
        command_id: data.command_id,
        cron_expression: cronExpression,
        max_executions: maxExec,
      });

      Toast.success("Schedule updated successfully!");
      close();
    } catch (e) {
      Toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <D open={isOpen} onOpenChange={() => !loading && close()}>
      <DC className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DH>
          <DT className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Schedule
          </DT>
          <DD>Update the schedule configuration and timing.</DD>
        </DH>

        <div className="space-y-6">
          {/* Current Schedule Info */}
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground mb-1">
              <strong>Current Schedule:</strong> {data.cron_expression}
            </p>
            <p className="text-xs text-muted-foreground">
              Executions: {data.execution_count}
              {data.max_executions && ` / ${data.max_executions}`}
              {data.last_execution &&
                ` • Last run: ${new Date(
                  data.last_execution
                ).toLocaleString()}`}
            </p>
          </div>

          {/* Cron Builder */}
          <CronBuilder
            value={cronExpression}
            onChange={setCronExpression}
            resetValue="0 9 * * *"
          />

          {/* Validation and Preview Section */}
          {validation && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Schedule Preview</h4>
                {validation.is_valid ? (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="destructive">Invalid</Badge>
                )}
              </div>

              {validation.is_valid && validation.next_executions.length > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Next 5 executions:
                  </p>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    {validation.next_executions.slice(0, 5).map((time, i) => (
                      <li key={i}>{new Date(time).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation && !validation.is_valid && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {validation.error_message}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Max Executions */}
          <div className="space-y-2">
            <Label htmlFor="max-executions">Max Executions (Optional)</Label>
            <Inp
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

        <DF className="gap-2">
          <Btn variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Btn>
          <Btn onClick={handleSave} disabled={loading || !validation?.is_valid}>
            {loading ? "Saving..." : "Save Changes"}
          </Btn>
        </DF>
      </DC>
    </D>
  );
}
