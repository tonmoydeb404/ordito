import { useState } from 'react';
import { ChevronUp, ChevronDown, X, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExecution } from '@/hooks/use-execution';
import { cn } from '@/lib/utils';

export function OutputPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { output, isExecuting, currentExecution, clearOutput } = useExecution();
  
  const hasContent = output.length > 0 || isExecuting;
  
  if (!hasContent && !isExpanded) {
    return null;
  }
  
  return (
    <div className={cn(
      "border-t bg-card transition-all duration-200",
      isExpanded ? "h-64" : "h-10"
    )}>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="text-sm font-medium">
            {isExecuting && currentExecution 
              ? `Running: ${currentExecution.command_name}`
              : 'Terminal Output'
            }
          </span>
          {isExecuting && (
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {output.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearOutput}>
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <ScrollArea className="h-52 p-4">
          <div className="font-mono text-sm space-y-1">
            {output.map((line, index) => (
              <div key={index} className="text-foreground">
                {line}
              </div>
            ))}
            {output.length === 0 && !isExecuting && (
              <div className="text-muted-foreground">
                No output to display
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}