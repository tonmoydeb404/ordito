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

type Props = {};

const GroupActions = (props: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size={"icon_sm"} variant={"subtle_dark"}>
          <LucideMoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <LucidePlay /> Execute Commands
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LucideEdit /> Update Title
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <LucideTrash /> Remove Group
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GroupActions;
