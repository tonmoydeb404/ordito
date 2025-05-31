import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CheckCircle, ChevronDown, Trash2, XCircle } from "lucide-react";
import { forwardRef, useState } from "react";
import ResultAccordion from "./result";

export interface ResultItem {
  id: string;
  label: string;
  output: string;
  timestamp: string;
  isError: boolean;
}

export interface GroupExecution {
  label: string;
  timestamp: string;
  results: ResultItem[];
}

interface ItemProps {
  execution: GroupExecution;
  isHighlighted: boolean;
  onClear: () => void;
}

export default forwardRef<HTMLDivElement, ItemProps>(function Item(
  { execution, isHighlighted, onClear },
  ref
) {
  const [isGroupOpen, setIsGroupOpen] = useState(isHighlighted);

  const successCount = execution.results.filter(
    (result) => !result.isError
  ).length;
  const errorCount = execution.results.length - successCount;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div
      ref={ref}
      className={`border rounded-lg transition-all duration-300 ${
        isHighlighted
          ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
          : "border-border bg-card"
      }`}
    >
      <Collapsible open={isGroupOpen} onOpenChange={setIsGroupOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {successCount > 0 && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {errorCount > 0 && <XCircle className="w-4 h-4 text-red-500" />}
              </div>
              <span className="font-medium text-sm">{execution.label}</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(execution.timestamp)}
              </span>
              <div className="flex gap-1">
                {successCount > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                    {successCount} ✓
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded">
                    {errorCount} ✗
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>

              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isGroupOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t">
            <div className="space-y-2 mt-3">
              {execution.results.map((result, index) => (
                <ResultAccordion key={index} result={result} index={index} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});
