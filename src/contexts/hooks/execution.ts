import { TauriAPI } from "@/lib/tauri";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useExecutionContext } from "../execution";

export function useCommandExecution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addResponse, showModal } = useExecutionContext();

  const executeCommand = useCallback(
    async (cmd: string, label: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await TauriAPI.executeCommand(cmd);
        setLoading(false);

        const id = new Date().toISOString();
        addResponse(id, {
          label: label,
          result: [[label, response]],
        });

        toast.success("Command executed successfully!", {
          action: {
            label: "Details",
            onClick: () => {
              showModal(id);
            },
          },
        });

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to execute command";
        setError(errorMessage);
        setLoading(false);

        const id = new Date().toISOString();
        addResponse(id, {
          label: label,
          result: [[label, `Error: ${errorMessage}`]],
        });

        toast.error(errorMessage, {
          action: {
            label: "Details",
            onClick: () => {
              showModal(id);
            },
          },
        });

        throw err;
      }
    },
    [addResponse, showModal]
  );

  const executeCommandDetached = useCallback(
    async (cmd: string, label: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await TauriAPI.executeCommandDetached(cmd);
        setLoading(false);

        const id = new Date().toISOString();
        addResponse(id, {
          label: label,
          result: [[label, response]],
        });

        toast.success("Command started in background!", {
          action: {
            label: "Details",
            onClick: () => {
              showModal(id);
            },
          },
        });

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to execute detached command";
        setError(errorMessage);
        setLoading(false);

        const id = new Date().toISOString();
        addResponse(id, {
          label: label,
          result: [[label, `Error: ${errorMessage}`]],
        });

        toast.error(errorMessage, {
          action: {
            label: "Details",
            onClick: () => {
              showModal(id);
            },
          },
        });

        throw err;
      }
    },
    [addResponse, showModal]
  );

  const executeGroupCommands = useCallback(
    async (groupId: string, label: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await TauriAPI.executeGroupCommands(groupId);

        const id = new Date().toISOString();
        addResponse(id, {
          label: label,
          result: response,
        });

        setLoading(false);

        // Smart toast based on results
        const successCount = response.filter(
          ([, output]) => !output.startsWith("Error:")
        ).length;
        const errorCount = response.length - successCount;

        const detailsAction = {
          label: "Details",
          onClick: () => showModal(id),
        };

        if (errorCount === 0) {
          toast.success(
            `All ${response.length} commands executed successfully!`,
            {
              action: detailsAction,
            }
          );
        } else if (successCount === 0) {
          toast.error(`All ${response.length} commands failed!`, {
            action: detailsAction,
          });
        } else {
          toast.warning(`${successCount} succeeded, ${errorCount} failed`, {
            action: detailsAction,
          });
        }

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to execute group commands";
        setError(errorMessage);
        setLoading(false);

        const id = new Date().toISOString();
        addResponse(id, {
          label: label,
          result: [[label, `Error: ${errorMessage}`]],
        });

        toast.error(errorMessage, {
          action: {
            label: "Details",
            onClick: () => {
              showModal(id);
            },
          },
        });

        throw err;
      }
    },
    [addResponse, showModal]
  );

  return {
    loading,
    error,
    executeCommand,
    executeCommandDetached,
    executeGroupCommands,
  };
}
