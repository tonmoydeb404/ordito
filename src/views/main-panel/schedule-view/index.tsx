import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  useListCommandsQuery,
  useListSchedulesQuery,
  useToggleNotificationMutation,
  useUpdateScheduleMutation,
} from "@/store";
import type { GroupResponse, ScheduleResponse } from "@/store/types";
import { ClockIcon, FolderIcon } from "lucide-react";
import { useState } from "react";
import { ScheduleDetail } from "./schedule-detail";
import { SchedulesHeader } from "./schedules-header";
import { SchedulesList } from "./schedules-list";

interface ScheduleViewProps {
  selectedGroup: GroupResponse | null;
}

function ScheduleView({ selectedGroup }: ScheduleViewProps) {
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Get commands for the selected group
  const { data: commands = [] } = useListCommandsQuery(
    { group_id: selectedGroup?.id ?? "" },
    { skip: !selectedGroup }
  );

  // Get all schedules (we'll filter client-side)
  const {
    data: allSchedules = [],
    isLoading,
    isError,
    refetch,
  } = useListSchedulesQuery();

  // Filter schedules by commands in the selected group
  const groupCommandIds = new Set(commands.map((cmd) => cmd.id));
  const schedules = allSchedules.filter((schedule) =>
    groupCommandIds.has(schedule.command_id)
  );

  const [createSchedule] = useCreateScheduleMutation();
  const [updateSchedule] = useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();
  const [toggleNotification] = useToggleNotificationMutation();

  const handleSelectSchedule = (schedule: ScheduleResponse | null) => {
    setSelectedSchedule(schedule);
    setIsCreating(false);
  };

  const handleCreateSchedule = () => {
    setIsCreating(true);
    setSelectedSchedule(null);
  };

  const handleSaveSchedule = async (scheduleData: {
    command_id: string;
    cron_expression: string;
    show_notification: boolean;
  }) => {
    try {
      if (selectedSchedule) {
        // Update existing schedule
        await updateSchedule({
          id: selectedSchedule.id,
          ...scheduleData,
        }).unwrap();
      } else {
        // Create new schedule
        await createSchedule(scheduleData).unwrap();
      }
      setSelectedSchedule(null);
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteSchedule(scheduleId).unwrap();
      if (selectedSchedule?.id === scheduleId) {
        setSelectedSchedule(null);
      }
      refetch();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  const handleToggleNotification = async (scheduleId: string) => {
    try {
      await toggleNotification(scheduleId).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to toggle notification:", error);
    }
  };

  return (
    <div className="h-full flex">
      <ResizablePanelGroup direction="horizontal">
        {/* Schedules List */}
        <ResizablePanel defaultSize={50} minSize={30}>
          {selectedGroup ? (
            <div className="flex flex-col h-full border-r border-border">
              <SchedulesHeader
                group={selectedGroup}
                onRefresh={refetch}
                onCreateSchedule={handleCreateSchedule}
              />

              {/* Schedules List */}
              <ScrollArea className="flex-1 w-full h-0">
                <SchedulesList
                  schedules={schedules}
                  commands={commands}
                  selectedSchedule={selectedSchedule}
                  onSelectSchedule={handleSelectSchedule}
                  onToggleNotification={handleToggleNotification}
                  onDeleteSchedule={handleDeleteSchedule}
                />
              </ScrollArea>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a folder to view schedules</p>
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle />

        {/* Schedule Detail/Form */}
        <ResizablePanel defaultSize={50} minSize={30}>
          {selectedGroup ? (
            <ScheduleDetail
              schedule={selectedSchedule}
              commands={commands}
              isCreating={isCreating}
              onSave={handleSaveSchedule}
              onCancel={() => {
                setSelectedSchedule(null);
                setIsCreating(false);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a folder to manage schedules</p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ScheduleView;
