import { ResizablePanel } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, History, Terminal } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import CommandsView from "./commands-view";

// ----------------------------------------------------------------------

const tabsList = [
  {
    icon: Terminal,
    title: "Commands",
    value: "commands",
  },
  {
    icon: History,
    title: "Execution Log",
    value: "logs",
  },
  {
    icon: Clock,
    title: "Schedules",
    value: "schedules",
  },
];

// ----------------------------------------------------------------------

type Props = {
  selectedFolderId: string | null;
  selectedCommandId: string | null;
  setSelectedCommandId: Dispatch<SetStateAction<string | null>>;
};

const MainPanel = (props: Props) => {
  const { selectedFolderId, setSelectedCommandId, selectedCommandId } = props;
  return (
    <ResizablePanel defaultSize={80}>
      <div className="flex flex-col h-full">
        {/* Tab Bar */}
        <Tabs defaultValue="commands" className="flex-1 flex flex-col">
          <div className="bg-secondary border-b border-border">
            <TabsList className="h-auto p-0 bg-transparent">
              {tabsList.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="px-4 py-3 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <item.icon className="w-3 h-3 mr-2" />
                  {item.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="commands" className="flex-1 m-0">
            <CommandsView
              commandId={selectedCommandId}
              folderId={selectedFolderId}
              onSelectCommand={setSelectedCommandId}
            />
          </TabsContent>

          <TabsContent value="logs" className="flex-1 m-0">
            {/* <ExecutionLog websocketMessage={lastMessage} /> */}
          </TabsContent>

          <TabsContent value="schedules" className="flex-1 m-0">
            {/* <ScheduleView /> */}
          </TabsContent>
        </Tabs>
      </div>
    </ResizablePanel>
  );
};

export default MainPanel;
