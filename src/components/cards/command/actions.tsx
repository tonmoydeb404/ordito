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
  LucideMoreHorizontal,
  LucidePlay,
  LucideTrash,
} from "lucide-react";

type Props = {
  onUpdate: () => void;
  onDelete: () => void;
  onExecute: () => void;
  onSchedule: () => void;
  onCopy: () => void;
};

const CommandActions = (props: Props) => {
  const { onDelete, onExecute, onUpdate, onCopy, onSchedule } = props;
  return (
    <DropdownMenu>
      <Button size={"icon_xs"} variant={"ghost"} asChild>
        <DropdownMenuTrigger>
          <LucideMoreHorizontal />
        </DropdownMenuTrigger>
      </Button>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExecute}>
          <LucidePlay /> Execute
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSchedule}>
          <LucideClock /> Schedule
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopy}>
          <LucideClipboard /> Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUpdate}>
          <LucideEdit /> Update Command
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <LucideTrash /> Remove Command
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CommandActions;
