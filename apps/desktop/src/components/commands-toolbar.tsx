import { IconPreview } from "@/components/icon-picker";
import { useModal } from "@/context/modal-context";
import { useOrdito } from "@/context/ordito-context";
import { useCommandsView } from "@/hooks/use-commands-view";
import { Button } from "@packages/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { confirm } from "@tauri-apps/plugin-dialog";
import { Folder, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CommandsToolbar() {
  const { activeGroupId, activeGroup } = useCommandsView();
  const { group } = useModal();
  const { groups, commands, deleteGroup, startCreateCommand } = useOrdito();
  const navigate = useNavigate();
  const activeGroupIcon =
    groups.find((g) => g.id === activeGroupId)?.icon ?? null;

  async function handleDeleteGroup() {
    if (!activeGroupId) return;
    const target = groups.find((g) => g.id === activeGroupId);
    const commandCount = commands.filter(
      (c) => c.groupId === activeGroupId,
    ).length;
    const message = `Delete "${target?.name ?? "this group"}"?${
      commandCount > 0
        ? ` This will also delete ${commandCount} command${commandCount > 1 ? "s" : ""} inside it.`
        : ""
    } This cannot be undone.`;

    const confirmed = await confirm(message, {
      title: "Delete group",
      kind: "warning",
      okLabel: "Delete",
    });
    if (!confirmed) return;

    await deleteGroup(activeGroupId);
    navigate("/");
  }

  return (
    <div className="mb-3 flex items-center justify-between gap-3 p-4 border-b">
      <div className="flex min-w-0 items-center gap-2">
        {activeGroupIcon ? (
          <IconPreview
            iconKey={activeGroupIcon}
            className="size-3.5 shrink-0 text-muted-foreground"
          />
        ) : (
          <Folder size={15} className="shrink-0 text-muted-foreground" />
        )}
        <h2 className="truncate text-sm font-semibold">
          {activeGroup ?? "Commands"}
        </h2>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" onClick={startCreateCommand}>
          <Plus size={14} />
          New command
        </Button>
        {activeGroupId && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Manage ${activeGroup}`}
                />
              }
            >
              <MoreHorizontal size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuItem
                onClick={() => group.update.open(activeGroupId)}
              >
                <Pencil size={13} />
                Update group
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDeleteGroup}
              >
                <Trash2 size={13} />
                Delete group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
