import { Badge } from "@/components/ui/badge";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Terminal, XCircle } from "lucide-react";

interface HeaderProps {
  totalSuccess: number;
  totalErrors: number;
  totalGroups: number;
  totalResults: number;
  groupId?: string | null;
}

export default function Header({
  totalSuccess,
  totalErrors,
  totalGroups,
  totalResults,
  groupId,
}: HeaderProps) {
  return (
    <>
      <DialogTitle className="flex items-center gap-2">
        <Terminal className="w-5 h-5" />
        All Execution Results
        <div className="flex gap-2 ml-auto">
          {totalSuccess > 0 && (
            <Badge variant="default" className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              {totalSuccess} Success
            </Badge>
          )}
          {totalErrors > 0 && (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              {totalErrors} Failed
            </Badge>
          )}
        </div>
      </DialogTitle>
      <DialogDescription>
        Showing results from {totalGroups} group{totalGroups !== 1 ? "s" : ""}(
        {totalResults} total commands)
        {groupId && " - Highlighted group is scrolled into view"}
      </DialogDescription>
    </>
  );
}
