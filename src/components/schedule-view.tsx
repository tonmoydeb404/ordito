import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type {
  CommandWithFolder,
  InsertSchedule,
  ScheduleWithCommand,
} from "@/types/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface ScheduleFormData {
  name: string;
  commandId: string;
  frequency: "once" | "daily" | "weekly" | "monthly" | "custom";
  date: string;
  time: string;
  cronExpression: string;
  sendNotification: boolean;
}

export default function ScheduleView() {
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: "",
    commandId: "",
    frequency: "once",
    date: "",
    time: "",
    cronExpression: "",
    sendNotification: false,
  });
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [cronValidation, setCronValidation] = useState<{
    valid: boolean;
    nextRun: string | null;
  }>({
    valid: true,
    nextRun: null,
  });

  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery<ScheduleWithCommand[]>({
    queryKey: ["/api/schedules"],
  });

  const { data: commands = [] } = useQuery<CommandWithFolder[]>({
    queryKey: ["/api/commands"],
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: InsertSchedule) => {
      const response = await apiRequest("POST", "/api/schedules", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      resetForm();
      toast("Schedule created successfully");
    },
    onError: () => {
      toast.error("Failed to create schedule");
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InsertSchedule>;
    }) => {
      const response = await apiRequest("PUT", `/api/schedules/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setEditingSchedule(null);
      setIsEditDialogOpen(false);
      resetForm();
      toast("Schedule updated successfully");
    },
    onError: () => {
      toast.error("Failed to update schedule");
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast("Schedule deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete schedule");
    },
  });

  const validateCronMutation = useMutation({
    mutationFn: async (expression: string) => {
      const response = await apiRequest(
        "POST",
        "/api/schedules/validate-cron",
        { expression }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setCronValidation(data);
    },
    onError: () => {
      setCronValidation({ valid: false, nextRun: null });
    },
  });

  const generateCronExpression = (
    frequency: string,
    date: string,
    time: string
  ): string => {
    if (!time) return "";

    const [hour, minute] = time.split(":");

    switch (frequency) {
      case "daily":
        return `${minute} ${hour} * * *`;
      case "weekly":
        const dayOfWeek = date ? new Date(date).getDay() : 0;
        return `${minute} ${hour} * * ${dayOfWeek}`;
      case "monthly":
        const dayOfMonth = date ? new Date(date).getDate() : 1;
        return `${minute} ${hour} ${dayOfMonth} * *`;
      case "once":
        if (date) {
          const scheduleDate = new Date(date + "T" + time);
          return `${minute} ${hour} ${scheduleDate.getDate()} ${
            scheduleDate.getMonth() + 1
          } *`;
        }
        return "";
      default:
        return "";
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      commandId: "",
      frequency: "once",
      date: "",
      time: "",
      cronExpression: "",
      sendNotification: false,
    });
    setCronValidation({ valid: true, nextRun: null });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.commandId) {
      toast.error("Please fill in all required fields");
      return;
    }

    let cronExpression = formData.cronExpression;

    if (formData.frequency !== "custom") {
      cronExpression = generateCronExpression(
        formData.frequency,
        formData.date,
        formData.time
      );
    }

    if (!cronExpression) {
      toast.error("Please provide a valid schedule");
      return;
    }

    const scheduleData: InsertSchedule = {
      name: formData.name,
      commandId: formData.commandId,
      cronExpression,
      isActive: true,
      sendNotification: formData.sendNotification,
      nextRun: null,
      lastRun: null,
    };

    if (editingSchedule) {
      updateScheduleMutation.mutate({
        id: editingSchedule,
        data: scheduleData,
      });
    } else {
      createScheduleMutation.mutate(scheduleData);
    }
  };

  const handleEdit = (schedule: ScheduleWithCommand) => {
    setEditingSchedule(schedule.id);
    setFormData({
      name: schedule.name,
      commandId: schedule.commandId,
      frequency: "custom", // Default to custom since we have the cron expression
      date: "",
      time: "",
      cronExpression: schedule.cronExpression,
      sendNotification: schedule.sendNotification || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      deleteScheduleMutation.mutate(id);
    }
  };

  const formatNextRun = (nextRun: Date | null) => {
    if (!nextRun) return "Not scheduled";

    const now = new Date();
    const runTime = new Date(nextRun);
    const diffMs = runTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${runTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${runTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return runTime.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getFrequencyLabel = (cronExpression: string) => {
    // Simple heuristic to determine frequency from cron expression
    const parts = cronExpression.split(" ");
    if (parts.length !== 5) return "Custom";

    const [minute, hour, day, month, dayOfWeek] = parts;

    if (day === "*" && month === "*" && dayOfWeek === "*") {
      return "Daily";
    } else if (day === "*" && month === "*" && dayOfWeek !== "*") {
      return "Weekly";
    } else if (day !== "*" && month === "*") {
      return "Monthly";
    } else {
      return "Custom";
    }
  };

  // Validate cron expression when it changes
  const handleCronExpressionChange = (expression: string) => {
    setFormData({ ...formData, cronExpression: expression });
    if (expression && formData.frequency === "custom") {
      validateCronMutation.mutate(expression);
    }
  };

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Command Schedule</h2>
        <Button
          className="bg-primary hover:bg-primary/80 text-primary-foreground"
          onClick={() => {
            resetForm();
            setEditingSchedule(null);
            setIsEditDialogOpen(true);
          }}
          data-testid="button-new-schedule"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Schedule
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6 h-full">
        {/* Scheduled Commands */}
        <div>
          <h3 className="text-sm font-medium mb-3">Scheduled Commands</h3>
          <div className="space-y-3 overflow-y-auto scrollbar-thin">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-secondary border border-border rounded p-3"
                data-testid={`schedule-item-${schedule.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{schedule.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {schedule.command.name}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="p-1 h-auto w-auto hover:bg-accent"
                      onClick={() => handleEdit(schedule)}
                      data-testid={`button-edit-schedule-${schedule.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="p-1 h-auto w-auto hover:bg-accent text-error"
                      onClick={() => handleDelete(schedule.id)}
                      data-testid={`button-delete-schedule-${schedule.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span
                      data-testid={`text-next-run-${schedule.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      Next run: {formatNextRun(schedule.nextRun)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Frequency: {getFrequencyLabel(schedule.cronExpression)}
                    </span>
                  </div>
                  {schedule.sendNotification && (
                    <div className="text-primary text-xs">
                      📧 Notifications enabled
                    </div>
                  )}
                </div>
              </div>
            ))}

            {schedules.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No scheduled commands
                </h3>
                <p className="text-sm">
                  Create a schedule to automate command execution
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Form */}
        <div>
          <h3 className="text-sm font-medium mb-3">
            {editingSchedule ? "Edit Schedule" : "Create Schedule"}
          </h3>
          <div className="bg-secondary border border-border rounded p-4 space-y-4">
            <div>
              <Label htmlFor="schedule-command">Select Command</Label>
              <Select
                value={formData.commandId}
                onValueChange={(value) =>
                  setFormData({ ...formData, commandId: value })
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-testid="select-schedule-command"
                >
                  <SelectValue placeholder="Choose a command" />
                </SelectTrigger>
                <SelectContent>
                  {commands.map((command) => (
                    <SelectItem key={command.id} value={command.id}>
                      {command.name}{" "}
                      {command.folder && `(${command.folder.name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="schedule-name">Schedule Name</Label>
              <Input
                id="schedule-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Daily Status Check"
                className="mt-1"
                data-testid="input-schedule-name"
              />
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger className="mt-1" data-testid="select-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom Cron</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.frequency === "custom" ? (
              <div>
                <Label htmlFor="cron-expression">Cron Expression</Label>
                <Input
                  id="cron-expression"
                  value={formData.cronExpression}
                  onChange={(e) => handleCronExpressionChange(e.target.value)}
                  placeholder="0 9 * * 1 (Every Monday at 9 AM)"
                  className={`mt-1 ${
                    !cronValidation.valid ? "border-error" : ""
                  }`}
                  data-testid="input-cron-expression"
                />
                {formData.cronExpression && (
                  <div className="mt-1 text-xs">
                    {cronValidation.valid ? (
                      <span className="text-success">
                        ✓ Valid - Next run:{" "}
                        {cronValidation.nextRun
                          ? new Date(cronValidation.nextRun).toLocaleString()
                          : "N/A"}
                      </span>
                    ) : (
                      <span className="text-error">
                        ✗ Invalid cron expression
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="mt-1"
                    data-testid="input-schedule-date"
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-time">Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="mt-1"
                    data-testid="input-schedule-time"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.sendNotification}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, sendNotification: !!checked })
                }
                data-testid="checkbox-notification"
              />
              <span className="text-xs">Send notification on completion</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
                onClick={handleSubmit}
                disabled={
                  createScheduleMutation.isPending ||
                  updateScheduleMutation.isPending
                }
                data-testid="button-save-schedule"
              >
                {editingSchedule ? "Update Schedule" : "Create Schedule"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (editingSchedule) {
                    setIsEditDialogOpen(false);
                    setEditingSchedule(null);
                  }
                  resetForm();
                }}
                data-testid="button-reset-schedule"
              >
                {editingSchedule ? "Cancel" : "Reset"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog (for mobile/smaller screens) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Form fields would be repeated here for the dialog */}
            <p className="text-sm text-muted-foreground">
              Use the form on the right to edit the schedule.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
