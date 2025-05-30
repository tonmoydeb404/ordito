import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LucideEdit,
  LucideMoreVertical,
  LucidePlay,
  LucideTrash,
} from "lucide-react";

type Props = {
  onDelete: () => void;
  onUpdate: () => void;
};

const GroupActions = (props: Props) => {
  const { onDelete, onUpdate } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size={"icon_sm"} variant={"secondary"}>
          <LucideMoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <LucidePlay /> Execute Commands
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
