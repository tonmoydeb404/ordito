import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCommandMutations } from "@/contexts/hooks";
import { TModalProps } from "@/hooks/use-modal";
import { TCommandGroup, TCommmand } from "@/types/command";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = TModalProps<{ group: TCommandGroup; command: TCommmand }>;

function DeleteCommandModal(props: Props) {
  const { close, isOpen, data } = props;

  const command = data?.command ?? null;
  const group = data?.group ?? null;
  const groupId = group?.id ?? null;
  const commandId = command?.id ?? null;

  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteCommand } = useCommandMutations();

  const handleDelete = async () => {
    if (!groupId || !commandId || !command) {
      toast.error("Command not found");
      close();
      return;
    }

    try {
      setIsDeleting(true);
      await deleteCommand(groupId, commandId);
      toast.success(`Command "${command.label}" deleted successfully!`);
      close();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete command";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      close();
    }
  };

  if (!command || !group) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Command</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              Are you sure you want to delete the command{" "}
              <span className="font-semibold">"{command.label}"</span> from
              group <span className="font-semibold">"{group.title}"</span>?
            </span>

            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="text-xs text-muted-foreground mb-1">Command:</div>
              <code className="text-sm font-mono break-all whitespace-pre-wrap">
                {command.cmd}
              </code>
              {command.is_detached && (
                <div className="text-xs text-muted-foreground mt-1">
                  • Runs in background (detached)
                </div>
              )}
            </div>

            <span className="block text-sm">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete Command"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteCommandModal;
