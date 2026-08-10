import {
  CalendarClock,
  Command as CommandIcon,
  Folder,
  History,
  Settings,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { IconPreview } from "@/components/icon-picker";
import { useModal } from "@/context/modal-context";
import { useOrdito } from "@/context/ordito-context";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@packages/ui/components/command";

export function CommandPalette() {
  const navigate = useNavigate();
  const { groups } = useOrdito();
  const { command, settings } = useModal();

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key === "k") {
        event.preventDefault();
        command.open();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [command]);

  function go(path: string) {
    navigate(path);
    command.close();
  }

  return (
    <CommandDialog
      open={command.isOpen}
      onOpenChange={(open) => {
        if (!open) command.close();
      }}
    >
      <Command>
        <CommandInput placeholder="Search commands…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => go("/")}>
              <CommandIcon />
              <span>Home</span>
            </CommandItem>
            <CommandItem onSelect={() => go("/schedules")}>
              <CalendarClock />
              <span>Schedules</span>
            </CommandItem>
            <CommandItem onSelect={() => go("/history")}>
              <History />
              <span>History</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                settings.open();
                command.close();
              }}
            >
              <Settings />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>

          {groups.length > 0 && (
            <CommandGroup heading="Groups">
              {groups
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((group) => (
                  <CommandItem
                    key={group.id}
                    onSelect={() => go(`/groups/${group.id}`)}
                  >
                    {group.icon ? (
                      <IconPreview iconKey={group.icon} className="size-4" />
                    ) : (
                      <Folder />
                    )}
                    <span>{group.name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
