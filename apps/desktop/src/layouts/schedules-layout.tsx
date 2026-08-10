import { ScheduleDetailPanel } from "@/components/schedule-detail-panel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@packages/ui/components/resizable";
import { SchedulesScreen } from "@/screens/schedules";
import { useDefaultLayout } from "react-resizable-panels";

export function SchedulesLayout() {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "ordito-schedules-split",
    panelIds: ["schedules-list", "schedules-detail"],
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
          id="schedules-list"
          defaultSize="62"
          minSize="34"
          className="scrollbar-thin"
        >
          <SchedulesScreen />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          id="schedules-detail"
          defaultSize="38"
          minSize="24"
          className="overflow-hidden"
        >
          <ScheduleDetailPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
