import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExecutionContextType } from "@/contexts/execution/type";
import { Terminal } from "lucide-react";
import { useEffect, useRef } from "react";
import Empty from "./empty";
import Footer from "./footer";
import Header from "./header";
import Item from "./item";

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

interface ExecutionResultsModalProps {
  isOpen: boolean;
  close: () => void;
  selectedResponse?: string | null;
  responses: ExecutionContextType["responses"];
  onRemove: (groupId: string) => void;
  onClear: () => void;
}

export default function ExecutionResultsModal(
  props: ExecutionResultsModalProps
) {
  const { isOpen, close, selectedResponse, responses, onRemove, onClear } =
    props;
  const highlightRef = useRef<HTMLDivElement>(null);

  const groupExecutions: GroupExecution[] = Object.entries(responses).map(
    ([timestamp, executionResult]) => {
      return {
        label: executionResult.label,
        timestamp: timestamp,
        results: executionResult.result.map(([label, output], index) => {
          return {
            id: timestamp,
            label,
            output,
            timestamp: timestamp,
            isError: output.startsWith("Error:"),
          };
        }),
      };
    }
  );

  // Calculate totals
  const totalResults = groupExecutions.reduce(
    (acc, group) => acc + group.results.length,
    0
  );
  const totalSuccess = groupExecutions.reduce(
    (acc, group) =>
      acc + group.results.filter((result) => !result.isError).length,
    0
  );
  const totalErrors = totalResults - totalSuccess;

  // Scroll to highlighted group when modal opens
  useEffect(() => {
    if (isOpen && selectedResponse && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [isOpen, selectedResponse]);

  if (groupExecutions.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              No Results
            </DialogTitle>
            <DialogDescription>No execution results found.</DialogDescription>
          </DialogHeader>

          <Empty />

          <DialogFooter>
            <Button onClick={close}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-6xl w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <Header
            totalSuccess={totalSuccess}
            totalErrors={totalErrors}
            totalGroups={groupExecutions.length}
            totalResults={totalResults}
            groupId={selectedResponse}
          />
        </DialogHeader>

        <div className="grow w-full overflow-y-auto">
          <div className="space-y-2">
            {groupExecutions.map((execution) => (
              <Item
                key={execution.timestamp}
                execution={execution}
                isHighlighted={selectedResponse === execution.timestamp}
                onClear={() => onRemove(execution.timestamp)}
                ref={
                  selectedResponse === execution.timestamp ? highlightRef : null
                }
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between border-t pt-4">
          <Footer onClearAll={onClear} onClose={close} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
