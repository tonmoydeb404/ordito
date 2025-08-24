import GroupCreateModal from "@/components/modals/group/create";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LucideFolderPlus } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [groupCreateModal, setGroupCreateModal] = useState(false);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={() => setGroupCreateModal(true)}
            variant={"outline"}
            size={"icon"}
          >
            <LucideFolderPlus className="text-primary" />
          </Button>
          <GroupCreateModal
            onOpenChange={setGroupCreateModal}
            open={groupCreateModal}
          />
        </div>
      </div>
    </header>
  );
}
