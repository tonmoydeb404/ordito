import { Terminal } from "lucide-react";

export function EmptyCommandsState() {
  return (
    <div className="text-center text-muted-foreground py-8">
      <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p className="text-sm">No commands found</p>
    </div>
  );
}
