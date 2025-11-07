/**
 * Dialog component for creating new groups
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useCreateGroupMutation } from "@/store/api/groups-api";
import type { GroupResponse } from "@/store/types";
import { FolderPlus } from "lucide-react";
import { useState } from "react";

interface CreateGroupDialogProps {
  groups: GroupResponse[];
}

export function CreateGroupDialog({ groups }: CreateGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  const [createGroup] = useCreateGroupMutation();

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      await createGroup({
        title: name,
        parent_id: parentId || undefined,
      }).unwrap();
      setName("");
      setParentId("");
      setIsOpen(false);
      toast.success("Group created successfully");
    } catch (error) {
      toast.error("Failed to create group");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="px-3 py-2 text-xs"
          data-testid="button-new-folder"
        >
          <FolderPlus className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              data-testid="input-folder-name"
            />
          </div>
          <div>
            <Label htmlFor="parent-folder">Parent Folder</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger data-testid="select-parent-folder">
                <SelectValue placeholder="Select parent folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No parent</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              className="flex-1"
              data-testid="button-create-folder"
            >
              Create
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              data-testid="button-cancel-folder"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
