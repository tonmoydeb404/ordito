import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { TCommandGroup } from "@/types/command";
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
