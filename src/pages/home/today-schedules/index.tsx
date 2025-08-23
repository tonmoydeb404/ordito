import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetCommandsQuery } from "@/store/api/commands-api";
import {
  useGetNextScheduledExecutionsQuery,
  useGetSchedulesQuery,
} from "@/store/api/schedules-api";
import {
  LucideCalendar,
  LucideCalendarFold,
  LucideClock,
  LucidePlay,
  LucideTerminalSquare,
} from "lucide-react";
import { useMemo } from "react";

const TodaySchedulesSection = () => {
  const { data: schedules = [] } = useGetSchedulesQuery();
  const { data: commands = [] } = useGetCommandsQuery();
  const { data: nextExecutions = [] } = useGetNextScheduledExecutionsQuery(50);

  const todaySchedules = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    return nextExecutions
      .filter((execution) => {
        const executionDate = new Date(execution.next_execution);
        return executionDate >= todayStart && executionDate < todayEnd;
      })
      .map((execution) => {
        const schedule = schedules.find((s) => s.id === execution.id);
        const command = schedule?.command_id
          ? commands.find((c) => c.id === schedule.command_id)
          : null;

        return {
          ...execution,
          schedule,
          command,
          executionTime: new Date(execution.next_execution),
        };
      })
      .sort((a, b) => a.executionTime.getTime() - b.executionTime.getTime());
  }, [nextExecutions, schedules, commands]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (todaySchedules.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideCalendar className="size-5" />
            Today's Schedules
          </CardTitle>
          <CardDescription>Scheduled tasks for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <LucideCalendarFold className="size-12 mb-2 opacity-50" />
            <p>No schedules for today</p>
            <p className="text-sm">All clear for now!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LucideCalendar className="size-5" />
          Today's Schedules
          <Badge variant="secondary" className="ml-auto">
            {todaySchedules.length} scheduled
          </Badge>
        </CardTitle>
        <CardDescription>Scheduled tasks for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todaySchedules.map((item) => (
            <div
              key={`${item.id}-${item.next_execution}`}
              className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <LucideClock className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {item.schedule?.name || "Unnamed Schedule"}
                    </h4>
                    {item.command && (
                      <Badge variant="outline" className="text-xs">
                        <LucideTerminalSquare className="size-3 mr-1" />
                        {item.command.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.schedule?.description ||
                      (item.command
                        ? `Execute: ${item.command.command}`
                        : "No description")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-mono text-muted-foreground">
                  {formatTime(item.executionTime)}
                </span>
                {item.schedule?.is_enabled && (
                  <Button size="sm" variant="ghost" className="size-8 p-0">
                    <LucidePlay className="size-3" />
                    <span className="sr-only">Execute now</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaySchedulesSection;
