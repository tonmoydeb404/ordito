import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { TCommandGroup } from "@/types/command";
import { LucidePlay, LucidePlus } from "lucide-react";
import CommandActions from "./command-actions";
import GroupActions from "./group-actions";

type Props = {
  data: TCommandGroup;
};

const GroupItem = (props: Props) => {
  const { data } = props;
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-base font-medium">{data.title}</h3>
        <div className="flex items-center gap-2">
          <Button size={"icon_sm"} variant={"subtle_destructive"}>
            <LucidePlay />
          </Button>
          <GroupActions />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.commands.map((command) => (
          <div
            key={command.id}
            className="bg-muted/10 dark:bg-accent/40 border py-2 px-2.5 rounded-lg flex items-start"
          >
            <div className="flex flex-col grow">
              <span className="text-[11px] font-light text-muted-foreground mb-1">
                {command.label}
              </span>
              <code className="text-xs">{command.cmd}</code>
            </div>

            <div className="flex items-center gap-x-1">
              <CommandActions />
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full shadow-none border border-dashed"
          size={"lg"}
          variant={"ghost"}
        >
          <LucidePlus /> Add Command
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupItem;
