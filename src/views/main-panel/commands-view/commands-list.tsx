import type { CommandResponse } from "@/store/types";
import { CommandCard } from "./command-card";
import { EmptyCommandsState } from "./empty-commands-state";

interface CommandsListProps {
  commands: CommandResponse[];
  selectedCommand: CommandResponse | null;
  runningCommands: Set<string>;
  onSelectCommand: (commandId: CommandResponse | null) => void;
  onExecuteCommand: (commandId: string) => void;
  onStopCommand: (commandId: string) => void;
  getStatusBadge: (command: CommandResponse) => React.ReactNode;
}

export function CommandsList({
  commands,
  selectedCommand,
  runningCommands,
  onSelectCommand,
  onExecuteCommand,
  onStopCommand,
  getStatusBadge,
}: CommandsListProps) {
  if (commands.length === 0) {
    return <EmptyCommandsState />;
  }

  return (
    <div className="space-y-3">
      {commands.map((command) => {
        const isSelected = selectedCommand?.id === command.id;
        const isRunning = runningCommands.has(command.id);

        return (
          <CommandCard
            key={command.id}
            command={command}
            isSelected={isSelected}
            isRunning={isRunning}
            onSelect={(command) => onSelectCommand(isSelected ? null : command)}
            onExecute={(command) => onExecuteCommand(command.id)}
            onStop={(command) => onStopCommand(command.id)}
            getStatusBadge={getStatusBadge}
          />
        );
      })}
    </div>
  );
}
