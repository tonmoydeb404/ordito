import { useAppContext } from "@/context";
import { TauriAPI } from "@/lib/tauri";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useCommandExecution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { results, showResultsModal, setResults, setShowResultsModal } =
    useAppContext();

  const executeCommand = useCallback(
    async (cmd: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await TauriAPI.executeCommand(cmd);
        setLoading(false);

        toast.success("Command executed successfully!", {
          action: {
            label: "Details",
            onClick: () => {
              // For single commands, create a temporary result entry
              const tempGroupId = `single-cmd-${Date.now()}`;
              setResults(tempGroupId, [["Command", result]]);
              setShowResultsModal(tempGroupId);
            },
          },
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to execute command";
        setError(errorMessage);
        setLoading(false);

        toast.error(errorMessage, {
          action: {
            label: "Details",
            onClick: () => {
              // For single command errors, create a temporary result entry
              const tempGroupId = `single-cmd-error-${Date.now()}`;
              setResults(tempGroupId, [["Command", `Error: ${errorMessage}`]]);
              setShowResultsModal(tempGroupId);
            },
          },
        });

        throw err;
      }
    },
    [setResults, setShowResultsModal]
  );

  const executeCommandDetached = useCallback(
    async (cmd: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await TauriAPI.executeCommandDetached(cmd);
        setLoading(false);

        toast.success("Command started in background!", {
          action: {
            label: "Details",
            onClick: () => {
              // For detached commands, create a temporary result entry
              const tempGroupId = `detached-cmd-${Date.now()}`;
              setResults(tempGroupId, [["Detached Command", result]]);
              setShowResultsModal(tempGroupId);
            },
          },
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to execute detached command";
        setError(errorMessage);
        setLoading(false);

        toast.error(errorMessage, {
          action: {
            label: "Details",
            onClick: () => {
              // For detached command errors, create a temporary result entry
              const tempGroupId = `detached-cmd-error-${Date.now()}`;
              setResults(tempGroupId, [
                ["Detached Command", `Error: ${errorMessage}`],
              ]);
              setShowResultsModal(tempGroupId);
            },
          },
        });

        throw err;
      }
    },
    [setResults, setShowResultsModal]
  );

  const executeGroupCommands = useCallback(
    async (groupId: string) => {
      try {
        setLoading(true);
        setError(null);
        const groupResults = await TauriAPI.executeGroupCommands(groupId);
        setResults(groupId, groupResults);
        setLoading(false);

        // Smart toast based on results
        const successCount = groupResults.filter(
          ([, output]) => !output.startsWith("Error:")
        ).length;
        const errorCount = groupResults.length - successCount;

        const detailsAction = {
          label: "Details",
          onClick: () => setShowResultsModal(groupId),
        };

        if (errorCount === 0) {
          toast.success(
            `All ${groupResults.length} commands executed successfully!`,
            {
              action: detailsAction,
            }
          );
        } else if (successCount === 0) {
          toast.error(`All ${groupResults.length} commands failed!`, {
            action: detailsAction,
          });
        } else {
          toast.warning(`${successCount} succeeded, ${errorCount} failed`, {
            action: detailsAction,
          });
        }

        return groupResults;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to execute group commands";
        setError(errorMessage);
        setLoading(false);

        toast.error(errorMessage, {
          action: {
            label: "Details",
            onClick: () => {
              // For group execution errors, show the error
              const tempGroupId = `group-error-${Date.now()}`;
              setResults(tempGroupId, [
                ["Group Execution", `Error: ${errorMessage}`],
              ]);
              setShowResultsModal(tempGroupId);
            },
          },
        });

        throw err;
      }
    },
    [setResults, setShowResultsModal]
  );

  // Helper functions
  const getExecutionResults = useCallback(
    (groupId: string) => {
      return results[groupId] || [];
    },
    [results]
  );

  const hasResults = useCallback(
    (groupId: string) => {
      return (results[groupId] || []).length > 0;
    },
    [results]
  );

  const getResultsSummary = useCallback(
    (groupId: string) => {
      const groupResults = results[groupId] || [];
      const successCount = groupResults.filter(
        ([, output]) => !output.startsWith("Error:")
      ).length;
      const errorCount = groupResults.length - successCount;

      return {
        total: groupResults.length,
        success: successCount,
        error: errorCount,
      };
    },
    [results]
  );

  const clearResults = useCallback(
    (groupId?: string) => {
      if (groupId) {
        setResults(groupId, []);
      } else {
        // Clear all results - need to update context to support this
        Object.keys(results).forEach((id) => setResults(id, []));
      }
    },
    [results, setResults]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const closeResultsModal = useCallback(() => {
    setShowResultsModal(null);
  }, [setShowResultsModal]);

  return {
    loading,
    error,
    executeCommand,
    executeCommandDetached,
    executeGroupCommands,
    getExecutionResults,
    hasResults,
    getResultsSummary,
    clearResults,
    clearError,
    // Modal state for results
    showResultsModal,
    closeResultsModal,
  };
}
