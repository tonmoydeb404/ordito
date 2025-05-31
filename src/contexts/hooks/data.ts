import { useAppContext } from "@/contexts/app";
import { TauriAPI } from "@/lib/tauri";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useDataOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { _setGroups } = useAppContext();

  const exportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      toast.loading("Opening save dialog...", { id: "export-data" });

      const result = await TauriAPI.exportData();
      setLoading(false);

      // Check if user cancelled or if export was successful
      if (result.includes("User cancelled")) {
        toast.dismiss("export-data");
        return result;
      }

      toast.success("Export completed!", {
        id: "export-data",
        description: result, // This will show the file path
      });

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to export data";
      setError(errorMessage);
      setLoading(false);

      // Handle cancellation gracefully
      if (errorMessage.includes("cancelled")) {
        toast.dismiss("export-data");
        return;
      }

      toast.error("Export failed", {
        id: "export-data",
        description: errorMessage,
      });

      throw err;
    }
  }, []);

  const importData = useCallback(
    async (data: string) => {
      try {
        setLoading(true);
        setError(null);

        toast.loading("Importing data...", { id: "import-data" });

        const result = await TauriAPI.importData(data);

        // Refresh groups data after successful import
        const updatedGroups = await TauriAPI.getGroups();
        _setGroups(updatedGroups);

        setLoading(false);

        toast.success("Import completed!", {
          id: "import-data",
          description: `Successfully imported ${updatedGroups.length} group${
            updatedGroups.length !== 1 ? "s" : ""
          }. ${result}`,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to import data";
        setError(errorMessage);
        setLoading(false);

        toast.error("Import failed", {
          id: "import-data",
          description: errorMessage,
        });

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
