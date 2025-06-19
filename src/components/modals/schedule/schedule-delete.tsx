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

export function ScheduleDeleteModal({
  isOpen,
  close,
  data,
}: TModalProps<TSchedule>) {
  if (!data) return null;
  const { deleteSchedule, loading } = useScheduleMutations();
  const handleDelete = async () => {
    try {
      await deleteSchedule(data.id);
      toast.success("Schedule deleted");
      close();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && close()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Schedule</DialogTitle>
          <DialogDescription>
            Delete scheduled at{" "}
            <strong>{new Date(data.scheduled_time).toLocaleString()}</strong>?
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
