import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useExecuteCommandGroupMutation,
  useExecuteCommandMutation,
  useGetCommandGroupsQuery,
  useGetCommandsByGroupQuery,
} from "@/store/api/commands-api";
import {
  ClockIcon,
  FolderIcon,
  HashIcon,
  LoaderIcon,
  PlayIcon,
  TagIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

type Props = {};

const GroupDetailsPage = (_props: Props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [executingCommands, setExecutingCommands] = useState<Set<string>>(
    new Set()
  );
  const [isExecutingGroup, setIsExecutingGroup] = useState(false);

  const {
    data: commands = [],
    isLoading,
    error,
  } = useGetCommandsByGroupQuery(id);

  const { data: groups = [] } = useGetCommandGroupsQuery();
  const [executeCommand] = useExecuteCommandMutation();
  const [executeCommandGroup] = useExecuteCommandGroupMutation();

  // Find the current group details
  const currentGroup = groups.find((group) => group.id === id);

  const handleExecuteCommand = async (commandId: string) => {
    setExecutingCommands((prev) => new Set(prev).add(commandId));
    try {
      await executeCommand({ id: commandId }).unwrap();
      toast.success("Command executed successfully");
    } catch (error) {
      toast.error("Failed to execute command");
      console.error("Failed to execute command:", error);
    } finally {
      setExecutingCommands((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commandId);
        return newSet;
      });
    }
  };

  const handleExecuteGroup = async () => {
    if (!id) return;

    setIsExecutingGroup(true);
    try {
      await executeCommandGroup({ id }).unwrap();
      toast.success("Group commands executed successfully");
    } catch (error) {
      toast.error("Failed to execute group commands");
      console.error("Failed to execute group commands:", error);
    } finally {
      setIsExecutingGroup(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back to Groups
          </Button>
          <h1 className="text-2xl font-bold">Group Details</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back to Groups
          </Button>
          <h1 className="text-2xl font-bold">Group Details</h1>
          <p className="text-red-500">Error loading group details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {currentGroup?.name || "Group Commands"}
            </h1>
            {currentGroup?.description && (
              <p className="text-muted-foreground mb-2">
                {currentGroup.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <HashIcon className="h-4 w-4" />
                {commands.length} commands
              </div>
              {currentGroup?.created_at && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Created{" "}
                  {new Date(currentGroup.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {commands.length > 0 && (
            <Button
              onClick={handleExecuteGroup}
              disabled={isExecutingGroup}
              className="shrink-0"
            >
              {isExecutingGroup ? (
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              Execute All Commands
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commands.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              No commands found in this group
            </p>
          </div>
        ) : (
          commands.map((command) => {
            const isExecuting = executingCommands.has(command.id);
            const lastExecuted = command.last_executed
              ? new Date(command.last_executed).toLocaleString()
              : "Never";

            return (
              <Card
                key={command.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {command.name}
                        {command.is_favorite && (
                          <Badge variant="secondary" className="text-xs">
                            Favorite
                          </Badge>
                        )}
                      </CardTitle>
                      {command.description && (
                        <CardDescription className="mt-1">
                          {command.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleExecuteCommand(command.id)}
                      disabled={isExecuting}
                      className="shrink-0"
                    >
                      {isExecuting ? (
                        <LoaderIcon className="h-3 w-3 animate-spin" />
                      ) : (
                        <PlayIcon className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">
                        Command:
                      </span>
                      <code className="block mt-1 px-2 py-1 bg-muted rounded text-xs font-mono">
                        {command.command}
                      </code>
                    </div>

                    {command.working_directory && (
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <FolderIcon className="h-3 w-3" />
                          <span className="font-medium">Directory:</span>
                        </div>
                        <code className="text-xs text-muted-foreground">
                          {command.working_directory}
                        </code>
                      </div>
                    )}

                    {command.tags.length > 0 && (
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <TagIcon className="h-3 w-3" />
                          <span className="font-medium">Tags:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {command.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>Executed {command.execution_count} times</span>
                      </div>
                      <div>Last: {lastExecuted}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GroupDetailsPage;
