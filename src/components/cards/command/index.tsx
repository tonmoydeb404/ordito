import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCommandExecution } from "@/contexts/hooks";
import { TCommmand } from "@/types/command";
import { copyCommand } from "@/utils/clipboard";
import { LucidePlay } from "lucide-react";
import CommandActions from "./actions";

type Props = {
  data: TCommmand;
  onUpdate: () => void;
  onDelete: () => void;
  onSchedule: () => void;
};

const CommandCard = (props: Props) => {
  const { data, ...others } = props;
  const { executeCommand, executeCommandDetached } = useCommandExecution();

  const onExecute = () => {
    if (data.is_detached) {
      executeCommandDetached(data.cmd, data.label);
    } else {
      executeCommand(data.cmd, data.label);
    }
  };

  return (
    <div className="group border rounded-md p-3 space-y-2 transition-colors hover:border-primary/40 hover:bg-accent/40">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium truncate">{data.label}</span>
          {data.is_detached && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              detached
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon_xs" variant="ghost" onClick={onExecute}>
            <LucidePlay className="size-3.5" />
          </Button>
          <CommandActions
            {...others}
            onExecute={onExecute}
            onCopy={() => copyCommand(data)}
          />
        </div>
      </div>
      <code className="block text-xs break-all whitespace-pre-wrap bg-muted/60 rounded-[8px] px-2 py-1.5 font-mono">
        {data.cmd}
      </code>
    </div>
  );
};

export default CommandCard;
