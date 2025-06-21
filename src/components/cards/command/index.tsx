import { useCommandExecution } from "@/contexts/hooks";
import { TCommmand } from "@/types/command";
import { copyCommand } from "@/utils/clipboard";
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

  return (
    <div className="bg-muted/10 dark:bg-accent/40 border py-2 px-2.5 rounded-lg flex items-start">
      <div className="flex flex-col grow">
        <span className="text-xs font-light text-muted-foreground mb-1">
          {data.label}
        </span>
        <code className="text-xs break-all whitespace-pre-wrap">
          {data.cmd}
        </code>
      </div>

      <div className="flex items-center gap-x-1">
        <CommandActions
          {...others}
          onExecute={() => {
            if (data.is_detached) {
              executeCommandDetached(data.cmd, data.label);
            } else {
              executeCommand(data.cmd, data.label);
            }
          }}
          onCopy={() => {
            copyCommand(data);
          }}
        />
      </div>
    </div>
  );
};

export default CommandCard;
