import { CommandDetailPanel } from "@/components/command-detail-panel";
import { CommandsToolbar } from "@/components/commands-toolbar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@packages/ui/components/resizable";
import { CommandsScreen } from "@/screens/commands";
import { useDefaultLayout } from "react-resizable-panels";
import { Outlet } from "react-router-dom";

export function CommandsLayout() {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "ordito-commands-split",
    panelIds: ["commands-list", "commands-detail"],
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    onlySaveAfterUserInteractions: true,
  });

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <ResizablePanelGroup
        orientation="horizontal"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        className="h-full"
      >
        <ResizablePanel
          id="commands-list"
          defaultSize="62"
          minSize="34"
          className="scrollbar-thin"
        >
          <CommandsToolbar />
          <div className="p-4">
            <CommandsScreen />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          id="commands-detail"
          defaultSize="38"
          minSize="24"
          className="overflow-hidden"
        >
          <CommandDetailPanel />
        </ResizablePanel>
      </ResizablePanelGroup>

      <Outlet />
    </div>
  );
}
