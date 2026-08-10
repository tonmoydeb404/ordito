import { CommandRow } from "@/components/command-row";
import { EmptyState } from "@/components/empty-state";
import { useOrdito } from "@/context/ordito-context";
import { useCommandsView } from "@/hooks/use-commands-view";
import { Search, SquareTerminal } from "lucide-react";

export function CommandsScreen() {
  const {
    commands,
    selectedCommand,
    selectCommand,
    editCommand,
    runCommand,
    deleteCommand,
    query,
  } = useOrdito();

  const { filteredCommands, activeGroupId, activeGroup } = useCommandsView();

  if (!activeGroupId) return null;

  const hasCommands = commands.length > 0;
  const hasResults = filteredCommands.length > 0;

  if (!hasCommands) {
    return (
      <EmptyState
        icon={<SquareTerminal size={24} />}
        title="No commands yet"
        description="Click the + button to save your first command."
      />
    );
  }

  if (!hasResults) {
    return (
      <EmptyState
        icon={<Search size={24} />}
        title="No commands found"
        description={
          query
            ? `Nothing matches "${query}".`
            : `No commands in "${activeGroup}".`
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-inset">
      {filteredCommands.map((cmd) => (
        <CommandRow
          key={cmd.id}
          command={cmd}
          selected={cmd.id === selectedCommand?.id}
          onSelect={() => selectCommand(cmd.id)}
          onRun={() => runCommand(cmd.id)}
          onEdit={() => editCommand(cmd.id)}
          onDelete={() => deleteCommand(cmd.id)}
        />
      ))}
    </div>
  );
}
