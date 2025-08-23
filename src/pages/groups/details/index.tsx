import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetCommandsByGroupQuery } from "@/store/api/commands-api";
import { useNavigate, useParams } from "react-router";

type Props = {};

const GroupDetailsPage = (_props: Props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: commands = [],
    isLoading,
    error,
  } = useGetCommandsByGroupQuery(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back to Groups
          </Button>
          <h1 className="text-2xl font-bold">Group Details</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back to Groups
          </Button>
          <h1 className="text-2xl font-bold">Group Details</h1>
          <p className="text-red-500">Error loading group details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          ← Back to Groups
        </Button>
        <h1 className="text-2xl font-bold">Group Commands</h1>
        <p className="text-muted-foreground">Commands in this group</p>
      </div>

      <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commands.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              No commands found in this group
            </p>
          </div>
        ) : (
          commands.map((command) => (
            <Card
              key={command.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg">{command.name}</CardTitle>
                {command.description && (
                  <CardDescription>{command.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Command:</span>
                    <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                      {command.command}
                    </code>
                  </div>
                  {command.working_directory && (
                    <div className="text-sm">
                      <span className="font-medium">Directory:</span>
                      <span className="ml-2 text-muted-foreground">
                        {command.working_directory}
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Executed {command.execution_count} times
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupDetailsPage;
