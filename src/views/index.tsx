import {
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CommandResponse, GroupResponse } from "@/store";
import { useState } from "react";
import MainPanel from "./main-panel";
import SidebarPanel from "./sidebar-panel";

function AppView() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCommand, setSelectedCommand] =
    useState<CommandResponse | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<GroupResponse | null>(
    null
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-mono text-sm overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <SidebarPanel
          isCollapsed={sidebarCollapsed}
          selectedGroup={selectedFolder}
          setSelectedGroup={setSelectedFolder}
          setCollapsed={setSidebarCollapsed}
        />

        <ResizableHandle />

        <MainPanel
          selectedCommand={selectedCommand}
          selectedGroup={selectedFolder}
          setSelectedCommand={setSelectedCommand}
        />
      </ResizablePanelGroup>
    </div>
  );
}

export default AppView;
