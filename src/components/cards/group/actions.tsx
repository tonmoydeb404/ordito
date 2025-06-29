import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LucideClipboard,
  LucideClock,
  LucideEdit,
  LucideMoreVertical,
  LucidePlay,
  LucideTrash,
} from "lucide-react";

type Props = {
  onDelete: () => void;
  onUpdate: () => void;
  onExecute: () => void;
  onSchedule: () => void;
  onCopy: () => void;
};

const GroupActions = (props: Props) => {
  const { onDelete, onUpdate, onCopy, onExecute, onSchedule } = props;
  return (
    <DropdownMenu>
      <Button size={"icon_sm"} variant={"secondary"} asChild>
        <DropdownMenuTrigger>
          <LucideMoreVertical />
        </DropdownMenuTrigger>
      </Button>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExecute}>
          <LucidePlay /> Execute Commands
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopy}>
          <LucideClipboard /> Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSchedule}>
          <LucideClock /> Schedule
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
