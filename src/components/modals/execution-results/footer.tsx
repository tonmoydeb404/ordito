import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface FooterProps {
  onClearAll: () => void;
  onClose: () => void;
}

export default function Footer({ onClearAll, onClose }: FooterProps) {
  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onClearAll}
          className="flex items-center gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Clear All Results
        </Button>
      </div>

      <Button onClick={onClose}>Close</Button>
    </>
  );
}
