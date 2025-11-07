import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Command } from "@/types/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Eraser, Play, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CommandEditorProps {
  commandId: string;
  websocketMessage: any;
  sendWebsocketMessage: (message: any) => void;
}

interface EnvVar {
  name: string;
  value: string;
}

export default function CommandEditor({
  commandId,
  websocketMessage,
  sendWebsocketMessage,
}: CommandEditorProps) {
  const [editedCommand, setEditedCommand] = useState<Command | null>(null);
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [newEnvVar, setNewEnvVar] = useState<EnvVar>({ name: "", value: "" });
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const { data: command, isLoading } = useQuery<Command>({
    queryKey: ["/api/commands", commandId],
    enabled: !!commandId,
  });

  const updateCommandMutation = useMutation({
    mutationFn: async (data: Partial<Command>) => {
      const response = await apiRequest(
        "PUT",
        `/api/commands/${commandId}`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/commands", commandId] });
      toast("Command updated successfully");
    },
    onError: () => {
      toast.error("Failed to update command");
    },
  });

  const deleteCommandMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/commands/${commandId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commands"] });
      toast("Command deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete command");
    },
  });

  // Initialize form when command loads
  useEffect(() => {
    if (command) {
      setEditedCommand(command);

      // Parse environment variables
      const envVarsObj = (command.envVars as Record<string, string>) || {};
      const envVarsArray = Object.entries(envVarsObj).map(([name, value]) => ({
        name,
        value,
      }));
      setEnvVars(envVarsArray);
    }
  }, [command]);

  // Handle WebSocket messages for output
  useEffect(() => {
    if (websocketMessage) {
      const { type, data, stream, logId } = websocketMessage;

      if (type === "execution_started") {
        setOutput("");
        setIsExecuting(true);
      } else if (type === "output") {
        setOutput((prev) => prev + data);
        // Auto-scroll to bottom
        setTimeout(() => {
          if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
          }
        }, 0);
      } else if (
        type === "execution_completed" ||
        type === "execution_error" ||
        type === "execution_cancelled"
      ) {
        setIsExecuting(false);
        if (type === "execution_completed") {
          setOutput(
            (prev) =>
              prev +
              `\nCommand completed successfully (exit code: ${websocketMessage.exitCode})\n`
          );
        } else if (type === "execution_error") {
          setOutput((prev) => prev + `\nError: ${websocketMessage.error}\n`);
        } else if (type === "execution_cancelled") {
          setOutput((prev) => prev + `\nExecution cancelled\n`);
        }
      }
    }
  }, [websocketMessage]);

  const handleSave = () => {
    if (!editedCommand) return;

    // Convert env vars array back to object
    const envVarsObj = envVars.reduce((obj, envVar) => {
      if (envVar.name.trim()) {
        obj[envVar.name] = envVar.value;
      }
      return obj;
    }, {} as Record<string, string>);

    updateCommandMutation.mutate({
      ...editedCommand,
      envVars: envVarsObj,
    });
  };

  const handleExecute = () => {
    sendWebsocketMessage({
      type: "execute_command",
      commandId,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this command?")) {
      deleteCommandMutation.mutate();
    }
  };

  const addEnvVar = () => {
    if (newEnvVar.name.trim()) {
      setEnvVars([...envVars, newEnvVar]);
      setNewEnvVar({ name: "", value: "" });
    }
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const clearOutput = () => {
    setOutput("");
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast("Output copied to clipboard");
  };

  if (isLoading || !editedCommand) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading command...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Command Editor Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{editedCommand.name}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="px-3 py-1.5 bg-success hover:bg-success/80 text-white text-xs"
              onClick={handleExecute}
              disabled={isExecuting}
              data-testid="button-execute-command"
            >
              <Play className="w-3 h-3 mr-1" />
              {isExecuting ? "Running..." : "Execute"}
            </Button>
            <Button
              size="sm"
              className="px-3 py-1.5 bg-primary hover:bg-primary/80 text-primary-foreground text-xs"
              onClick={handleSave}
              disabled={updateCommandMutation.isPending}
              data-testid="button-save-command"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="px-3 py-1.5 text-xs"
              onClick={handleDelete}
              disabled={deleteCommandMutation.isPending}
              data-testid="button-delete-command"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Command Form */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
          <div className="space-y-4 max-w-2xl">
            <div>
              <Label htmlFor="command-name">Command Name</Label>
              <Input
                id="command-name"
                value={editedCommand.name}
                onChange={(e) =>
                  setEditedCommand({ ...editedCommand, name: e.target.value })
                }
                className="mt-1"
                data-testid="input-command-name-edit"
              />
            </div>

            <div>
              <Label htmlFor="command-description">Description</Label>
              <Textarea
                id="command-description"
                value={editedCommand.description || ""}
                onChange={(e) =>
                  setEditedCommand({
                    ...editedCommand,
                    description: e.target.value,
                  })
                }
                className="mt-1 h-20 resize-none"
                data-testid="textarea-command-description"
              />
            </div>

            <div>
              <Label htmlFor="command-script">Command</Label>
              <Textarea
                id="command-script"
                value={editedCommand.script}
                onChange={(e) =>
                  setEditedCommand({ ...editedCommand, script: e.target.value })
                }
                className="mt-1 h-24 resize-none font-mono text-sm syntax-highlight"
                data-testid="textarea-command-script"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="working-dir">Working Directory</Label>
                <Input
                  id="working-dir"
                  value={editedCommand.workingDir || ""}
                  onChange={(e) =>
                    setEditedCommand({
                      ...editedCommand,
                      workingDir: e.target.value,
                    })
                  }
                  placeholder="~/projects/my-app"
                  className="mt-1"
                  data-testid="input-working-directory"
                />
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={editedCommand.timeout || 30}
                  onChange={(e) =>
                    setEditedCommand({
                      ...editedCommand,
                      timeout: parseInt(e.target.value) || 30,
                    })
                  }
                  className="mt-1"
                  data-testid="input-timeout"
                />
              </div>
            </div>

            <div>
              <Label>Environment Variables</Label>
              <div className="space-y-2 mt-2">
                {envVars.map((envVar, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={envVar.name}
                      onChange={(e) =>
                        updateEnvVar(index, "name", e.target.value)
                      }
                      placeholder="Variable name"
                      className="flex-1"
                      data-testid={`input-env-name-${index}`}
                    />
                    <Input
                      value={envVar.value}
                      onChange={(e) =>
                        updateEnvVar(index, "value", e.target.value)
                      }
                      placeholder="Value"
                      className="flex-1"
                      data-testid={`input-env-value-${index}`}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => removeEnvVar(index)}
                      className="px-3"
                      data-testid={`button-remove-env-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    value={newEnvVar.name}
                    onChange={(e) =>
                      setNewEnvVar({ ...newEnvVar, name: e.target.value })
                    }
                    placeholder="Variable name"
                    className="flex-1"
                    data-testid="input-new-env-name"
                  />
                  <Input
                    value={newEnvVar.value}
                    onChange={(e) =>
                      setNewEnvVar({ ...newEnvVar, value: e.target.value })
                    }
                    placeholder="Value"
                    className="flex-1"
                    data-testid="input-new-env-value"
                  />
                  <Button
                    size="icon"
                    className="px-3 bg-primary hover:bg-primary/80 text-primary-foreground"
                    onClick={addEnvVar}
                    data-testid="button-add-env"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={editedCommand.captureOutput || false}
                  onCheckedChange={(checked) =>
                    setEditedCommand({
                      ...editedCommand,
                      captureOutput: !!checked,
                    })
                  }
                  data-testid="checkbox-capture-output"
                />
                <span className="text-xs">Capture Output</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={editedCommand.runInBackground || false}
                  onCheckedChange={(checked) =>
                    setEditedCommand({
                      ...editedCommand,
                      runInBackground: !!checked,
                    })
                  }
                  data-testid="checkbox-run-background"
                />
                <span className="text-xs">Run in Background</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={editedCommand.isFavorite || false}
                  onCheckedChange={(checked) =>
                    setEditedCommand({
                      ...editedCommand,
                      isFavorite: !!checked,
                    })
                  }
                  data-testid="checkbox-favorite"
                />
                <span className="text-xs">Add to Favorites</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Output Panel */}
        <div className="h-40 border-t border-border flex flex-col">
          <div className="p-2 bg-secondary border-b border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium">Output</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="px-2 py-1 text-xs"
                  onClick={clearOutput}
                  data-testid="button-clear-output"
                >
                  <Eraser className="w-3 h-3 mr-1" />
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="px-2 py-1 text-xs"
                  onClick={copyOutput}
                  data-testid="button-copy-output"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
          <div
            ref={outputRef}
            className="flex-1 p-3 bg-secondary font-mono text-xs overflow-y-auto scrollbar-thin terminal-output whitespace-pre-wrap"
            data-testid="terminal-output"
          >
            {output || (
              <div className="text-muted-foreground">
                Command output will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
