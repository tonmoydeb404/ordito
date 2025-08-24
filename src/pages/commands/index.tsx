import CommandCard from "@/components/cards/command";
import { useGetCommandsQuery } from "@/store/api/commands-api";

type Props = {};

const CommandsPage = (_props: Props) => {
  const { data: commands = [], isLoading, error } = useGetCommandsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold">Commands</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold">Commands</h1>
          <p className="text-red-500">Error loading commands</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Commands</h1>
        <p className="text-muted-foreground">Manage your commands</p>
      </div>

      <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commands.map((command) => (
          <CommandCard data={command} key={command.id} />
        ))}
      </div>
    </div>
  );
};

export default CommandsPage;
