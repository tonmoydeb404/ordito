import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LucideEdit,
  LucideMoreHorizontal,
  LucidePlay,
  LucideTrash,
} from "lucide-react";

type Props = {
  onUpdate: () => void;
  onDelete: () => void;
  onExecute: () => void;
  onCopy: () => void;
};

const CommandActions = (props: Props) => {
  const { onDelete, onExecute, onUpdate } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size={"icon_xs"} variant={"ghost"}>
          <LucideMoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExecute}>
          <LucidePlay /> Execute
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
