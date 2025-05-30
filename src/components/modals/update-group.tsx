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
import { useGroupMutations } from "@/context/hooks";
import { TModalProps } from "@/hooks/use-modal";
import { TCommandGroup } from "@/types/command";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = TModalProps<TCommandGroup>;

function UpdateGroupModal(props: Props) {
  const { close, isOpen, data } = props;

  const group = data ?? null;
  const groupId = data?.id;

  const [title, setTitle] = useState("");
  const { updateGroup, loading, clearError } = useGroupMutations();

  // Initialize form with current group title when modal opens
  useEffect(() => {
    if (isOpen && group) {
      setTitle(group.title);
      clearError();
    }
  }, [isOpen, group, clearError]);

  const handleUpdate = async () => {
    // Validation
    if (!title.trim()) {
      toast.error("Please enter a group title");
      return;
    }

    if (!groupId || !group) {
      toast.error("Group not found");
      close();
      return;
    }

    // Check if title actually changed
    if (title.trim() === group.title) {
      toast.info("No changes made");
      close();
      return;
    }

    try {
      await updateGroup(groupId, title.trim());
      toast.success("Group updated successfully!");
      close();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update group";
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
      handleUpdate();
    }
  };

  // Don't render if group not found
  if (!group) {
    return null;
  }

  const hasChanges = title.trim() !== group.title && title.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Group</DialogTitle>
          <DialogDescription>
            Edit the title for "{group.title}".
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
              className={hasChanges ? "border-primary" : ""}
            />
          </div>

          {hasChanges && (
            <div className="text-xs text-muted-foreground">
              Press Enter to save changes
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading || !title.trim() || !hasChanges}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Updating..." : "Update Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateGroupModal;
