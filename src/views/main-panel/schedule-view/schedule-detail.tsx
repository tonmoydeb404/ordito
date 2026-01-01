import { CronBuilder } from "@/components/cron-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CommandResponse, ScheduleResponse } from "@/store/types";
import {
  BellIcon,
  BellOffIcon,
  ClockIcon,
  SaveIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

interface ScheduleDetailProps {
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

export function ScheduleDetail({
  schedule,
  commands,
  isCreating,
  onSave,
  onCancel,
}: ScheduleDetailProps) {
  const [formData, setFormData] = useState({
    command_id: schedule?.command_id || "",
    cron_expression: schedule?.cron_expression || "",
    show_notification: schedule?.show_notification || false,
  });

  // Reset form when schedule changes
  useState(() => {
    if (schedule || isCreating) {
      setFormData({
        command_id: schedule?.command_id || "",
        cron_expression: schedule?.cron_expression || "",
        show_notification: schedule?.show_notification || false,
      });
    }
  });

  const handleSave = () => {
    if (!formData.command_id || !formData.cron_expression) {
      return;
    }
    onSave(formData);
  };

  const isEditing = schedule !== null || isCreating;

  if (!isEditing) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select a schedule to view details</p>
          <p className="text-xs mt-1">Or create a new schedule</p>
        </div>
      </div>
    );
  }

  const selectedCommand = commands.find(
    (cmd) => cmd.id === formData.command_id
  );

  return (
    <div className="flex flex-col w-full h-full ">
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

      <ScrollArea className="flex-1 w-full h-0 overflow-auto">
        <div className="p-4 space-y-4 absolute w-full">
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
      </ScrollArea>
    </div>
  );
}
