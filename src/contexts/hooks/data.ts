import { useAppContext } from "@/contexts/app";
import { TauriAPI } from "@/lib/tauri";
import { useCallback, useState } from "react";

export function useDataOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { _setGroups } = useAppContext();

  const exportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await TauriAPI.exportData();
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to export data";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const importData = useCallback(
    async (data: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await TauriAPI.importData(data);

        // Refresh groups data after successful import
        const updatedGroups = await TauriAPI.getGroups();
        _setGroups(updatedGroups);

        setLoading(false);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to import data";
        setError(errorMessage);
        setLoading(false);
        throw err;
      }
    },
    [_setGroups]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    exportData,
    importData,
    clearError,
  };
}
