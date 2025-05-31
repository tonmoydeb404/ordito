import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGroupMutations } from "@/contexts/hooks";
import { TModalProps } from "@/hooks/use-modal";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = TModalProps<void>;

function CreateGroupModal(props: Props) {
  const { close, isOpen } = props;
  const [title, setTitle] = useState("");
  const { createGroup, loading, clearError } = useGroupMutations();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      clearError();
    }
  }, [isOpen, clearError]);

  const handleCreate = async () => {
    // Validation
    if (!title.trim()) {
      toast.error("Please enter a group title");
      return;
    }

    try {
      await createGroup(title.trim());
      toast.success("Group created successfully!");
      // Close modal on success
      close();
    } catch (err) {
      // Show error toast
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create group";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!loading) {
      close();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && title.trim()) {
      handleCreate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a new command group to organize your commands.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-title">Group Title</Label>
            <Input
              id="group-title"
              placeholder="Enter group title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || !title.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateGroupModal;
