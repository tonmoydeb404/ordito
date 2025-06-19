import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useScheduleMutations } from "@/contexts/hooks/schedule";
import { TModalProps } from "@/hooks/use-modal";
import { TSchedule } from "@/types/command";
import { toast } from "sonner";

export default function ScheduleDeleteModal({
  isOpen,
  close,
  data,
}: TModalProps<TSchedule>) {
  const { deleteSchedule, loading } = useScheduleMutations();

  const handleDelete = async () => {
    try {
      if (!data?.id) {
        throw new Error("Schedule id not found");
      }
      await deleteSchedule(data.id);
      toast.success("Schedule deleted");
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && close()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Schedule</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the schedule set for{" "}
            <strong>
              {new Date(data?.scheduled_time || new Date()).toLocaleString()}
            </strong>
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
