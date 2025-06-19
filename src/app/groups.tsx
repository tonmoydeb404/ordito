import CommandCard from "@/components/cards/command";
import GroupCard from "@/components/cards/group";
import CreateScheduleModal from "@/components/modals/command-schedule";
import CreateCommandModal from "@/components/modals/create-command";
import DeleteCommandModal from "@/components/modals/delete-command";
import DeleteGroupModal from "@/components/modals/delete-group";
import UpdateCommandModal from "@/components/modals/update-command";
import UpdateGroupModal from "@/components/modals/update-group";
import { useSearchContext } from "@/contexts/search";
import useMasonry from "@/hooks/use-masonry";
import { useModal } from "@/hooks/use-modal";
import { TCommandGroup, TCommmand } from "@/types/command";

type Props = {};

const GroupsSection = (props: Props) => {
  const { filteredGroups } = useSearchContext();
  const columns = useMasonry({ items: filteredGroups });

  const updateGroupModal = useModal<TCommandGroup>();
  const deleteGroupModal = useModal<TCommandGroup>();

  const createCommandModal = useModal<TCommandGroup>();
  const updateCommandModal = useModal<{
    group: TCommandGroup;
    command: TCommmand;
  }>();
  const deleteCommandModal = useModal<{
    group: TCommandGroup;
    command: TCommmand;
  }>();
  const scheduleCommandModal = useModal<{
    group: TCommandGroup;
    command: TCommmand;
  }>();

  return (
    <>
      <div
        className="grid my-16 container mx-auto gap-x-3 gap-y-5 px-5 md:px-0"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-4 flex-1 shrink-0">
            {col.map((item) => (
              <GroupCard
                data={item}
                key={item.id}
                onCommandCreate={() => createCommandModal.open(item)}
                onDelete={() => deleteGroupModal.open(item)}
                onUpdate={() => updateGroupModal.open(item)}
              >
                {item.commands.map((command) => (
                  <CommandCard
                    data={command}
                    key={command.id}
                    onDelete={() =>
                      deleteCommandModal.open({ command, group: item })
                    }
                    onUpdate={() =>
                      updateCommandModal.open({ command, group: item })
                    }
                    onSchedule={() =>
                      scheduleCommandModal.open({ command, group: item })
                    }
                  />
                ))}
              </GroupCard>
            ))}
          </div>
        ))}
      </div>

      <CreateCommandModal {...createCommandModal} />
      <UpdateCommandModal {...updateCommandModal} />
      <DeleteCommandModal {...deleteCommandModal} />

      <UpdateGroupModal {...updateGroupModal} />
      <DeleteGroupModal {...deleteGroupModal} />

      <CreateScheduleModal {...scheduleCommandModal} />
    </>
  );
};

export default GroupsSection;
