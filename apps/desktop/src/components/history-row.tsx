import { openPath } from "@tauri-apps/plugin-opener";
import { CheckCircle2, Clock3, Square, X } from "lucide-react";
import { useModal } from "../context/modal-context";
import { formatDateTime, formatDuration } from "../lib/format";
import { statusIconClass, statusLabels } from "../lib/status";
import type { RunItem, RunStatus } from "../types";
import { Badge } from "@packages/ui/components/badge";

const runStatusIcon: Record<RunStatus, typeof CheckCircle2> = {
  success: CheckCircle2,
  failed: X,
  running: Clock3,
};

type HistoryRowProps = {
  run: RunItem;
  commandName?: string;
  onCancel?: (runId: string) => void;
};

export function HistoryRow({ run, commandName, onCancel }: HistoryRowProps) {
  const { alert } = useModal();
  const isRunning = run.status === "running";
  const Icon = runStatusIcon[run.status];

  return (
    <button
      type="button"
      onClick={() =>
        run.outputPath &&
        openPath(run.outputPath).catch((e) => alert.open(String(e)))
      }
      disabled={!run.outputPath}
      className="grid w-full gap-2 py-2.5 px-3 text-left bg-row border-b border-separator last:border-b-0 transition-colors duration-120 hover:bg-row-hover disabled:cursor-default disabled:hover:bg-row"
    >
      <header className="flex items-center gap-2.5 min-w-0">
        <span
          className={`grid place-items-center size-6 shrink-0 rounded-[7px] ${statusIconClass[run.status]}`}
        >
          <Icon size={15} />
        </span>
        <div className="grid min-w-0 flex-1 gap-0.75">
          <strong className="overflow-hidden text-ink text-[0.82rem] font-bold truncate">
            {commandName ?? "Unknown"}
          </strong>
          <small className="overflow-hidden text-muted-foreground text-[0.68rem] truncate">
            {formatDateTime(run.startedAt)} · {formatDuration(run.durationMs)}
            {run.exitCode !== null && run.exitCode !== undefined && (
              <span className="text-faint"> · exit {run.exitCode}</span>
            )}
          </small>
        </div>
        {isRunning && onCancel && (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onCancel(run.id);
            }}
            className="grid place-items-center w-6.5 h-6.5 text-danger-foreground bg-danger rounded-[7px] transition-all duration-140 ease-out hover:brightness-110 active:scale-95"
            aria-label="Stop run"
          >
            <Square size={11} fill="currentColor" strokeWidth={0} />
          </span>
        )}
        <Badge variant="secondary" className={statusIconClass[run.status]}>
          {statusLabels[run.status]}
        </Badge>
      </header>
    </button>
  );
}
