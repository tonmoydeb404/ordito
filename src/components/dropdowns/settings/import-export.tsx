import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useDataOperations } from "@/contexts/hooks";
import { LucideFolderUp, LucideImport } from "lucide-react";
import { useRef } from "react";

interface Props {
  disabled?: boolean;
}

export const ImportExport = ({ disabled }: Props) => {
  const { exportData, importData, loading } = useDataOperations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    await exportData();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();

      // Basic validation
      try {
        JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON file format");
      }

      await importData(text);
    } catch (error) {
      // Error is already handled by the hook with toast
      console.error("Import failed:", error);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isDisabled = disabled || loading;

  return (
    <>
      <DropdownMenuItem onClick={handleExport} disabled={isDisabled}>
        <LucideFolderUp className="mr-2 h-4 w-4" />
        Export Commands
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleImportClick} disabled={isDisabled}>
        <LucideImport className="mr-2 h-4 w-4" />
        Import Commands
      </DropdownMenuItem>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </>
  );
};
