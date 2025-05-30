import GroupCard from "@/components/cards/group";
import CreateCommandModal from "@/components/modals/create-command";
import { useAppContext } from "@/context";
import useMasonry from "@/hooks/use-masonry";
import { useModal } from "@/hooks/use-modal";
import { TCommandGroup } from "@/types/command";

type Props = {};

const GroupsSection = (props: Props) => {
  const { groups } = useAppContext();
  const columns = useMasonry({ items: groups });
  const createCommandModal = useModal<TCommandGroup>();

  return (
    <>
      <div
        className="grid my-16 container mx-auto gap-x-3 gap-y-5"
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
                onCreate={() => createCommandModal.open(item)}
              />
            ))}
          </div>
        ))}
      </div>

      <CreateCommandModal {...createCommandModal} />
    </>
  );
};

export default GroupsSection;
