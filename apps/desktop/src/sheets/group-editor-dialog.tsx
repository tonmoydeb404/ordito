import { IconPicker } from "@/components/icon-picker";
import { useModal } from "@/context/modal-context";
import { useOrdito } from "@/context/ordito-context";
import { Button } from "@packages/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/dialog";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { useEffect, useState } from "react";

export function GroupEditorDialog() {
  const { group } = useModal();
  const { create, update } = group;
  const { groups, createGroup, renameGroup } = useOrdito();

  const isOpen = create.isOpen || update.isOpen;
  const editingId = update.value;
  const editingGroup = editingId
    ? (groups.find((g) => g.id === editingId) ?? null)
    : null;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(editingGroup?.name ?? "");
    setIcon(editingGroup?.icon ?? null);
  }, [isOpen, editingGroup]);

  function close() {
    create.close();
    update.close();
  }

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (editingId) {
      await renameGroup(editingId, trimmed, icon);
    } else {
      await createGroup(trimmed, icon);
    }
    close();
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{editingId ? "Update group" : "New group"}</DialogTitle>
          <DialogDescription>
            {editingId
              ? "Update the details of this group."
              : "Create a new group to organize commands."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-4">
          <div className="grid gap-1.5">
            <Label htmlFor="group-name" className="text-[0.76rem]">
              Name
            </Label>
            <Input
              id="group-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="Group name"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-[0.76rem]">Icon</Label>
            <IconPicker value={icon} onValueChange={setIcon} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary">Cancel</Button>} />
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {editingId ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
