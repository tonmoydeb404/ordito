import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LucideClipboard,
  LucideEdit,
  LucideMoreVertical,
  LucidePlay,
  LucideTrash,
} from "lucide-react";

type Props = {
  onDelete: () => void;
  onUpdate: () => void;
  onExecute: () => void;
  onCopy: () => void;
};

const GroupActions = (props: Props) => {
  const { onDelete, onUpdate, onCopy, onExecute } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size={"icon_sm"} variant={"secondary"}>
          <LucideMoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExecute}>
          <LucidePlay /> Execute Commands
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopy}>
          <LucideClipboard /> Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUpdate}>
          <LucideEdit /> Update Title
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <LucideTrash /> Remove Group
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GroupActions;
