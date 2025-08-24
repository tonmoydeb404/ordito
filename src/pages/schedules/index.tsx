import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetSchedulesQuery, useToggleScheduleMutation } from "@/store/api/schedules-api";
import { Calendar, Clock, Edit, MoreVertical, Play, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {};

const SchedulesPage = (_props: Props) => {
  const { data: schedules = [], isLoading, error } = useGetSchedulesQuery();
  const [toggleSchedule] = useToggleScheduleMutation();

  const formatNextExecution = (nextExecution?: string) => {
    if (!nextExecution) return "Not scheduled";
    return new Date(nextExecution).toLocaleString();
  };

  const formatLastExecuted = (lastExecuted?: string) => {
    if (!lastExecuted) return "Never";
    return new Date(lastExecuted).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold">Schedules</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl font-bold">Schedules</h1>
          <p className="text-red-500">Error loading schedules</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Schedules</h1>
        <p className="text-muted-foreground">Manage your scheduled commands</p>
      </div>

      <div className="px-4 lg:px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Cron Expression</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Execution</TableHead>
              <TableHead>Last Executed</TableHead>
              <TableHead>Executions</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{schedule.name}</div>
                    {schedule.description && (
                      <div className="text-sm text-muted-foreground">
                        {schedule.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {schedule.cron_expression}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={schedule.is_enabled ? "default" : "secondary"}>
                    {schedule.is_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatNextExecution(schedule.next_execution)}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatLastExecuted(schedule.last_executed)}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    {schedule.execution_count}
                    {schedule.max_executions && (
                      <span className="text-muted-foreground">
                        / {schedule.max_executions}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSchedule(schedule.id)}
                      className="h-8 w-8"
                    >
                      {schedule.is_enabled ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Run now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete schedule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SchedulesPage;
