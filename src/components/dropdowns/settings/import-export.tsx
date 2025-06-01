import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useDataOperations } from "@/contexts/hooks";
import { LucideFolderUp, LucideImport } from "lucide-react";

interface Props {
  disabled?: boolean;
}

export const ImportExport = ({ disabled }: Props) => {
  const { exportData, importData, loading } = useDataOperations();

  const handleExport = async () => {
    await exportData();
  };

  const handleImportClick = async () => {
    await importData();
  };

  const isDisabled = disabled || loading;

  return (
    <>
      <DropdownMenuItem onClick={handleExport} disabled={isDisabled}>
        <LucideFolderUp className="mr-2 h-4 w-4" />
        Export Commands
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleImportClick}>
        <LucideImport className="mr-2 h-4 w-4" />
        Import Commands
      </DropdownMenuItem>
    </>
  );
};
