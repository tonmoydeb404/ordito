import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/utils/clipboard";
import { CheckCircle, Copy, Trash2, XCircle } from "lucide-react";
import { forwardRef } from "react";

interface ItemProps {
  groupId: string;
  resultArray: [string, string][];
  isHighlighted: boolean;
  onClear: () => void;
}

export default forwardRef<HTMLDivElement, ItemProps>(function Item(
  { groupId, resultArray, isHighlighted, onClear },
  ref
) {
  // Determine if this is a temporary result
  const isTempResult =
    groupId.startsWith("single-cmd-") ||
    groupId.startsWith("detached-cmd-") ||
    groupId.startsWith("group-error-");

  const groupTitle = isTempResult ? "Command Execution" : groupId;
  const successCount = resultArray.filter(
    ([, output]) => !output.startsWith("Error:")
  ).length;
  const errorCount = resultArray.length - successCount;

  return (
    <div
      ref={ref}
      className={`border rounded-lg p-4 transition-all duration-300 ${
        isHighlighted
          ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
          : "border-border bg-card"
      }`}
    >
      {/* Group Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{groupTitle}</h3>
          {isHighlighted && (
            <Badge variant="outline" className="text-xs">
              Highlighted
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {successCount > 0 && (
            <Badge
              variant="default"
              className="bg-green-500 text-white text-xs"
            >
              {successCount} ✓
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {errorCount} ✗
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Command Results */}
      <div className="space-y-3">
        {resultArray.map(([label, output], index) => {
          const isError = output.startsWith("Error:");

          return (
            <div
              key={index}
              className={`border rounded-md overflow-hidden ${
                isError
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                  : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
              }`}
            >
              {/* Command Header */}
              <div
                className={`px-3 py-2 border-b flex items-center justify-between ${
                  isError
                    ? "border-red-200 bg-red-100 dark:border-red-700 dark:bg-red-900"
                    : "border-green-200 bg-green-100 dark:border-green-700 dark:bg-green-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isError ? (
                    <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  )}
                  <span className="font-medium text-xs">{label}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(output, `Output for "${label}" copied!`)
                  }
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-2.5 h-2.5" />
                </Button>
              </div>

              {/* Command Content */}
              <div className="p-3">
                <pre
                  className={`text-xs whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto ${
                    isError
                      ? "text-red-800 dark:text-red-200"
                      : "text-green-800 dark:text-green-200"
                  }`}
                >
                  {output}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
