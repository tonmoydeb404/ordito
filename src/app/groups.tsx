import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { TCommandGroup } from "@/types/command";
import {
  LucideMoreHorizontal,
  LucideMoreVertical,
  LucidePlay,
  LucidePlus,
} from "lucide-react";

type Props = {};

const GroupsSection = (props: Props) => {
  return (
    <div className="grid grid-cols-3 gap-5 py-16 container mx-auto">
      {commandGroups.map((item) => (
        <Card key={item.id}>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-base font-medium">{item.title}</h3>
            <div className="flex items-center gap-2">
              <Button size={"icon"} variant={"subtle_destructive"}>
                <LucidePlay />
              </Button>
              <Button size={"icon"} variant={"subtle_dark"}>
                <LucideMoreVertical />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {item.commands.map((command) => (
              <div
                key={command.id}
                className="bg-muted/10 dark:bg-accent/40 border p-2.5 rounded-lg flex items-start"
              >
                <div className="flex flex-col grow">
                  <span className="text-xs text-muted-foreground mb-1">
                    {command.label}
                  </span>
                  <code className="text-sm">{command.cmd}</code>
                </div>

                <div className="flex items-center gap-x-1">
                  <Button size={"icon_sm"} variant={"ghost"}>
                    <LucideMoreHorizontal />
                  </Button>
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
      ))}
    </div>
  );
};

export default GroupsSection;

// ----------------------------------------------------------------------

const commandGroups: TCommandGroup[] = [
  {
    id: "1d1c4eeb-3aab-42e3-a9f3-5cc567e6fdf8",
    title: "Git",
    commands: [
      {
        id: "f0d4040a-6bd8-45f9-b2c4-05a1cf3c92c6",
        label: "Git Status",
        cmd: "git status",
      },
      {
        id: "e3ad70ea-7fc0-442c-9d61-b0d77b34f38e",
        label: "Git Pull",
        cmd: "git pull",
      },
      {
        id: "ab92db2f-5472-4d4c-bfc3-1808e8cfc1a2",
        label: "Git Push",
        cmd: "git push",
      },
    ],
  },
  {
    id: "33afc390-6a1b-4990-9129-6ff2c637b55c",
    title: "Docker",
    commands: [
      {
        id: "b8dc22e2-155c-4066-9c8c-950cdd3e9056",
        label: "List Containers",
        cmd: "docker ps",
      },
      {
        id: "3198bb94-52a7-4b3a-b19b-cb4a6a8be2a6",
        label: "Restart All Containers",
        cmd: "docker restart $(docker ps -q)",
      },
      {
        id: "74782f74-118f-4d77-9b27-5c4588cc43f2",
        label: "Prune Unused Images",
        cmd: "docker image prune -a",
      },
    ],
  },
  {
    id: "6e59be38-393f-4cb4-9523-09ed99f1623c",
    title: "System",
    commands: [
      {
        id: "144d9a41-d44d-46b6-ae3b-5c90d4e79870",
        label: "List Processes",
        cmd: "ps aux",
      },
      {
        id: "bcd5a54e-1a8e-49c3-a7f8-51f4e814d9ea",
        label: "Show Disk Usage",
        cmd: "df -h",
      },
      {
        id: "fc6a8a79-bb71-4b9b-99ae-b5fa76a5a261",
        label: "Memory Usage",
        cmd: "free -m",
      },
    ],
  },
  {
    id: "7cbd508d-9db4-4f4a-9ae2-783a723e1c88",
    title: "Node.js",
    commands: [
      {
        id: "35e8cfa0-258f-486e-8134-0b0d146f5dc3",
        label: "Start Dev Server",
        cmd: "npm run dev",
      },
      {
        id: "978e3b14-f250-4958-b648-d21432f3e071",
        label: "Install Dependencies",
        cmd: "npm install",
      },
      {
        id: "38a6a580-0d5a-4d91-a202-91dc5fda124b",
        label: "Build Project",
        cmd: "npm run build",
      },
    ],
  },
];
