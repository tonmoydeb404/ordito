import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CommandCard } from './command-card';
import { Command } from '@/types/command';

interface CommandGridProps {
  commands: Command[];
  onExecute: (command: Command) => void;
  onEdit: (command: Command) => void;
  onDelete: (commandId: string) => void;
  onDuplicate?: (command: Command) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
}

export function CommandGrid({
  commands,
  onExecute,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateNew,
  isLoading = false,
}: CommandGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-8 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
      <Card 
        className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
        onClick={onCreateNew}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[200px]">
          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="font-medium text-muted-foreground">Add Command</h3>
          <p className="text-sm text-muted-foreground/70 text-center mt-1">
            Create a new command to execute
          </p>
        </CardContent>
      </Card>
      
      {commands.map((command) => (
        <CommandCard
          key={command.id}
          command={command}
          onExecute={onExecute}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
      
      {commands.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">No commands found</h3>
            <p className="text-muted-foreground">
              Get started by creating your first command
            </p>
            <Button onClick={onCreateNew} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Command
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}