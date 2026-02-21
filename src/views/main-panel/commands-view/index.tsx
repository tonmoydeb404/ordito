import { CommandsHeader } from "./commands-header";
import { CommandsList } from "./commands-list";
import { useCommandsFilter } from "./use-commands-filter";

import StateWrapper from "@/components/common/state-wrapper";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useExecutionEvents } from "@/hooks/use-execution-events";
import {
  useCancelExecutionMutation,
  useExecuteCommandMutation,
  useListCommandsQuery,
  useListLogsQuery,
} from "@/store";
import type { CommandResponse, GroupResponse } from "@/store/types";
import CommandEditor from "@/views/main-panel/commands-view/command-editor";
import { FolderIcon, TerminalSquareIcon } from "lucide-react";
import { useState } from "react";

interface CommandsViewProps {
  selectedCommand: CommandResponse | null;
  selectedGroup: GroupResponse | null;
  onSelectCommand: (command: CommandResponse | null) => void;
}

export default function CommandsView(props: CommandsViewProps) {
  const { selectedCommand, selectedGroup, onSelectCommand } = props;
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");

  // Track running commands via Tauri events
  const { runningCommands } = useExecutionEvents();

  const {
    data: commands = [],
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useListCommandsQuery(
    { group_id: selectedGroup?.id ?? "" },
    { skip: !selectedGroup }
  );

  // Get logs to determine last execution status
  const { data: logs = [] } = useListLogsQuery({});

  // Filter and sort commands using custom hook
  const filteredCommands = useCommandsFilter({
    commands,
    sortBy,
    filterBy,
  });

  // Command execution mutations
  const [executeCommandMutation] = useExecuteCommandMutation();
  const [cancelExecutionMutation] = useCancelExecutionMutation();

  const executeCommand = async (commandId: string) => {
    try {
      await executeCommandMutation(commandId).unwrap();
      // Event listener will update runningCommands state
    } catch (error) {
      console.error("Failed to execute command:", error);
    }
  };

  const stopCommand = async (commandId: string) => {
    try {
      // Find the log_id for this command from logs
      const runningLog = logs.find(
        (log) => log.command_id === commandId && log.status === "running"
      );
      if (runningLog) {
        await cancelExecutionMutation(runningLog.id).unwrap();
      }
    } catch (error) {
      console.error("Failed to cancel execution:", error);
    }
  };

  const getStatusBadge = (command: CommandResponse) => {
    if (runningCommands.has(command.id)) {
      return (
        <span className="bg-warning text-black px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse-subtle" />
          Running
        </span>
      );
    }

    // Get actual status from last execution log
    const lastLog = logs
      .filter((log) => log.command_id === command.id)
      .sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )[0];

    if (!lastLog) return null;

    switch (lastLog.status) {
      case "success":
        return (
          <span className="bg-success text-black px-1.5 py-0.5 rounded text-xs">
            ✓ Success
          </span>
        );
      case "failed":
        return (
          <span className="bg-destructive text-white px-1.5 py-0.5 rounded text-xs">
            ✗ Failed
          </span>
        );
      case "timeout":
        return (
          <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-xs">
            ⏱ Timeout
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">
            ⊘ Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex">
      <ResizablePanelGroup direction="horizontal">
        {/* Commands List */}
        <ResizablePanel defaultSize={50} minSize={30}>
          {selectedGroup ? (
            <div className="flex flex-col h-full border-r border-border">
              <CommandsHeader
                sortBy={sortBy}
                filterBy={filterBy}
                onSortChange={setSortBy}
                onFilterChange={setFilterBy}
                onRefresh={() => refetch()}
                group={selectedGroup}
              />

              {/* Commands List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
                <StateWrapper
                  isLoading={isLoading}
                  isError={isError}
                  isSuccess={isSuccess}
                  isEmpty={
                    !selectedGroup ||
                    (isSuccess && filteredCommands.length === 0)
                  }
                  data={filteredCommands}
                  render={(cmds) => (
                    <CommandsList
                      commands={cmds}
                      selectedCommand={selectedCommand}
                      runningCommands={runningCommands}
                      onSelectCommand={onSelectCommand}
                      onExecuteCommand={executeCommand}
                      onStopCommand={stopCommand}
                      getStatusBadge={getStatusBadge}
                    />
                  )}
                  variant="default"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a folder to view commands</p>
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle />

        {/* Command Editor */}
        <ResizablePanel defaultSize={50} minSize={30}>
          {selectedCommand ? (
            <CommandEditor
              commandId={selectedCommand?.id}
              onDelete={() => onSelectCommand(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <TerminalSquareIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a command to view details</p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
