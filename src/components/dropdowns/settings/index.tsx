import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LucideCog } from "lucide-react";

import { Updater } from "@/components/updater";
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
      <DropdownMenuContent align="end" className="w-80">
        <Updater checkOnMount={false} />
        <DropdownMenuSeparator />
        <ImportExport />
        <DropdownMenuSeparator />
        <Startup />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;
