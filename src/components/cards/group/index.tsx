import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { TCommandGroup } from "@/types/command";
import { LucidePlay, LucidePlus } from "lucide-react";
import CommandCard from "../command";
import GroupActions from "./actions";

type Props = {
  data: TCommandGroup;
  onCreate: () => void;
  onDelete: () => void;
  onUpdate: () => void;
};

const GroupCard = (props: Props) => {
  const { data, onCreate, onDelete, onUpdate } = props;
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-base font-medium">{data.title}</h3>
        <div className="flex items-center gap-2">
          <Button size={"icon_sm"} variant={"destructive"}>
            <LucidePlay />
          </Button>
          <GroupActions onDelete={onDelete} onUpdate={onUpdate} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.commands.map((command) => (
          <CommandCard data={command} key={command.id} />
        ))}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full shadow-none border border-dashed"
          size={"lg"}
          variant={"ghost"}
          onClick={onCreate}
        >
          <LucidePlus /> Add Command
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
