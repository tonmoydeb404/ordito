import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CommandResponse, LogResponse } from "@/store/types";
import { FileCodeIcon, XIcon } from "lucide-react";
import { LogDetail } from "./log-detail";

interface LogTabsProps {
  openLogs: LogResponse[];
  commands: CommandResponse[];
  onCloseLog: (logId: string) => void;
  currentLog: string | null;
  setCurrentLog: (logId: string | null) => void;
}

export function LogTabs(props: LogTabsProps) {
  const { openLogs, commands, onCloseLog, currentLog, setCurrentLog } = props;

  const getCommandForLog = (log: LogResponse) => {
    return commands.find((cmd) => cmd.id === log.command_id);
  };

  if (openLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <FileCodeIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select a log to view details</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs
      className="flex flex-col h-full"
      onValueChange={setCurrentLog}
      value={currentLog ?? undefined}
    >
      <ScrollArea>
        <TabsList className="w-full flex items-center justify-start! border-0 rounded-none p-0">
          {openLogs.map((log) => {
            const command = getCommandForLog(log);
            return (
              <TabsTrigger
                key={log.id}
                value={log.id}
                className="w-auto grow-0 min-w-[100px] px-2 justify-between rounded-none"
              >
                <span className="truncate max-w-32">
                  {command?.title || "Unknown Command"}
                </span>
                <button
                  className="p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseLog(log.id);
                  }}
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {openLogs.map((log) => {
        const command = getCommandForLog(log);
        return (
          <TabsContent
            key={log.id}
            value={log.id}
            className="flex-1 m-0 overflow-hidden"
          >
            {command ? (
              <ScrollArea className="h-full w-full">
                <LogDetail
                  log={log}
                  command={command}
                  onClose={() => onCloseLog(log.id)}
                />
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 opacity-50">⚠️</div>
                  <p className="text-sm">Command not found</p>
                </div>
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
