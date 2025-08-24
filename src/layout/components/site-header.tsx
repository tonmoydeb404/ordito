import { CommandCreateModal } from "@/components/modals/command/create";
import GroupCreateModal from "@/components/modals/group/create";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LucideFolderPlus, LucideTerminalSquare } from "lucide-react";
import SiteBreadcrumb from "./site-breadcrumb";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <SiteBreadcrumb />
        <div className="ml-auto flex items-center gap-2">
          <CommandCreateModal
            trigger={
              <Button variant={"outline"} size={"icon"}>
                <LucideTerminalSquare className="text-primary" />
              </Button>
            }
          />
          <GroupCreateModal
            trigger={
              <Button variant={"outline"} size={"icon"}>
                <LucideFolderPlus className="text-primary" />
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
}
