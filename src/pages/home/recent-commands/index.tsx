import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCommandsQuery } from "@/store/api/commands-api";
import { useGetExecutionHistoryQuery } from "@/store/api/executions-api";
import {
  LucideActivity,
  LucideClock,
  LucidePlay,
  LucidePlus,
  LucideTerminalSquare,
} from "lucide-react";
import { useMemo, useState } from "react";

const RecentCommandsSection = () => {
  const { data: commands = [] } = useGetCommandsQuery();
  const { data: executionHistory = [] } = useGetExecutionHistoryQuery(20);
  const [activeTab, setActiveTab] = useState("executed");

  const recentlyExecutedCommands = useMemo(() => {
    // Get unique commands from recent executions
    const recentCommandIds = new Set<string>();
    const recentExecutions = [...executionHistory]
      .sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )
      .filter((execution) => {
        if (recentCommandIds.has(execution.command_id)) {
          return false;
        }
        recentCommandIds.add(execution.command_id);
        return true;
      })
      .slice(0, 6); // Show last 6 unique commands

    return recentExecutions
      .map((execution) => {
        const command = commands.find((c) => c.id === execution.command_id);
        if (!command) return null;

        return {
          command,
          lastExecution: execution,
          executedAt: new Date(execution.started_at),
          success: execution.exit_code === 0,
          type: "executed" as const,
        };
      })
      .filter((item) => item !== null);
  }, [commands, executionHistory]);

  const recentlyCreatedCommands = useMemo(() => {
    return [...commands]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 6)
      .map((command) => ({
        command,
        createdAt: new Date(command.created_at),
        type: "created" as const,
      }));
  }, [commands]);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const renderCommandItem = (item: any) => (
    <div
      key={
        item.type === "executed"
          ? `${item.command.id}-${item.lastExecution.id}`
          : item.command.id
      }
      className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0">
          {item.type === "executed" ? (
            <div
              className={`size-2 rounded-full ${
                item.success ? "bg-green-500" : "bg-red-500"
              }`}
            />
          ) : (
            <LucidePlus className="size-3 text-blue-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">
              {item.command.name}
            </h4>
            {item.command.is_favorite && (
              <Badge variant="outline" className="text-xs">
                ⭐ Favorite
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {item.command.command}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <LucideClock className="size-3" />
            {item.type === "executed"
              ? formatRelativeTime(item.executedAt)
              : formatRelativeTime(item.createdAt)}
          </div>
          <div className="text-xs">
            {item.type === "executed" ? (
              <span
                className={item.success ? "text-green-600" : "text-red-600"}
              >
                {item.success ? "Success" : "Failed"}
              </span>
            ) : (
              <span className="text-blue-600">Created</span>
            )}
          </div>
        </div>
        <Button size="sm" variant="ghost" className="size-8 p-0">
          <LucidePlay className="size-3" />
          <span className="sr-only">Execute</span>
        </Button>
      </div>
    </div>
  );

  const renderEmptyState = (type: "executed" | "created") => (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <LucideTerminalSquare className="size-12 mb-2 opacity-50" />
      <p>No {type === "executed" ? "recent executions" : "commands created"}</p>
      <p className="text-sm">
        {type === "executed"
          ? "Commands will appear here after execution"
          : "New commands will appear here"}
      </p>
    </div>
  );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LucideActivity className="size-5" />
          Recent Commands
        </CardTitle>
        <CardDescription>
          Recently created and executed commands
        </CardDescription>
        <CardAction>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="executed" className="text-xs">
                Executed
                {recentlyExecutedCommands.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {recentlyExecutedCommands.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="created" className="text-xs">
                Created
                {recentlyCreatedCommands.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {recentlyCreatedCommands.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="executed" className="mt-0">
            {recentlyExecutedCommands.length === 0 ? (
              renderEmptyState("executed")
            ) : (
              <div className="space-y-3">
                {recentlyExecutedCommands.map(renderCommandItem)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="created" className="mt-0">
            {recentlyCreatedCommands.length === 0 ? (
              renderEmptyState("created")
            ) : (
              <div className="space-y-3">
                {recentlyCreatedCommands.map(renderCommandItem)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentCommandsSection;
