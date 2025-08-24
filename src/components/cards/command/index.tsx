import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useExecuteCommandMutation } from "@/store/api/commands-api";
import { Command } from "@/types";
import { ClockIcon, LoaderIcon, PlayIcon } from "lucide-react";
import Actions from "./actions";

type Props = {
  data: Command;
};

const CommandCard = (props: Props) => {
  const { data } = props;
  const [executeCommand, { isLoading }] = useExecuteCommandMutation();
  const lastExecuted = data.last_executed
    ? new Date(data.last_executed).toLocaleString()
    : "Never";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {data.name}
              {data.is_favorite && (
                <Badge variant="secondary" className="text-xs">
                  Favorite
                </Badge>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center justify-end gap-x-2 shrink-0">
            <Button
              size="icon"
              variant={"fade_primary"}
              onClick={() => executeCommand({ id: data.id })}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderIcon className="h-3 w-3 animate-spin" />
              ) : (
                <PlayIcon className="h-3 w-3" />
              )}
            </Button>
            <Actions data={data} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm">
            <h5 className="font-medium uppercase text-xs mb-1 text-muted-foreground">
              Command:
            </h5>
            <code className="block p-2 bg-muted rounded text-xs">
              {data.command}
            </code>
          </div>

          {data.working_directory && (
            <div className="text-sm">
              <h5 className="font-medium uppercase text-xs mb-1 text-muted-foreground">
                Directory:
              </h5>

              <code className="text-xs block bg-muted p-2 rounded">
                {data.working_directory}
              </code>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>Executed {data.execution_count} times</span>
          </div>
          <div>Last: {lastExecuted}</div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommandCard;
