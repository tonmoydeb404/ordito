import { Badge } from "@/components/ui/badge";
import { DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";

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
      <DialogTitle className="mb-2">All Execution Results</DialogTitle>
      <div>
        <div className="flex gap-2 mb-5">
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
          {totalGroups > 0 && (
            <Badge variant="secondary">
              <XCircle className="w-3 h-3 mr-1" />
              {totalGroups} Groups
            </Badge>
          )}
          {totalResults > 0 && (
            <Badge variant="secondary">
              <XCircle className="w-3 h-3 mr-1" />
              {totalResults} Executed
            </Badge>
          )}
        </div>
      </div>
    </>
  );
}
