import { EmptyState } from "@/components/empty-state";
import { Button } from "@packages/ui/components/button";
import { useModal } from "@/context/modal-context";
import { useOrdito } from "@/context/ordito-context";
import { Folder } from "lucide-react";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";

export function HomeScreen() {
  const { groups } = useOrdito();
  const { group } = useModal();

  const firstGroupId = useMemo(() => {
    if (groups.length === 0) return null;
    return [...groups].sort((a, b) => a.name.localeCompare(b.name))[0].id;
  }, [groups]);

  if (firstGroupId) {
    return <Navigate to={`/groups/${firstGroupId}`} replace />;
  }

  return (
    <EmptyState
      icon={<Folder size={36} />}
      title="No groups yet"
      description="Create a group to start saving commands."
      action={
        <Button onClick={() => group.create.open()}>
          Create your first group
        </Button>
      }
      className="w-full h-full"
    />
  );
}
