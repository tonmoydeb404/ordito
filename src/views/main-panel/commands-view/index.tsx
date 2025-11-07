import { CommandsHeader } from "./commands-header";
import { CommandsList } from "./commands-list";
import { useCommandsFilter } from "./use-commands-filter";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useListCommandsQuery } from "@/store";
import type { CommandResponse } from "@/store/types";
import CommandEditor from "@/views/main-panel/commands-view/command-editor";
import { Terminal } from "lucide-react";
import { useState } from "react";

interface CommandsViewProps {
  commandId: string | null;
  folderId: string | null;
  onSelectCommand: (commandId: string) => void;
}

export default function CommandsView(props: CommandsViewProps) {
  const { commandId, folderId, onSelectCommand } = props;
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  // TODO: Track running commands via RTK Query or WebSocket
  const runningCommands = new Set<string>();

  const { data: commands = [], refetch } = useListCommandsQuery(
    { group_id: folderId ?? "" },
    { skip: !folderId }
  );

  // Filter and sort commands using custom hook
  const filteredCommands = useCommandsFilter({
    commands,
    sortBy,
    filterBy,
  });

  // TODO: Implement command execution via RTK Query mutations
  const executeCommand = (commandId: string) => {
    // Will use useExecuteCommandMutation hook
    console.log("Execute command:", commandId);
  };

  const stopCommand = (commandId: string) => {
    // Will use useCancelExecutionMutation hook
    console.log("Stop command:", commandId);
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

    // TODO: Get actual status from last execution log
    return (
      <span className="bg-success text-black px-1.5 py-0.5 rounded text-xs">
        ✓ Success
      </span>
    );
  };

  // Note: folder/group data would need to be fetched separately or joined
  const folderTitle = folderId ? "Current Group" : null;

  return (
    <div className="h-full flex">
      <ResizablePanelGroup direction="horizontal">
        {/* Commands List */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full border-r border-border">
            <CommandsHeader
              folderTitle={folderTitle}
              sortBy={sortBy}
              filterBy={filterBy}
              onSortChange={setSortBy}
              onFilterChange={setFilterBy}
              onRefresh={() => refetch()}
            />

            {/* Commands List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              <CommandsList
                commands={filteredCommands}
                selectedCommandId={commandId}
                runningCommands={runningCommands}
                onSelectCommand={onSelectCommand}
                onExecuteCommand={executeCommand}
                onStopCommand={stopCommand}
                getStatusBadge={getStatusBadge}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Command Editor */}
        <ResizablePanel defaultSize={50} minSize={30}>
          {commandId ? (
            <CommandEditor commandId={commandId} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Terminal className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a command to view details</p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
