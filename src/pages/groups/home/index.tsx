import GroupCard from "@/components/cards/group";
import { useGetCommandGroupsQuery } from "@/store/api/commands-api";

type Props = {};

const GroupsPage = (_props: Props) => {
  const { data: groups = [], isLoading, error } = useGetCommandGroupsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-red-500">Error loading groups</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <p className="text-muted-foreground">Manage your command groups</p>
      </div>

      <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <GroupCard data={group} key={group.id} />
        ))}
      </div>
    </div>
  );
};

export default GroupsPage;
