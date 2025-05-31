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
import { useGroupMutations } from "@/context/hooks";
import { TModalProps } from "@/hooks/use-modal";
import { TCommandGroup } from "@/types/command";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = TModalProps<TCommandGroup>;

function DeleteGroupModal(props: Props) {
  const { close, isOpen, data } = props;
  const group = data ?? null;

  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteGroup } = useGroupMutations();

  const handleDelete = async () => {
    if (!group?.id || !group) {
      toast.error("Group not found");
      close();
      return;
    }

    try {
      setIsDeleting(true);
      await deleteGroup(group.id);
      toast.success(`Group "${group.title}" deleted successfully!`);
      close();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete group";
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

  if (!group) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Group</AlertDialogTitle>
          <AlertDialogDescription className="">
            <span>
              Are you sure you want to delete the group{" "}
              <span className="font-semibold">"{group.title}"</span>?
            </span>
            {group.commands.length > 0 && (
              <span className="text-destructive ml-1">
                This will also delete {group.commands.length} command
                {group.commands.length !== 1 ? "s" : ""} in this group.
              </span>
            )}
            <span className="ml-1">This action cannot be undone.</span>
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
            {isDeleting ? "Deleting..." : "Delete Group"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteGroupModal;
