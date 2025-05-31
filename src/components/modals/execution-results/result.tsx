import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { copyToClipboard } from "@/utils/clipboard";
import { CheckCircle, ChevronDown, Copy, XCircle } from "lucide-react";
import { useState } from "react";
import { ResultItem } from "./item";

type Props = {
  result: ResultItem;
  index: number;
};

function ResultAccordion({ result }: Props) {
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

export default ResultAccordion;
