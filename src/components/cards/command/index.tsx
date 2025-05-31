import { TCommmand } from "@/types/command";
import CommandActions from "./actions";

type Props = {
  data: TCommmand;
  onUpdate: () => void;
  onDelete: () => void;
  onExecute: () => void;
  onCopy: () => void;
};

const CommandCard = (props: Props) => {
  const { data, ...others } = props;
  return (
    <div className="bg-muted/10 dark:bg-accent/40 border py-2 px-2.5 rounded-lg flex items-start">
      <div className="flex flex-col grow">
        <span className="text-xs font-light text-muted-foreground mb-1">
          {data.label}
        </span>
        <code className="text-xs">{data.cmd}</code>
      </div>

      <div className="flex items-center gap-x-1">
        <CommandActions {...others} />
      </div>
    </div>
  );
};

export default CommandCard;
