import CommandEditor from "@/components/command-editor";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CommandWithFolder } from "@/types/schema";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Edit,
  Play,
  RotateCcw,
  Square,
  Star,
  Terminal,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CommandsViewProps {
  selectedCommandId: string | null;
  selectedFolderId: string | null;
  onSelectCommand: (commandId: string) => void;
  websocketMessage: any;
  sendWebsocketMessage: (message: any) => void;
}

export default function CommandsView({
  selectedCommandId,
  selectedFolderId,
  onSelectCommand,
  websocketMessage,
  sendWebsocketMessage,
}: CommandsViewProps) {
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [runningCommands, setRunningCommands] = useState<Set<string>>(
    new Set()
  );

  const { data: commands = [] } = useQuery<CommandWithFolder[]>({
    queryKey: ["/api/commands"],
  });

  // Filter and sort commands
  const filteredCommands = commands
    .filter((command) => {
      if (selectedFolderId && command.folderId !== selectedFolderId) {
        return false;
      }

      switch (filterBy) {
        case "favorite":
          return command.isFavorite;
        case "recent":
          return true; // TODO: Implement recent logic
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "lastModified":
          const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bTime - aTime;
        case "lastExecuted":
          return 0; // TODO: Implement last executed logic
        default:
          return 0;
      }
    });

  // Handle WebSocket messages
  useEffect(() => {
    if (websocketMessage) {
      const { type, commandId, logId } = websocketMessage;

      if (type === "execution_started" && commandId) {
        setRunningCommands((prev) => new Set([...Array.from(prev), commandId]));
      } else if (
        type === "execution_completed" ||
        type === "execution_error" ||
        type === "execution_cancelled"
      ) {
        // Find command by logId (would need to track logId to commandId mapping)
        // For now, we'll clear all running states when any execution completes
        setRunningCommands(new Set());
      }
    }
  }, [websocketMessage]);

  const executeCommand = (commandId: string) => {
    sendWebsocketMessage({
      type: "execute_command",
      commandId,
    });
  };

  const stopCommand = (commandId: string) => {
    // This would need the logId, which we'd track separately
    sendWebsocketMessage({
      type: "cancel_execution",
      commandId, // This is not correct, should be logId
    });
  };

  const getStatusBadge = (command: CommandWithFolder) => {
    if (runningCommands.has(command.id)) {
      return (
        <span className="bg-warning text-black px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse-subtle" />
          Running
        </span>
      );
    }

    // TODO: Get actual status from last execution log
    return (
      <span className="bg-success text-black px-1.5 py-0.5 rounded text-xs">
        ✓ Success
      </span>
    );
  };

  const selectedCommand = commands.find((cmd) => cmd.id === selectedCommandId);
  const currentFolder =
    selectedCommand?.folder ||
    (selectedFolderId ? { name: "Current Folder" } : null);

  return (
    <div className="h-full flex">
      <ResizablePanelGroup direction="horizontal">
        {/* Commands List */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full border-r border-border">
            {/* Commands Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium">
                  {currentFolder
                    ? `${currentFolder.name} Commands`
                    : "All Commands"}
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="px-2 py-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs"
                    data-testid="button-run-all"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2 py-1 text-xs"
                    data-testid="button-refresh"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    className="flex-1"
                    data-testid="select-sort-by"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by: Name</SelectItem>
                    <SelectItem value="lastModified">
                      Sort by: Last Modified
                    </SelectItem>
                    <SelectItem value="lastExecuted">
                      Sort by: Last Executed
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger data-testid="select-filter-by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="favorite">Favorite</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Commands List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              <div className="space-y-3">
                {filteredCommands.map((command) => {
                  const isSelected = selectedCommandId === command.id;
                  const isRunning = runningCommands.has(command.id);

                  return (
                    <div
                      key={command.id}
                      className={`command-card p-3 rounded cursor-pointer border transition-all ${
                        isSelected
                          ? "bg-accent border-l-2 border-primary"
                          : "bg-secondary hover:bg-accent border-border"
                      }`}
                      onClick={() => onSelectCommand(command.id)}
                      data-testid={`card-command-${command.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {command.isFavorite && (
                            <Star className="w-3 h-3 text-warning" />
                          )}
                          <h3 className="font-medium text-sm">
                            {command.name}
                          </h3>
                          {getStatusBadge(command)}
                        </div>
                        <div className="flex gap-1">
                          {isRunning ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="p-1 h-auto w-auto hover:bg-background"
                              onClick={(e) => {
                                e.stopPropagation();
                                stopCommand(command.id);
                              }}
                              data-testid={`button-stop-${command.name
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              <Square className="w-3 h-3 text-error" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="p-1 h-auto w-auto hover:bg-background"
                              onClick={(e) => {
                                e.stopPropagation();
                                executeCommand(command.id);
                              }}
                              data-testid={`button-play-${command.name
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              <Play className="w-3 h-3 text-success" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="p-1 h-auto w-auto hover:bg-background"
                            data-testid={`button-edit-${command.name
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            <Edit className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        {command.description || "No description"}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span
                          data-testid={`text-last-run-${command.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          Last run:{" "}
                          {command.updatedAt
                            ? new Date(command.updatedAt).toLocaleDateString()
                            : "Never"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>0.5s</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredCommands.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No commands found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Command Editor */}
        <ResizablePanel defaultSize={50} minSize={30}>
          {selectedCommandId ? (
            <CommandEditor
              commandId={selectedCommandId}
              websocketMessage={websocketMessage}
              sendWebsocketMessage={sendWebsocketMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Terminal className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a command to view details</p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
