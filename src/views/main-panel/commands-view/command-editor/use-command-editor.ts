import { toast } from "@/hooks/use-toast";
import {
  useDeleteCommandMutation,
  useExecuteCommandMutation,
  useGetCommandQuery,
  useToggleFavouriteMutation,
  useUpdateCommandMutation,
} from "@/store";
import type { CommandResponse, UpdateCommandDto } from "@/store/types";
import { useEffect, useState } from "react";
import type { EnvVar } from "../types";

export function useCommandEditor(commandId: string, onDelete?: () => void) {
  const [editedCommand, setEditedCommand] = useState<CommandResponse | null>(
    null
  );
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [newEnvVar, setNewEnvVar] = useState<EnvVar>({ name: "", value: "" });
  // TODO: Implement output handling via RTK Query or logs API
  const [output] = useState("");

  const { data: command, isLoading } = useGetCommandQuery(commandId, {
    skip: !commandId,
  });

  console.log({ command, commandId });

  const [updateCommand, { isLoading: isUpdating }] = useUpdateCommandMutation();
  const [deleteCommand, { isLoading: isDeleting }] = useDeleteCommandMutation();
  const [executeCommand] = useExecuteCommandMutation();
  const [toggleFavourite] = useToggleFavouriteMutation();

  // Initialize form when command loads
  useEffect(() => {
    if (command) {
      setEditedCommand(command);

      // Parse environment variables (stored as JSON string in backend)
      try {
        const envVarsObj = JSON.parse(command.env_vars || "{}");
        const envVarsArray = Object.entries(envVarsObj).map(
          ([name, value]) => ({
            name,
            value: String(value),
          })
        );
        setEnvVars(envVarsArray);
      } catch {
        setEnvVars([]);
      }
    }
  }, [command]);

  const handleSave = async () => {
    if (!editedCommand) return;

    // Convert env vars array back to object, then to JSON string
    const envVarsObj = envVars.reduce((obj, envVar) => {
      if (envVar.name.trim()) {
        obj[envVar.name] = envVar.value;
      }
      return obj;
    }, {} as Record<string, string>);

    const dto: UpdateCommandDto = {
      id: editedCommand.id,
      command_group_id: editedCommand.command_group_id,
      title: editedCommand.title,
      value: editedCommand.value,
      working_dir: editedCommand.working_dir,
      timeout: editedCommand.timeout,
      run_in_background: editedCommand.run_in_background,
      is_favourite: editedCommand.is_favourite,
      env_vars: JSON.stringify(envVarsObj),
    };

    try {
      await updateCommand(dto).unwrap();
      toast.success("Command updated successfully");
    } catch (error) {
      toast.error("Failed to update command");
    }
  };

  const handleExecute = async () => {
    try {
      await executeCommand(commandId).unwrap();
      toast.success("Command execution started");
    } catch (error) {
      toast.error("Failed to execute command");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this command?")) {
      try {
        await deleteCommand(commandId).unwrap();
        toast.success("Command deleted successfully");
        // Clear the form after successful deletion
        setEditedCommand(null);
        setEnvVars([]);
        setNewEnvVar({ name: "", value: "" });
        // Notify parent to reset selected command
        onDelete?.();
      } catch (error) {
        toast.error("Failed to delete command");
      }
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
    // TODO: Implement when output is available
    console.log("Clear output");
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast("Output copied to clipboard");
  };

  return {
    editedCommand,
    setEditedCommand,
    envVars,
    newEnvVar,
    setNewEnvVar,
    output,
    isLoading,
    isUpdating,
    isDeleting,
    handleSave,
    handleExecute,
    handleDelete,
    addEnvVar,
    removeEnvVar,
    updateEnvVar,
    clearOutput,
    copyOutput,
  };
}
