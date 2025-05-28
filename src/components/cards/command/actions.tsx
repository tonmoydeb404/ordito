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

type Props = {};

const CommandActions = (props: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size={"icon_xs"} variant={"ghost"}>
          <LucideMoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <LucidePlay /> Execute
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LucideEdit /> Update Command
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <LucideTrash /> Remove Command
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CommandActions;
