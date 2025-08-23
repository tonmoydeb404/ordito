import { useState, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Search, Play, Settings as SettingsIcon } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useCommands } from '@/hooks/use-commands';
import { KEYBOARD_SHORTCUTS } from '@/lib/constants';
import { CommandStatusBadge } from '@/components/command/command-status';

interface CommandPaletteProps {
  onOpenSettings?: () => void;
}

export function CommandPalette({ onOpenSettings }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { commands, executeCommand, searchCommands } = useCommands();
  
  useHotkeys(KEYBOARD_SHORTCUTS.COMMAND_PALETTE, useCallback(() => {
    setOpen(true);
  }, []), {
    preventDefault: true,
    enableOnContentEditable: true,
  });
  
  const filteredCommands = search ? searchCommands(search) : commands;
  
  const handleSelect = useCallback(async (commandId: string) => {
    await executeCommand(commandId);
    setOpen(false);
    setSearch('');
  }, [executeCommand]);
  
  const handleOpenSettings = useCallback(() => {
    onOpenSettings?.();
    setOpen(false);
    setSearch('');
  }, [onOpenSettings]);
  
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search commands..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>
        
        {filteredCommands.length > 0 && (
          <CommandGroup heading="Commands">
            {filteredCommands.slice(0, 8).map((command) => (
              <CommandItem
                key={command.id}
                value={command.id}
                onSelect={() => handleSelect(command.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Play className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{command.name}</span>
                    {command.description && (
                      <span className="text-xs text-muted-foreground">
                        {command.description}
                      </span>
                    )}
                  </div>
                </div>
                <CommandStatusBadge status={command.status} />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        <CommandSeparator />
        
        <CommandGroup heading="Actions">
          {onOpenSettings && (
            <CommandItem onSelect={handleOpenSettings}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Open Settings
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}