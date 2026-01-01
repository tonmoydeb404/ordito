import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListCommandsQuery, useListLogsQuery } from "@/store";
import type { GroupResponse, LogResponse } from "@/store/types";
import { FileTextIcon, FolderIcon } from "lucide-react";
import { useState } from "react";
import { LogTabs } from "./log-tabs";
import { LogsHeader } from "./logs-header";
import { LogsList } from "./logs-list";

interface ExecutionLogProps {
  selectedGroup: GroupResponse | null;
}

function LogsView({ selectedGroup }: ExecutionLogProps) {
  const [commandFilter, setCommandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentLog, setCurrentLog] = useState<string | null>(null);
  const [openLogs, setOpenLogs] = useState<LogResponse[]>([]);

  // Get commands for the selected group
  const { data: commands = [] } = useListCommandsQuery(
    { group_id: selectedGroup?.id ?? "" },
    { skip: !selectedGroup }
  );

  // Get all logs (we'll filter client-side)
  const {
    data: allLogs = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useListLogsQuery();

  // Filter logs by commands in the selected group
  const groupCommandIds = new Set(commands.map((cmd) => cmd.id));
  const logs = allLogs.filter((log) => groupCommandIds.has(log.command_id));

  // Filter logs based on command and status
  const filteredLogs = logs.filter((log) => {
    // Command filter
    if (commandFilter !== "all" && log.command_id !== commandFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && log.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const handleSelectLog = (log: LogResponse) => {
    // Check if log is already open
    const isAlreadyOpen = openLogs.some((openLog) => openLog.id === log.id);

    if (!isAlreadyOpen) {
      setOpenLogs((prev) => [...prev, log]);
    }

    setCurrentLog(log.id);
  };

  const handleCloseLog = (logId: string) => {
    setOpenLogs((prev) => {
      const updatedLogs = prev.filter((log) => log.id !== logId);

      if (currentLog === logId) {
        const lastLog = updatedLogs[updatedLogs.length - 1];
        setCurrentLog(lastLog?.id ?? null);
      }

      return updatedLogs;
    });
  };

  return (
    <div className="h-full flex">
      <ResizablePanelGroup direction="horizontal">
        {/* Logs List */}
        <ResizablePanel defaultSize={50} minSize={30}>
          {selectedGroup ? (
            <div className="flex flex-col h-full border-r border-border">
              <LogsHeader
                commands={commands}
                commandFilter={commandFilter}
                statusFilter={statusFilter}
                onCommandFilterChange={setCommandFilter}
                onStatusFilterChange={setStatusFilter}
                onRefresh={refetch}
                isRefreshing={isLoading || isFetching}
                group={selectedGroup}
              />

              {/* Logs List */}
              <ScrollArea className="flex-1 w-full h-0">
                <LogsList
                  logs={filteredLogs}
                  commands={commands}
                  selectedGroup={!!selectedGroup}
                  onSelectLog={handleSelectLog}
                />
              </ScrollArea>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a folder to view logs</p>
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle />

        {/* Log Details */}
        <ResizablePanel defaultSize={50} minSize={30}>
          {selectedGroup ? (
            <LogTabs
              openLogs={openLogs}
              commands={commands}
              onCloseLog={handleCloseLog}
              currentLog={currentLog}
              setCurrentLog={setCurrentLog}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileTextIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a folder to view log details</p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default LogsView;
