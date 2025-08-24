import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Command } from "@/types";
import { Calendar, Copy, Edit, LucideMoreVertical, Trash2 } from "lucide-react";

type Props = {
  data: Command;
};

const Actions = (_props: Props) => {
  // const { data } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} variant={"secondary"}>
          <LucideMoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Calendar className="h-4 w-4" />
          Schedule command
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="h-4 w-4" />
          Update details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Trash2 className="h-4 w-4" />
          Delete command
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="h-4 w-4" />
          Duplicate command
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Actions;
