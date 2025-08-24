import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppDispatch } from "@/store/hooks";
import { setCommandCreate, setGroupCreate } from "@/store/slices/modals-slice";
import { LucideFolderPlus, LucideTerminalSquare } from "lucide-react";
import SiteBreadcrumb from "./site-breadcrumb";

export function SiteHeader() {
  const dispatch = useAppDispatch();

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
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => dispatch(setCommandCreate(true))}
          >
            <LucideTerminalSquare className="text-primary" />
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => dispatch(setGroupCreate(true))}
          >
            <LucideFolderPlus className="text-primary" />
          </Button>
        </div>
      </div>
    </header>
  );
}
