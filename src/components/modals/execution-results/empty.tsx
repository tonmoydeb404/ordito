import { Terminal } from "lucide-react";

export default function Empty() {
  return (
    <div className="flex items-center justify-center py-8 text-muted-foreground">
      <div className="text-center">
        <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No execution data available</p>
      </div>
    </div>
  );
}
