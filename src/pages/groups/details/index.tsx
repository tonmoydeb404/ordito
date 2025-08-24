import CommandCard from "@/components/cards/command";
import { Button } from "@/components/ui/button";
import {
  useExecuteCommandGroupMutation,
  useGetCommandGroupByIdQuery,
  useGetCommandsByGroupQuery,
} from "@/store/api/commands-api";
import { ClockIcon, HashIcon, LoaderIcon, PlayIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

type Props = {};

const GroupDetailsPage = (_props: Props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isExecutingGroup, setIsExecutingGroup] = useState(false);

  const {
    data: commands = [],
    isLoading: commandsLoading,
    error: commandsError,
  } = useGetCommandsByGroupQuery(id);

  const {
    data: currentGroup,
    isLoading: groupLoading,
    error: groupError,
  } = useGetCommandGroupByIdQuery(id || "", {
    skip: !id,
  });

  const [executeCommandGroup] = useExecuteCommandGroupMutation();

  const isLoading = commandsLoading || groupLoading;
  const error = commandsError || groupError;

  const handleExecuteGroup = async () => {
    if (!id) return;

    setIsExecutingGroup(true);
    try {
      await executeCommandGroup({ id }).unwrap();
      toast.success("Group commands executed successfully");
    } catch (error) {
      toast.error("Failed to execute group commands");
      console.error("Failed to execute group commands:", error);
    } finally {
      setIsExecutingGroup(false);
    }
  };

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
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {currentGroup?.name || "Group Commands"}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <HashIcon className="h-4 w-4" />
                {commands.length} commands
              </div>
              {currentGroup?.created_at && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Created{" "}
                  {new Date(currentGroup.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {commands.length > 0 && (
            <Button
              onClick={handleExecuteGroup}
              disabled={isExecutingGroup}
              className="shrink-0"
            >
              {isExecutingGroup ? (
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              Execute All Commands
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commands.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              No commands found in this group
            </p>
          </div>
        ) : (
          commands.map((command) => {
            return <CommandCard data={command} key={command.id} />;
          })
        )}
      </div>
    </div>
  );
};

export default GroupDetailsPage;
