import GroupCard from "@/components/cards/group";
import CreateCommandModal from "@/components/modals/create-command";
import useMasonry from "@/hooks/use-masonry";
import { useModal } from "@/hooks/use-modal";
import { TCommandGroup } from "@/types/command";

type Props = {};

const GroupsSection = (props: Props) => {
  const columns = useMasonry({ items: commandGroups });
  const createCommandModal = useModal<TCommandGroup>();

  return (
    <>
      <div
        className="grid my-16 container mx-auto gap-x-3 gap-y-5"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-4 flex-1 shrink-0">
            {col.map((item) => (
              <GroupCard
                data={item}
                key={item.id}
                onCreate={() => createCommandModal.open(item)}
              />
            ))}
          </div>
        ))}
      </div>

      <CreateCommandModal {...createCommandModal} />
    </>
  );
};

export default GroupsSection;

// ----------------------------------------------------------------------

const commandGroups: TCommandGroup[] = [
  {
    id: "1",
    title: "Git",
    commands: [
      { id: "1a", label: "Status", cmd: "git status" },
      { id: "1b", label: "Pull Latest", cmd: "git pull origin main" },
      { id: "1c", label: "Add All", cmd: "git add ." },
      { id: "1d", label: "Commit", cmd: 'git commit -m "Update"' },
      { id: "1e", label: "Push", cmd: "git push origin main" },
    ],
  },
  {
    id: "2",
    title: "Docker",
    commands: [
      { id: "2a", label: "List Containers", cmd: "docker ps -a" },
      { id: "2b", label: "Restart All", cmd: "docker restart $(docker ps -q)" },
      {
        id: "2c",
        label: "Clean All",
        cmd: "docker system prune -a --volumes -f",
      },
    ],
  },
  {
    id: "3",
    title: "Node.js",
    commands: [
      { id: "3a", label: "Start Dev Server", cmd: "npm run dev" },
      { id: "3b", label: "Install Packages", cmd: "npm install" },
      { id: "3c", label: "Build App", cmd: "npm run build" },
    ],
  },
  {
    id: "4",
    title: "System Monitoring",
    commands: [
      { id: "4a", label: "CPU & Memory", cmd: "top" },
      { id: "4b", label: "Disk Usage", cmd: "df -h" },
      { id: "4c", label: "Memory Free", cmd: "free -m" },
    ],
  },
  {
    id: "5",
    title: "Linux Utils",
    commands: [
      { id: "5a", label: "List Files", cmd: "ls -alh" },
      { id: "5b", label: "Current Directory", cmd: "pwd" },
      {
        id: "5c",
        label: "Recursive Delete Node Modules",
        cmd: "find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +",
      },
    ],
  },
  {
    id: "6",
    title: "Networking",
    commands: [
      { id: "6a", label: "Check IP", cmd: "curl ifconfig.me" },
      { id: "6b", label: "Ping Google", cmd: "ping -c 4 google.com" },
      { id: "6c", label: "Trace Route", cmd: "traceroute google.com" },
    ],
  },
  {
    id: "7",
    title: "PostgreSQL",
    commands: [
      {
        id: "7a",
        label: "Connect to DB",
        cmd: "psql -h localhost -U user -d database",
      },
      { id: "7b", label: "List Tables", cmd: "\\dt" },
      { id: "7c", label: "Describe Table", cmd: "\\d tablename" },
    ],
  },
  {
    id: "8",
    title: "MongoDB",
    commands: [
      { id: "8a", label: "Start Shell", cmd: "mongosh" },
      { id: "8b", label: "Show Databases", cmd: "show dbs" },
      { id: "8c", label: "Find Users", cmd: "db.users.find({}).pretty()" },
    ],
  },
  {
    id: "9",
    title: "Yarn",
    commands: [
      { id: "9a", label: "Install", cmd: "yarn install" },
      { id: "9b", label: "Build", cmd: "yarn build" },
      { id: "9c", label: "Run Dev", cmd: "yarn dev" },
    ],
  },
  {
    id: "10",
    title: "ZSH/Terminal",
    commands: [
      { id: "10a", label: "Reload ZSH", cmd: "source ~/.zshrc" },
      { id: "10b", label: "Clear Cache", cmd: "rm -rf ~/.cache" },
      { id: "10c", label: "Edit Profile", cmd: "nano ~/.zprofile" },
    ],
  },
  {
    id: "11",
    title: "Kubernetes",
    commands: [
      {
        id: "11a",
        label: "Get Pods",
        cmd: "kubectl get pods --all-namespaces",
      },
      {
        id: "11b",
        label: "Describe Pod",
        cmd: "kubectl describe pod <pod-name>",
      },
      { id: "11c", label: "Delete Pod", cmd: "kubectl delete pod <pod-name>" },
    ],
  },
  {
    id: "12",
    title: "AWS CLI",
    commands: [
      { id: "12a", label: "List Buckets", cmd: "aws s3 ls" },
      {
        id: "12b",
        label: "Sync Folder",
        cmd: "aws s3 sync ./build s3://my-bucket-name --delete",
      },
      {
        id: "12c",
        label: "Describe Instances",
        cmd: "aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' --output table",
      },
    ],
  },
  {
    id: "13",
    title: "PM2",
    commands: [
      { id: "13a", label: "List", cmd: "pm2 ls" },
      { id: "13b", label: "Restart All", cmd: "pm2 restart all" },
      { id: "13c", label: "Logs", cmd: "pm2 logs" },
    ],
  },
  {
    id: "14",
    title: "Nginx",
    commands: [
      { id: "14a", label: "Test Config", cmd: "nginx -t" },
      {
        id: "14b",
        label: "Restart Nginx",
        cmd: "sudo systemctl restart nginx",
      },
      {
        id: "14c",
        label: "View Logs",
        cmd: "tail -f /var/log/nginx/access.log",
      },
    ],
  },
  {
    id: "15",
    title: "Cron Jobs",
    commands: [
      { id: "15a", label: "List Cron Jobs", cmd: "crontab -l" },
      { id: "15b", label: "Edit Cron Jobs", cmd: "crontab -e" },
    ],
  },
  {
    id: "16",
    title: "Python",
    commands: [
      { id: "16a", label: "Run Script", cmd: "python3 script.py" },
      {
        id: "16b",
        label: "Install Packages",
        cmd: "pip install -r requirements.txt",
      },
    ],
  },
  {
    id: "17",
    title: "Grep / Search",
    commands: [
      {
        id: "17a",
        label: "Find in Logs",
        cmd: "grep 'ERROR' /var/log/app.log",
      },
      { id: "17b", label: "Find Port", cmd: "lsof -i :3000" },
    ],
  },
  {
    id: "18",
    title: "Curl",
    commands: [
      {
        id: "18a",
        label: "GET Request",
        cmd: "curl https://api.example.com/status",
      },
      {
        id: "18b",
        label: "POST JSON",
        cmd: "curl -X POST -H 'Content-Type: application/json' -d '{\"name\":\"test\"}' https://api.example.com/data",
      },
    ],
  },
  {
    id: "19",
    title: "System Services",
    commands: [
      {
        id: "19a",
        label: "List Services",
        cmd: "systemctl list-units --type=service",
      },
      {
        id: "19b",
        label: "Restart Service",
        cmd: "sudo systemctl restart my-service",
      },
    ],
  },
  {
    id: "20",
    title: "SSH",
    commands: [
      { id: "20a", label: "Connect to Server", cmd: "ssh user@host.com -p 22" },
      { id: "20b", label: "Copy SSH Key", cmd: "ssh-copy-id user@host.com" },
    ],
  },
];
