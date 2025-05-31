import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LucideCog } from "lucide-react";

import { ImportExport } from "./import-export";
import { Startup } from "./startup";

type Props = {};

const SettingsDropdown = (props: Props) => {
  return (
    <DropdownMenu>
      <Button size="icon" variant="secondary" asChild>
        <DropdownMenuTrigger>
          <LucideCog />
        </DropdownMenuTrigger>
      </Button>
      <DropdownMenuContent align="end">
        <ImportExport />
        <DropdownMenuSeparator />
        <Startup />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;
