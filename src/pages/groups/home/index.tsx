import { useNavigate } from "react-router";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import paths from "@/router/paths";
import { useGetCommandGroupsQuery } from "@/store/api/commands-api";

type Props = {};

const GroupsPage = (_props: Props) => {
  const navigate = useNavigate();
  const { data: groups = [], isLoading, error } = useGetCommandGroupsQuery();

  const handleGroupClick = (groupId: string) => {
    navigate(paths.groups.details(groupId));
  };

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
          <Card
            key={group.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleGroupClick(group.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: group.color ? group.color + '20' : '#f3f4f6' }}
                >
                  {group.icon || '📁'}
                </div>
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  {group.description && (
                    <CardDescription>{group.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupsPage;
