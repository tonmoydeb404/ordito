import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CommandResponse, LogResponse } from "@/store/types";
import { ChevronDownIcon, ChevronRightIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { formatDuration, variants } from "./common";

interface LogDetailProps {
  log: LogResponse;
  command: CommandResponse;
  onClose: () => void;
}

export function LogDetail({ log, command, onClose }: LogDetailProps) {
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);

  const copyOutput = () => {
    if (log.output) {
      navigator.clipboard.writeText(log.output);
    }
  };

  return (
    <div className="flex flex-col h-full px-4 py-2 space-y-4">
      {/* Basic Info */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Execution Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-x-4 col-span-2">
              <h4 className="font-medium">Name:</h4>
              <div className="text-muted-foreground">{command.title}</div>
            </div>
            <div className="flex items-center gap-x-2 col-span-2">
              <h4 className="font-medium">Status:</h4>
              <Badge variant={variants[log.status]} appearance={"light"}>
                {log.status}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-1">Started:</h4>
              <div className="text-muted-foreground">
                {new Date(log.started_at).toLocaleString()}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Duration:</h4>
              <div className="text-muted-foreground">
                {formatDuration(log.started_at, log.finished_at)}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Working Directory:</h4>
              <div className="text-muted-foreground font-mono text-xs">
                {log.working_dir}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Exit Code:</h4>
              <div className="text-muted-foreground">
                {log.exit_code ?? "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Command */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Command</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
            {command.value}
          </pre>
        </CardContent>
      </Card>

      {/* Output */}
      {log.output && (
        <Card className="rounded-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Output</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyOutput}
                  className="h-8 w-8 p-0"
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
                <Collapsible
                  open={isOutputExpanded}
                  onOpenChange={setIsOutputExpanded}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isOutputExpanded ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>
            </div>
          </CardHeader>
          <Collapsible
            open={isOutputExpanded}
            onOpenChange={setIsOutputExpanded}
          >
            <CollapsibleContent>
              <CardContent>
                <pre className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                  {log.output}
                </pre>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Environment Variables */}
      {log.env_vars && (
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-base">Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
              {JSON.stringify(JSON.parse(log.env_vars), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
