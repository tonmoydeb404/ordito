import { Button } from "@/components/ui/button";
import { Copy, Eraser } from "lucide-react";
import { useRef } from "react";

interface OutputPanelProps {
  output: string;
  onClear: () => void;
  onCopy: () => void;
}

export default function OutputPanel({
  output,
  onClear,
  onCopy,
}: OutputPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-40 border-t border-border flex flex-col">
      <div className="p-2 bg-secondary border-b border-border">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium">Output</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="px-2 py-1 text-xs"
              onClick={onClear}
              data-testid="button-clear-output"
            >
              <Eraser className="w-3 h-3 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="px-2 py-1 text-xs"
              onClick={onCopy}
              data-testid="button-copy-output"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </div>
      <div
        ref={outputRef}
        className="flex-1 p-3 bg-secondary font-mono text-xs overflow-y-auto scrollbar-thin terminal-output whitespace-pre-wrap"
        data-testid="terminal-output"
      >
        {output || (
          <div className="text-muted-foreground">
            Command output will appear here...
          </div>
        )}
      </div>
    </div>
  );
}
