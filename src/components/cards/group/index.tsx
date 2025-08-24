import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import paths from "@/router/paths";
import { CommandGroup } from "@/types";
import { LucideFolder, LucideMoreVertical, LucidePlay } from "lucide-react";
import { useNavigate } from "react-router";

type Props = {
  data: CommandGroup;
};

const GroupCard = (props: Props) => {
  const { data } = props;
  const navigate = useNavigate();
  return (
    <Card
      className="p-4 flex flex-row items-start gap-3 cursor-pointer hover:border-primary duration-200 group"
      onClick={() => navigate(paths.groups.details(data.id))}
    >
      <div className="w-10 h-10 rounded-sm inline-flex items-center justify-center bg-accent duration-200">
        <LucideFolder style={{ color: data?.color || undefined }} />
      </div>
      <div>
        <CardTitle className="mb-1">{data.name}</CardTitle>
        <CardDescription className="text-xs">
          {data.description}
        </CardDescription>
      </div>
      <div className="ml-auto flex items-center justify-end gap-x-1">
        <Button size={"icon"} variant={"ghost"}>
          <LucidePlay />
        </Button>
        <Button size={"icon"} variant={"ghost"}>
          <LucideMoreVertical />
        </Button>
      </div>
    </Card>
  );
};

export default GroupCard;
