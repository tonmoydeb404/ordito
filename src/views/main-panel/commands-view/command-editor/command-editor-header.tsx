import { Button } from "@/components/ui/button";
import { Play, Save, Trash2 } from "lucide-react";

interface CommandEditorHeaderProps {
  title: string;
  onExecute: () => void;
  onSave: () => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export default function CommandEditorHeader({
  title,
  onExecute,
  onSave,
  onDelete,
  isUpdating,
  isDeleting,
}: CommandEditorHeaderProps) {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="px-3 py-1.5 bg-success hover:bg-success/80 text-white text-xs"
            onClick={onExecute}
            data-testid="button-execute-command"
          >
            <Play className="w-3 h-3 mr-1" />
            Execute
          </Button>
          <Button
            size="sm"
            className="px-3 py-1.5 bg-primary hover:bg-primary/80 text-primary-foreground text-xs"
            onClick={onSave}
            disabled={isUpdating}
            data-testid="button-save-command"
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="px-3 py-1.5 text-xs"
            onClick={onDelete}
            disabled={isDeleting}
            data-testid="button-delete-command"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
