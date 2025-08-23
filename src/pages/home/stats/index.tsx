import {
  IconActivity,
  IconClock,
  IconFolders,
  IconTerminal2,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetCommandGroupsQuery,
  useGetCommandsQuery,
} from "@/store/api/commands-api";
import {
  useGetExecutionHistoryQuery,
  useGetRunningExecutionsQuery,
} from "@/store/api/executions-api";
import {
  useGetNextScheduledExecutionsQuery,
  useGetSchedulesQuery,
} from "@/store/api/schedules-api";
import { useMemo } from "react";

type Stat = {
  title: string;
  value: string | number;
  description: string;
  badge: {
    icon: React.ReactNode;
    text: string;
    variant?: "outline" | "default";
  };
  footer: {
    text: string;
    icon: React.ReactNode;
    subtext: string;
  };
};

const StatsSection = () => {
  const { data: commands = [] } = useGetCommandsQuery();
  const { data: groups = [] } = useGetCommandGroupsQuery();
  const { data: schedules = [] } = useGetSchedulesQuery();
  const { data: nextExecutions = [] } = useGetNextScheduledExecutionsQuery(10);
  const { data: executionHistory = [] } = useGetExecutionHistoryQuery(50);
  const { data: runningExecutions = [] } = useGetRunningExecutionsQuery();

  const stats = useMemo<Stat[]>(() => {
    const favoriteCommands = commands.filter((cmd) => cmd.is_favorite).length;
    const activeSchedules = schedules.filter(
      (schedule) => schedule.is_enabled
    ).length;
    const todayExecutions = nextExecutions.filter((exec) => {
      const today = new Date().toDateString();
      return new Date(exec.next_execution).toDateString() === today;
    }).length;

    const totalExecutions = commands.reduce(
      (sum, cmd) => sum + cmd.execution_count,
      0
    );
    const avgExecutionsPerCommand =
      commands.length > 0 ? Math.round(totalExecutions / commands.length) : 0;

    const recentSuccessful = executionHistory.filter(
      (exec) => exec.exit_code === 0 && exec.finished_at
    ).length;
    const successRate =
      executionHistory.length > 0
        ? Math.round((recentSuccessful / executionHistory.length) * 100)
        : 0;

    return [
      {
        title: "Commands",
        value: commands.length,
        description: "Total Commands",
        badge: {
          icon: <IconTerminal2 className="size-3" />,
          text: `${favoriteCommands} favorites`,
        },
        footer: {
          text: `${totalExecutions} total executions`,
          icon: <IconActivity className="size-4" />,
          subtext: `Average ${avgExecutionsPerCommand} runs per command`,
        },
      },
      {
        title: "Command Groups",
        value: groups.length,
        description: "Total Groups",
        badge: {
          icon: <IconFolders className="size-3" />,
          text: "Organized",
        },
        footer: {
          text: "Better organization",
          icon: <IconTrendingUp className="size-4" />,
          subtext: "Commands grouped efficiently",
        },
      },
      {
        title: "Schedules",
        value: schedules.length,
        description: "Total Schedules",
        badge: {
          icon: <IconClock className="size-3" />,
          text: `${activeSchedules} active`,
        },
        footer: {
          text: `${todayExecutions} scheduled today`,
          icon: <IconClock className="size-4" />,
          subtext: "Automated task execution",
        },
      },
      {
        title: "Success Rate",
        value: `${successRate}%`,
        description: "Execution Success Rate",
        badge: {
          icon: successRate >= 80 ? <IconTrendingUp /> : <IconTrendingDown />,
          text:
            runningExecutions.length > 0
              ? `${runningExecutions.length} running`
              : "Stable",
        },
        footer: {
          text: successRate >= 80 ? "Excellent performance" : "Needs attention",
          icon:
            successRate >= 80 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            ),
          subtext: "Based on recent executions",
        },
      },
    ];
  }, [
    commands,
    groups,
    schedules,
    nextExecutions,
    executionHistory,
    runningExecutions,
  ]);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription>{stat.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stat.value}
            </CardTitle>
            <CardAction>
              <Badge variant={stat.badge.variant || "outline"}>
                {stat.badge.icon}
                {stat.badge.text}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {stat.footer.text} {stat.footer.icon}
            </div>
            <div className="text-muted-foreground">{stat.footer.subtext}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default StatsSection;
