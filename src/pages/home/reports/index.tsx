"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetExecutionHistoryQuery } from "@/store/api/executions-api";

export const description = "Command execution analytics";

const transformExecutionHistoryToChartData = (
  executions: any[],
  timeRange: string
) => {
  if (!executions?.length) return [];

  const now = new Date();
  const daysToSubtract = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  const dailyStats = new Map();

  executions.forEach((execution) => {
    const executionDate = new Date(execution.started_at);
    if (executionDate >= startDate && executionDate <= now) {
      const dateKey = executionDate.toISOString().split("T")[0];

      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, {
          date: dateKey,
          successful: 0,
          failed: 0,
          total: 0,
        });
      }

      const dayStats = dailyStats.get(dateKey);
      dayStats.total += 1;

      if (execution.exit_code === 0) {
        dayStats.successful += 1;
      } else if (
        execution.exit_code !== null &&
        execution.exit_code !== undefined
      ) {
        dayStats.failed += 1;
      }
    }
  });

  const result = [];
  for (let i = 0; i < daysToSubtract; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];

    if (dailyStats.has(dateKey)) {
      result.push(dailyStats.get(dateKey));
    } else {
      result.push({
        date: dateKey,
        successful: 0,
        failed: 0,
        total: 0,
      });
    }
  }

  return result;
};

const chartConfig = {
  executions: {
    label: "Executions",
  },
  successful: {
    label: "Successful",
    color: "hsl(var(--chart-2))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const ReportsSection = () => {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  const {
    data: executionHistory,
    isLoading,
    error,
  } = useGetExecutionHistoryQuery(undefined);

  console.log(error);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const chartData = React.useMemo(() => {
    return transformExecutionHistoryToChartData(
      executionHistory || [],
      timeRange
    );
  }, [executionHistory, timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Command Executions</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Successful and failed executions over time
          </span>
          <span className="@[540px]/card:hidden">Execution history</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            Loading execution history...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[250px] text-destructive">
            Error loading execution history
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillSuccessful" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-successful)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-successful)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-failed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-failed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="successful"
                type="natural"
                fill="url(#fillSuccessful)"
                stroke="var(--color-successful)"
                stackId="a"
              />
              <Area
                dataKey="failed"
                type="natural"
                fill="url(#fillFailed)"
                stroke="var(--color-failed)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsSection;
