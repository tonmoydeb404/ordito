import { TauriAPI } from "@/lib/tauri";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useTrayOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTrayMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await TauriAPI.refreshTrayMenu();

      toast.success("Tray menu refreshed successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh tray menu";
      setError(errorMessage);

      toast.error("Failed to refresh tray menu", {
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
    refreshTrayMenu,
    clearError,
  };
}
