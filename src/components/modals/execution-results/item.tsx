import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { copyToClipboard } from "@/utils/clipboard";
import { CheckCircle, ChevronDown, Copy, Trash2, XCircle } from "lucide-react";
import { forwardRef, useState } from "react";

interface ResultItem {
  id: string;
  label: string;
  output: string;
  timestamp: string;
  isError: boolean;
}

interface GroupExecution {
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

// Result Accordion Component
function ResultAccordion({
  result,
  index,
}: {
  result: ResultItem;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div
          className={`px-3 py-2 border rounded-md flex items-center justify-between hover:bg-muted/50 transition-colors ${
            result.isError
              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          }`}
        >
          <div className="flex items-center gap-2">
            {result.isError ? (
              <XCircle className="w-3 h-3 text-red-500" />
            ) : (
              <CheckCircle className="w-3 h-3 text-green-500" />
            )}
            <span className="text-xs font-medium">{result.label}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(
                  result.output,
                  `Output for "${result.label}" copied!`
                );
              }}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-2.5 h-2.5" />
            </Button>

            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2">
          <pre
            className={`text-xs whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto p-3 rounded-md ${
              result.isError
                ? "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
                : "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
            }`}
          >
            {result.output}
          </pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
