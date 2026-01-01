import { CreateCommandDialog } from "@/components/dialogs/command/create-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupResponse } from "@/store";
import { Play, RotateCcw } from "lucide-react";

interface Props {
  group: GroupResponse | null;
  sortBy: string;
  filterBy: string;
  onSortChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onRunAll?: () => void;
  onRefresh?: () => void;
}

export function CommandsHeader(props: Props) {
  const {
    sortBy,
    filterBy,
    onSortChange,
    onFilterChange,
    onRunAll,
    onRefresh,
    group,
  } = props;
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">All Commands</h2>
        <div className="flex gap-2">
          <CreateCommandDialog groupId={group?.id ?? null} />
          <Button
            size="sm"
            className="px-2 py-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs"
            data-testid="button-run-all"
            onClick={onRunAll}
          >
            <Play className="w-3 h-3 mr-1" />
            Run All
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="px-2 py-1 text-xs"
            data-testid="button-refresh"
            onClick={onRefresh}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="flex-1" data-testid="select-sort-by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by: Name</SelectItem>
            <SelectItem value="lastModified">Sort by: Last Modified</SelectItem>
            <SelectItem value="lastExecuted">Sort by: Last Executed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={onFilterChange}>
          <SelectTrigger data-testid="select-filter-by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="favorite">Favorite</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
