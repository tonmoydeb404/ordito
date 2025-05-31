import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useCommandExecution } from "@/context/hooks";
import { TCommandGroup } from "@/types/command";
import { copyAsShellScript } from "@/utils/clipboard";
import { LucidePlay, LucidePlus } from "lucide-react";
import { ReactNode } from "react";
import GroupActions from "./actions";

type Props = {
  data: TCommandGroup;
  onCommandCreate: () => void;
  onDelete: () => void;
  onUpdate: () => void;
  children: ReactNode;
};

const GroupCard = (props: Props) => {
  const { data, onCommandCreate, onDelete, onUpdate, children } = props;
  const { executeGroupCommands } = useCommandExecution();
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-base font-medium">{data.title}</h3>
        <div className="flex items-center gap-2">
          <Button
            size={"icon_sm"}
            variant={"destructive"}
            disabled={!data.commands.length}
          >
            <LucidePlay />
          </Button>

          <GroupActions
            onDelete={onDelete}
            onUpdate={onUpdate}
            onExecute={() => {
              executeGroupCommands(data.id);
            }}
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
