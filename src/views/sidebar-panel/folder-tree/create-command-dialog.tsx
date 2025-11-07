/**
 * Dialog component for creating new commands
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
import { useCreateCommandMutation } from "@/store/api/commands-api";
import type { GroupResponse } from "@/store/types";
import { Plus } from "lucide-react";
import { useState } from "react";

interface CreateCommandDialogProps {
  groups: GroupResponse[];
}

export function CreateCommandDialog({ groups }: CreateCommandDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [folderId, setFolderId] = useState<string>("");

  const [createCommand] = useCreateCommandMutation();

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      await createCommand({
        title: name,
        value: 'echo "Hello World"', // Default script
        command_group_id: folderId || "",
        working_dir: "",
        run_in_background: false,
        env_vars: "{}",
      }).unwrap();
      setName("");
      setFolderId("");
      setIsOpen(false);
      toast.success("Command created successfully");
    } catch (error) {
      toast.error("Failed to create command");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs font-medium"
          data-testid="button-new-command"
        >
          <Plus className="w-3 h-3 mr-1" />
          New Command
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Command</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="command-name">Command Name</Label>
            <Input
              id="command-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter command name"
              data-testid="input-command-name"
            />
          </div>
          <div>
            <Label htmlFor="command-folder">Folder</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger data-testid="select-command-folder">
                <SelectValue placeholder="Select folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No folder</SelectItem>
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
              data-testid="button-create-command"
            >
              Create
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              data-testid="button-cancel-command"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
