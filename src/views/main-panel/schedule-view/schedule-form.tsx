import { CronBuilder } from "@/components/cron-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CommandResponse, ScheduleResponse } from "@/store/types";
import { BellIcon, BellOffIcon, SaveIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ScheduleFormProps {
  schedule: ScheduleResponse | null;
  commands: CommandResponse[];
  isCreating: boolean;
  onSave: (scheduleData: {
    command_id: string;
    cron_expression: string;
    show_notification: boolean;
  }) => void;
  onCancel: () => void;
}

export function ScheduleForm({
  schedule,
  commands,
  isCreating,
  onSave,
  onCancel,
}: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    command_id: schedule?.command_id || "",
    cron_expression: schedule?.cron_expression || "",
    show_notification: schedule?.show_notification || false,
  });

  // Reset form when schedule changes
  useEffect(() => {
    if (schedule || isCreating) {
      setFormData({
        command_id: schedule?.command_id || "",
        cron_expression: schedule?.cron_expression || "",
        show_notification: schedule?.show_notification || false,
      });
    }
  }, [schedule, isCreating]);

  const handleSave = () => {
    if (!formData.command_id || !formData.cron_expression) {
      return;
    }
    onSave(formData);
  };

  const selectedCommand = commands.find(
    (cmd) => cmd.id === formData.command_id
  );

  return (
    <div className="flex flex-col w-full h-full max-h-full">
      <div className="shrink-0 flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold">
          {isCreating ? "Create Schedule" : "Edit Schedule"}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <XIcon className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <SaveIcon className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-4">
          {/* Command Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Command</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="command">Select Command</Label>
                <Select
                  value={formData.command_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, command_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a command" />
                  </SelectTrigger>
                  <SelectContent>
                    {commands.map((command) => (
                      <SelectItem key={command.id} value={command.id}>
                        {command.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCommand && (
                  <div className="mt-2 p-3 bg-muted rounded text-sm">
                    <p className="font-medium">{selectedCommand.title}</p>
                    <pre className="mt-1 text-xs font-mono overflow-x-auto">
                      {selectedCommand.value}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cron Expression */}
          <CronBuilder
            defaultValue={formData.cron_expression}
            onChange={(cronExpression: string) => {
              setFormData((prev) => ({
                ...prev,
                cron_expression: cronExpression,
              }));
            }}
          />

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notification"
                  checked={formData.show_notification}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      show_notification: checked as boolean,
                    }))
                  }
                />
                <Label
                  htmlFor="notification"
                  className="flex items-center gap-2"
                >
                  {formData.show_notification ? (
                    <BellIcon className="w-4 h-4" />
                  ) : (
                    <BellOffIcon className="w-4 h-4" />
                  )}
                  Show notification when command runs
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Info (for existing schedules) */}
          {schedule && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Schedule Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Created:</span>
                    <div className="text-muted-foreground">
                      {new Date(schedule.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <div className="text-muted-foreground">
                      {new Date(schedule.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
