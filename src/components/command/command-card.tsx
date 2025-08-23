import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CommandActions } from './command-actions';
import { CommandStatusBadge } from './command-status';
import { Command, CommandStatus } from '@/types/command';
import { formatDate } from '@/lib/utils';

interface CommandCardProps {
  command: Command;
  onExecute: (command: Command) => void;
  onEdit: (command: Command) => void;
  onDelete: (commandId: string) => void;
  onDuplicate?: (command: Command) => void;
}

export function CommandCard({ 
  command, 
  onExecute, 
  onEdit, 
  onDelete,
  onDuplicate
}: CommandCardProps) {
  const handleExecute = () => onExecute(command);
  const handleEdit = () => onEdit(command);
  const handleDelete = () => onDelete(command.id);
  const handleDuplicate = () => onDuplicate?.(command);
  
  const isExecuting = command.status === CommandStatus.RUNNING;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{command.name}</h3>
            {command.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {command.description}
              </p>
            )}
          </div>
          <CommandStatusBadge status={command.status} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="bg-muted p-2 rounded text-sm font-mono truncate">
            {command.script}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Executed {command.execution_count} times
            </span>
            {command.last_executed && (
              <span>
                Last: {formatDate(command.last_executed)}
              </span>
            )}
          </div>
          
          <CommandActions
            onExecute={handleExecute}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            isExecuting={isExecuting}
          />
        </div>
      </CardContent>
    </Card>
  );
}