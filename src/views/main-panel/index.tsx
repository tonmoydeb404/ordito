import { ResizablePanel } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommandResponse, GroupResponse } from "@/store";
import { Clock, History, Terminal } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import CommandsView from "./commands-view";
import LogsView from "./log-view";
import ScheduleView from "./schedule-view";

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
  selectedGroup: GroupResponse | null;
  selectedCommand: CommandResponse | null;
  setSelectedCommand: Dispatch<SetStateAction<CommandResponse | null>>;
};

const MainPanel = (props: Props) => {
  const { selectedGroup, setSelectedCommand, selectedCommand } = props;
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
              selectedCommand={selectedCommand}
              selectedGroup={selectedGroup}
              onSelectCommand={setSelectedCommand}
            />
          </TabsContent>

          <TabsContent value="logs" className="flex-1 m-0">
            <LogsView selectedGroup={selectedGroup} />
          </TabsContent>

          <TabsContent value="schedules" className="flex-1 m-0">
            <ScheduleView selectedGroup={selectedGroup} />
          </TabsContent>
        </Tabs>
      </div>
    </ResizablePanel>
  );
};

export default MainPanel;
