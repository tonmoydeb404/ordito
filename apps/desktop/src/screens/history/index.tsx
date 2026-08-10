import { EmptyState } from "@/components/empty-state";
import { HistoryRow } from "@/components/history-row";
import { SectionLabel } from "@/components/section-label";
import { ToggleGroup, ToggleGroupItem } from "@packages/ui/components/toggle-group";
import { useOrdito } from "@/context/ordito-context";
import { timeGroup } from "@/lib/format";
import type { HistoryFilter, RunItem } from "@/types";
import { History } from "lucide-react";

const FILTERS: ReadonlyArray<{ key: HistoryFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "success", label: "Success" },
  { key: "failed", label: "Failed" },
  { key: "running", label: "Running" },
];

function groupByTime(runsList: RunItem[]): Array<[string, RunItem[]]> {
  const groups: Record<string, RunItem[]> = {};
  const order = ["Today", "Yesterday", "Earlier"];

  for (const run of runsList) {
    const group = timeGroup(run.startedAt);

    if (!groups[group]) {
      groups[group] = [];
    }

    groups[group].push(run);
  }

  return order
    .filter((group) => groups[group]?.length)
    .map((group) => [group, groups[group]] as [string, RunItem[]]);
}

export function HistoryScreen() {
  const { commands, filteredRuns, historyFilter, setHistoryFilter, cancelRun } =
    useOrdito();

  function getCommandName(commandId: string) {
    return commands.find((command) => command.id === commandId)?.name;
  }

  const grouped = groupByTime(filteredRuns);

  return (
    <div className="h-full gap-3 overflow-auto scrollbar-thin p-4">
      <ToggleGroup
        className="mb-5"
        variant="outline"
        size="sm"
        value={[historyFilter]}
        onValueChange={(val) => {
          if (val.length > 0) setHistoryFilter(val[0] as HistoryFilter);
        }}
      >
        {FILTERS.map((filter) => (
          <ToggleGroupItem key={filter.key} value={filter.key}>
            {filter.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {filteredRuns.length === 0 ? (
        <EmptyState
          icon={<History size={24} />}
          title={
            historyFilter === "all" ? "No runs yet" : `No ${historyFilter} runs`
          }
          description={
            historyFilter === "all"
              ? "Execute a command to see its run history."
              : "Try a different filter."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-inset">
          {grouped.map(([groupName, groupRuns]) => (
            <section key={groupName}>
              <SectionLabel label={groupName} />
              {groupRuns.map((run) => (
                <HistoryRow
                  key={run.id}
                  run={run}
                  commandName={getCommandName(run.commandId)}
                  onCancel={cancelRun}
                />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
