import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useCommandExecution } from "@/contexts/hooks";
import { TCommandGroup } from "@/types/command";
import { copyAsShellScript } from "@/utils/clipboard";
import { LucideClock, LucidePlay, LucidePlus } from "lucide-react";
import { ReactNode } from "react";
import GroupActions from "./actions";

type Props = {
  data: TCommandGroup;
  onCommandCreate: () => void;
  onDelete: () => void;
  onUpdate: () => void;
  onSchedule: () => void;
  children: ReactNode;
};

const GroupCard = (props: Props) => {
  const { data, onCommandCreate, onDelete, onUpdate, children, onSchedule } =
    props;
  const { executeGroupCommands, loading } = useCommandExecution();

  const onExecute = () => {
    executeGroupCommands(data.id, data.title);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-base font-medium">{data.title}</h3>
        <div className="flex items-center gap-2">
          <Button
            size={"icon_sm"}
            variant={"destructive"}
            disabled={!data.commands.length || loading}
            onClick={onExecute}
          >
            <LucidePlay />
          </Button>
          <Button size={"icon_sm"} onClick={onSchedule}>
            <LucideClock />
          </Button>

          <GroupActions
            onDelete={onDelete}
            onUpdate={onUpdate}
            onExecute={onExecute}
            onCopy={() => {
              copyAsShellScript(data.commands, data.title);
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
      <CardFooter>
        <Button
          className="w-full shadow-none border border-dashed"
          size={"lg"}
          variant={"ghost"}
          onClick={onCommandCreate}
        >
          <LucidePlus /> Add Command
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
