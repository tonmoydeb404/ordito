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
import { TCommandGroup, TCommmand } from "@/types/command";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = TModalProps<{ group: TCommandGroup; command: TCommmand }>;

function UpdateCommandModal(props: Props) {
  const { close, isOpen, data } = props;

  const command = data?.command ?? null;
  const groupId = data?.group?.id ?? null;
  const commandId = command?.id ?? null;

  const [label, setLabel] = useState("");
  const [cmd, setCmd] = useState("");
  const [isDetached, setIsDetached] = useState(false);

  const { updateCommand, loading, clearError } = useCommandMutations();

  // Initialize form with current command data when modal opens
  useEffect(() => {
    if (isOpen && command) {
      setLabel(command.label);
      setCmd(command.cmd);
      setIsDetached(command.is_detached || false);
      clearError();
    }
  }, [isOpen, command, clearError]);

  const handleUpdate = async () => {
    // Validation
    if (!label.trim()) {
      toast.error("Please enter a command label");
      return;
    }

    if (!cmd.trim()) {
      toast.error("Please enter a command");
      return;
    }

    if (!groupId || !commandId || !command) {
      toast.error("Command not found");
      close();
      return;
    }

    // Check if anything actually changed
    const hasChanges =
      label.trim() !== command.label ||
      cmd.trim() !== command.cmd ||
      isDetached !== (command.is_detached || false);

    if (!hasChanges) {
      toast.info("No changes made");
      close();
      return;
    }

    try {
      await updateCommand(groupId, commandId, {
        label: label.trim(),
        cmd: cmd.trim(),
        is_detached: isDetached,
      });

      toast.success("Command updated successfully!");
      close();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update command";
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
      handleUpdate();
    }
  };

  // Don't render if command not found
  if (!command) {
    return null;
  }

  const hasChanges =
    label.trim() !== command.label ||
    cmd.trim() !== command.cmd ||
    isDetached !== (command.is_detached || false);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Command</DialogTitle>
          <DialogDescription>
            Edit the command "{command.label}". Use Ctrl+Enter to save.
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
              className={label !== command.label ? "border-primary" : ""}
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
              className={`resize-none ${
                cmd !== command.cmd ? "border-primary" : ""
              }`}
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

          {hasChanges && (
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to save changes
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading || !label.trim() || !cmd.trim() || !hasChanges}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Updating..." : "Update Command"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateCommandModal;
