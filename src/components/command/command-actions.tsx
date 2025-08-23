import { Play, Edit, Trash2, MoreHorizontal, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommandActionsProps {
  onExecute: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  isExecuting?: boolean;
}

export function CommandActions({
  onExecute,
  onEdit,
  onDelete,
  onDuplicate,
  isExecuting = false,
}: CommandActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        onClick={onExecute}
        disabled={isExecuting}
        className="flex-1"
      >
        <Play className="h-3 w-3 mr-1" />
        {isExecuting ? 'Running...' : 'Run'}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          {onDuplicate && (
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}