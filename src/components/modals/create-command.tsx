import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useCommandMutations } from "@/context/hooks";
import { TModalProps } from "@/hooks/use-modal";
import { TCommandGroup } from "@/types/command";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = TModalProps<TCommandGroup>;

function CreateCommandModal(props: Props) {
  const { close, isOpen, data } = props;
  const groupId = data?.id;

  const [label, setLabel] = useState("");
  const [cmd, setCmd] = useState("");
  const [isDetached, setIsDetached] = useState(false);

  const { addCommand, loading, clearError } = useCommandMutations();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLabel("");
      setCmd("");
      setIsDetached(false);
      clearError();
    }
  }, [isOpen, clearError]);

  const handleCreate = async () => {
    // Validation
    if (!label.trim()) {
      toast.error("Please enter a command label");
      return;
    }

    if (!cmd.trim()) {
      toast.error("Please enter a command");
      return;
    }

    if (!groupId) {
      toast.error("No group selected");
      return;
    }

    try {
      await addCommand(groupId, {
        label: label.trim(),
        cmd: cmd.trim(),
        is_detached: isDetached,
      });

      toast.success("Command created successfully!");
      close();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create command";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!loading) {
      close();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter (common for textarea)
    if (
      e.key === "Enter" &&
      e.ctrlKey &&
      !loading &&
      label.trim() &&
      cmd.trim()
    ) {
      handleCreate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Command</DialogTitle>
          <DialogDescription>
            Add a new command to this group. Use Ctrl+Enter to save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="command-label">Label</Label>
            <Input
              id="command-label"
              placeholder="e.g., Start Server, Build Project..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="command-cmd">Command</Label>
            <Textarea
              id="command-cmd"
              placeholder="e.g., npm run dev, cargo build --release..."
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-detached"
              checked={isDetached}
              onCheckedChange={(checked) => setIsDetached(checked as boolean)}
              disabled={loading}
            />
            <Label htmlFor="is-detached" className="text-sm">
              Run in background (detached)
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !label.trim() || !cmd.trim()}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Creating..." : "Create Command"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCommandModal;
