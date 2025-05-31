import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Terminal } from "lucide-react";
import { useEffect, useRef } from "react";
import Empty from "./empty";
import Footer from "./footer";
import Header from "./header";
import Item from "./item";

interface ExecutionResultsModalProps {
  isOpen: boolean;
  close: () => void;
  groupId?: string | null;
  results: Record<string, [string, string][]>;
  onClearResults: (groupId: string) => void;
  onClearAllResults: () => void;
}

export default function ExecutionResultsModal({
  isOpen,
  close,
  groupId,
  results,
  onClearResults,
  onClearAllResults,
}: ExecutionResultsModalProps) {
  const highlightRef = useRef<HTMLDivElement>(null);

  // Filter results to only show groups with data
  const allResultEntries = Object.entries(results).filter(
    ([, resultArray]) => resultArray.length > 0
  );

  // Calculate totals
  const totalResults = allResultEntries.reduce(
    (acc, [, resultArray]) => acc + resultArray.length,
    0
  );
  const totalSuccess = allResultEntries.reduce(
    (acc, [, resultArray]) =>
      acc +
      resultArray.filter(([, output]) => !output.startsWith("Error:")).length,
    0
  );
  const totalErrors = totalResults - totalSuccess;

  // Scroll to highlighted group when modal opens
  useEffect(() => {
    if (isOpen && groupId && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [isOpen, groupId]);

  if (allResultEntries.length === 0) {
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
            totalGroups={allResultEntries.length}
            totalResults={totalResults}
            groupId={groupId}
          />
        </DialogHeader>

        <div className="grow w-full overflow-y-auto">
          <div className="space-y-6">
            {allResultEntries.map(([entryGroupId, resultArray]) => (
              <Item
                key={entryGroupId}
                groupId={entryGroupId}
                resultArray={resultArray}
                isHighlighted={groupId === entryGroupId}
                onClear={() => onClearResults(entryGroupId)}
                ref={groupId === entryGroupId ? highlightRef : null}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between border-t pt-4">
          <Footer onClearAll={onClearAllResults} onClose={close} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
