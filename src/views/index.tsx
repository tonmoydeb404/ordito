import {
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";
import MainPanel from "./main-panel";
import SidebarPanel from "./sidebar-panel";

function AppView() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(
    null
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-background text-foreground font-mono text-sm overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <SidebarPanel
          isCollapsed={sidebarCollapsed}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          setCollapsed={setSidebarCollapsed}
          setSelectedCommandId={setSelectedCommandId}
        />

        <ResizableHandle />

        <MainPanel />
      </ResizablePanelGroup>
    </div>
  );
}

export default AppView;
