import { TauriAPI } from "@/lib/tauri";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useStartupOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStartupEnabled, setIsStartupEnabled] = useState<boolean | null>(
    null
  );

  const checkStartupStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const enabled = await TauriAPI.isStartupEnabled();
      setIsStartupEnabled(enabled);

      return enabled;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check startup status";
      setError(errorMessage);

      toast.error("Failed to check startup status", {
        description: errorMessage,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleStartup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const newState = await TauriAPI.toggleStartup();
      setIsStartupEnabled(newState);

      toast.success(
        newState
          ? "App will now start on system startup"
          : "App startup disabled"
      );

      return newState;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle startup";
      setError(errorMessage);

      toast.error("Failed to toggle startup", {
        description: errorMessage,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    isStartupEnabled,
    checkStartupStatus,
    toggleStartup,
    clearError,
  };
}
