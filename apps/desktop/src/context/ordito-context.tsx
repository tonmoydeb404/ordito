import { confirm } from "@tauri-apps/plugin-dialog";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { api, onRunCompleted, onStatusChanged, onUpdateAvailable } from "../lib/api";
import type {
  BackendCommand,
  BackendCommandInput,
  BackendRun,
  BackendSchedule,
  BackendScheduleInput,
  CommandFormData,
  CommandItem,
  GroupItem,
  HistoryFilter,
  RunItem,
  ScheduleItem,
  UpdateInfo,
} from "../types";

export type GroupedCommands = Record<string, CommandItem[]>;

type OrditoContextValue = {
  loading: boolean;
  error: string | null;

  query: string;
  setQuery: (query: string) => void;

  groups: GroupItem[];
  groupNames: string[];
  groupNameById: (id: string) => string;
  groupIdByName: (name: string) => string | undefined;
  createGroup: (name: string, icon?: string | null) => Promise<void>;
  renameGroup: (
    id: string,
    name: string,
    icon?: string | null,
  ) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;

  commands: CommandItem[];

  selectedCommand: CommandItem | null;
  selectCommand: (id: string | null) => void;
  isCreatingCommand: boolean;
  startCreateCommand: () => void;
  cancelCreateCommand: () => void;
  isEditingCommand: boolean;
  editCommand: (id: string) => void;
  cancelEditCommand: () => void;

  saveCommand: (data: CommandFormData, editingId?: string) => Promise<void>;
  deleteCommand: (id: string) => void;

  runCommand: (id?: string) => void;
  cancelRun: (runId: string) => Promise<void>;
  runGroup: (groupId: string) => Promise<void>;
  runningRunIdForCommand: (commandId: string) => string | null;

  activeSchedules: ScheduleItem[];
  pausedSchedules: ScheduleItem[];
  selectedSchedule: ScheduleItem | null;
  selectSchedule: (id: string | null) => void;
  isCreatingSchedule: boolean;
  startCreateSchedule: () => void;
  cancelCreateSchedule: () => void;
  toggleSchedule: (id: string) => Promise<void>;
  createSchedule: (data: BackendScheduleInput) => Promise<ScheduleItem>;
  updateSchedule: (
    id: string,
    data: BackendScheduleInput,
  ) => Promise<ScheduleItem>;
  deleteSchedule: (id: string) => void;

  historyFilter: HistoryFilter;
  setHistoryFilter: (filter: HistoryFilter) => void;
  filteredRuns: RunItem[];
  runs: RunItem[];

  settings: Record<string, string>;
  updateSetting: (key: string, value: string) => Promise<void>;

  updateInfo: UpdateInfo | null;
  isInstallingUpdate: boolean;
  dismissUpdate: () => void;
  installUpdate: () => Promise<void>;
};

const OrditoContext = createContext<OrditoContextValue | null>(null);

function mapCommand(cmd: BackendCommand): CommandItem {
  return {
    id: cmd.id,
    name: cmd.name,
    command: cmd.command,
    cwd: cmd.cwd,
    groupId: cmd.group_id,
    requiresConfirmation: cmd.requires_confirmation,
    runInBackground: cmd.run_in_background,
    lastRunAt: cmd.last_run_at,
    icon: cmd.icon,
    status: cmd.last_run_status,
  };
}

function mapRun(run: BackendRun): RunItem {
  return {
    id: run.id,
    commandId: run.command_id,
    status: run.status,
    mode: run.mode,
    startedAt: run.started_at,
    durationMs: run.duration_ms,
    exitCode: run.exit_code,
    outputPath: run.output_path,
  };
}

function mapSchedule(sched: BackendSchedule): ScheduleItem {
  return {
    id: sched.id,
    commandId: sched.command_id,
    enabled: sched.enabled,
    mode: sched.mode,
    cronExpr: sched.cron_expr,
    runAt: sched.run_at,
    label: sched.label,
    nextRunAt: sched.next_run_at,
  };
}

export function OrditoProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [commandsList, setCommandsList] = useState<CommandItem[]>([]);
  const [runsList, setRunsList] = useState<RunItem[]>([]);
  const [schedulesList, setSchedulesList] = useState<ScheduleItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(
    null,
  );
  const [isCreatingCommand, setIsCreatingCommand] = useState(false);
  const [isEditingCommand, setIsEditingCommand] = useState(false);

  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);

  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);

  const groupNameById = useCallback(
    (id: string) => groups.find((g) => g.id === id)?.name ?? "Other",
    [groups],
  );

  const groupIdByName = useCallback(
    (name: string) => groups.find((g) => g.name === name)?.id,
    [groups],
  );

  const groupNames = useMemo(
    () => groups.map((g) => g.name).sort((a, b) => a.localeCompare(b)),
    [groups],
  );

  // ---- Data loading ----

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [
          backendGroups,
          backendCommands,
          backendSchedules,
          backendRuns,
          backendSettings,
        ] = await Promise.all([
          api.listGroups(),
          api.listCommands(),
          api.listSchedules(),
          api.listRuns(),
          api.getSettings(),
        ]);

        if (cancelled) return;

        const mappedGroups = backendGroups.map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
        }));
        setGroups(mappedGroups);
        setCommandsList(backendCommands.map(mapCommand));
        setSchedulesList(backendSchedules.map(mapSchedule));
        setRunsList(backendRuns.map(mapRun));
        setSettings(backendSettings);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Event listeners ----

  useEffect(() => {
    const unlistenStatusPromise = onStatusChanged((payload) => {
      setCommandsList((prev) =>
        prev.map((cmd) =>
          cmd.id === payload.command_id
            ? { ...cmd, status: payload.last_run_status }
            : cmd,
        ),
      );
    });

    const unlistenRunPromise = onRunCompleted((payload) => {
      setRunsList((prev) => {
        const mapped = mapRun(payload.run);
        const exists = prev.some((r) => r.id === mapped.id);
        if (exists) return prev.map((r) => (r.id === mapped.id ? mapped : r));
        return [mapped, ...prev];
      });
      setCommandsList((prev) =>
        prev.map((cmd) =>
          cmd.id === payload.command_id
            ? { ...cmd, status: payload.last_run_status }
            : cmd,
        ),
      );
    });

    const unlistenUpdatePromise = onUpdateAvailable((payload) => {
      setUpdateInfo(payload);
    });

    return () => {
      unlistenStatusPromise.then((fn) => fn());
      unlistenRunPromise.then((fn) => fn());
      unlistenUpdatePromise.then((fn) => fn());
    };
  }, []);

  // ---- Derived state ----

  const selectedCommand = useMemo(
    () =>
      selectedCommandId === null
        ? null
        : (commandsList.find((c) => c.id === selectedCommandId) ?? null),
    [commandsList, selectedCommandId],
  );

  const activeSchedules = useMemo(
    () =>
      schedulesList
        .filter((s) => s.enabled)
        .sort((a, b) => {
          const aTime = a.nextRunAt ?? "";
          const bTime = b.nextRunAt ?? "";
          return aTime.localeCompare(bTime);
        }),
    [schedulesList],
  );

  const pausedSchedules = useMemo(
    () => schedulesList.filter((s) => !s.enabled),
    [schedulesList],
  );

  const selectedSchedule = useMemo(
    () =>
      selectedScheduleId === null
        ? null
        : (schedulesList.find((s) => s.id === selectedScheduleId) ?? null),
    [schedulesList, selectedScheduleId],
  );

  const filteredRuns = useMemo(() => {
    if (historyFilter === "all") return runsList;

    return runsList.filter((run) => run.status === historyFilter);
  }, [historyFilter, runsList]);

  // ---- Command selection ----

  const selectCommand = useCallback((id: string | null) => {
    setIsCreatingCommand(false);
    setIsEditingCommand(false);
    setSelectedCommandId(id);
  }, []);

  const editCommand = useCallback((id: string) => {
    setIsCreatingCommand(false);
    setSelectedCommandId(id);
    setIsEditingCommand(true);
  }, []);

  const startCreateCommand = useCallback(() => {
    setIsEditingCommand(false);
    setSelectedCommandId(null);
    setIsCreatingCommand(true);
  }, []);

  const cancelCreateCommand = useCallback(() => {
    setIsCreatingCommand(false);
  }, []);

  const cancelEditCommand = useCallback(() => {
    setIsEditingCommand(false);
  }, []);

  // ---- Command persistence ----

  const resolveGroupId = useCallback(
    async (groupName: string): Promise<string> => {
      const existing = groupIdByName(groupName);
      if (existing) return existing;

      const created = await api.createGroup({ name: groupName, icon: null });
      setGroups((prev) =>
        [
          ...prev,
          { id: created.id, name: created.name, icon: created.icon },
        ].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return created.id;
    },
    [groupIdByName],
  );

  const saveCommand = useCallback(
    async (data: CommandFormData, editingId?: string) => {
      const groupId = await resolveGroupId(data.group);

      const input: BackendCommandInput = {
        name: data.name,
        command: data.command,
        cwd: data.cwd,
        group_id: groupId,
        requires_confirmation: data.requiresConfirmation,
        run_in_background: data.runInBackground,
        icon: data.icon,
      };

      if (editingId) {
        const updated = await api.updateCommand(editingId, input);
        setCommandsList((prev) =>
          prev.map((cmd) => (cmd.id === editingId ? mapCommand(updated) : cmd)),
        );
        setIsEditingCommand(false);
        toast.success("Command updated.");
      } else {
        const created = await api.createCommand(input);
        setCommandsList((prev) => [...prev, mapCommand(created)]);
        setSelectedCommandId(created.id);
        setIsCreatingCommand(false);
        toast.success("Command created.");
      }
    },
    [resolveGroupId],
  );

  const deleteCommand = useCallback(
    async (id: string) => {
      const cmd = commandsList.find((c) => c.id === id);
      const confirmed = await confirm(
        `Delete "${cmd?.name ?? "this command"}"? This cannot be undone.`,
        { title: "Delete command", kind: "warning", okLabel: "Delete" },
      );
      if (!confirmed) return;

      await api.deleteCommand(id);
      setCommandsList((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (selectedCommandId === id && next[0]) {
          setSelectedCommandId(next[0].id);
        }
        return next;
      });
      setIsEditingCommand(false);
    },
    [commandsList, selectedCommandId],
  );

  // ---- Run execution ----

  const doRunCommand = useCallback(
    async (id: string) => {
      setCommandsList((prev) =>
        prev.map((cmd) =>
          cmd.id === id ? { ...cmd, status: "running" as const } : cmd,
        ),
      );

      try {
        const run = await api.runCommand(id);
        setRunsList((prev) => {
          const mapped = mapRun(run);
          const exists = prev.some((r) => r.id === mapped.id);
          if (exists) return prev.map((r) => (r.id === mapped.id ? mapped : r));
          return [mapped, ...prev];
        });
      } catch (err) {
        if (err instanceof Error && err.message.includes("cancelled")) {
          const command = commandsList.find((c) => c.id === id);
          setCommandsList((prev) =>
            prev.map((cmd) =>
              cmd.id === id
                ? { ...cmd, status: command?.status ?? ("idle" as const) }
                : cmd,
            ),
          );
          return;
        }
        console.error("Failed to run command:", err);
        toast.error("Failed to run command.");
        setCommandsList((prev) =>
          prev.map((cmd) =>
            cmd.id === id ? { ...cmd, status: "failed" as const } : cmd,
          ),
        );
      }
    },
    [commandsList],
  );

  const runCommand = useCallback(
    (id?: string) => {
      const targetId = id ?? selectedCommandId;
      if (!targetId) return;
      doRunCommand(targetId);
    },
    [selectedCommandId, doRunCommand],
  );

  const cancelRun = useCallback(async (runId: string) => {
    try {
      await api.cancelRun(runId);
    } catch (err) {
      console.error("Failed to cancel run:", err);
      toast.error("Failed to cancel run.");
    }
  }, []);

  const runGroup = useCallback(async (groupId: string) => {
    try {
      setCommandsList((prev) =>
        prev.map((cmd) =>
          cmd.groupId === groupId
            ? { ...cmd, status: "running" as const }
            : cmd,
        ),
      );
      await api.runGroup(groupId);
    } catch (err) {
      console.error("Failed to run group:", err);
      toast.error("Failed to run group.");
    }
  }, []);

  const runningRunIdForCommand = useCallback(
    (commandId: string): string | null => {
      const run = runsList.find(
        (r) => r.commandId === commandId && r.status === "running",
      );
      return run?.id ?? null;
    },
    [runsList],
  );

  // ---- Schedule selection ----

  const selectSchedule = useCallback((id: string | null) => {
    setIsCreatingSchedule(false);
    setSelectedScheduleId(id);
  }, []);

  const startCreateSchedule = useCallback(() => {
    setSelectedScheduleId(null);
    setIsCreatingSchedule(true);
  }, []);

  const cancelCreateSchedule = useCallback(() => {
    setIsCreatingSchedule(false);
  }, []);

  // ---- Schedule operations ----

  const toggleSchedule = useCallback(async (id: string) => {
    const updated = await api.toggleSchedule(id);
    setSchedulesList((prev) =>
      prev.map((s) => (s.id === id ? mapSchedule(updated) : s)),
    );
  }, []);

  const createSchedule = useCallback(async (data: BackendScheduleInput) => {
    const created = await api.createSchedule(data);
    const mapped = mapSchedule(created);
    setSchedulesList((prev) => [...prev, mapped]);
    setIsCreatingSchedule(false);
    setSelectedScheduleId(mapped.id);
    toast.success("Schedule created.");
    return mapped;
  }, []);

  const updateSchedule = useCallback(
    async (id: string, data: BackendScheduleInput) => {
      const updated = await api.updateSchedule(id, data);
      const mapped = mapSchedule(updated);
      setSchedulesList((prev) => prev.map((s) => (s.id === id ? mapped : s)));
      toast.success("Schedule updated.");
      return mapped;
    },
    [],
  );

  const deleteSchedule = useCallback(async (id: string) => {
    const confirmed = await confirm(
      "Delete this schedule? This cannot be undone.",
      { title: "Delete schedule", kind: "warning", okLabel: "Delete" },
    );
    if (!confirmed) return;

    await api.deleteSchedule(id);
    setSchedulesList((prev) => prev.filter((s) => s.id !== id));
    setSelectedScheduleId((prev) => (prev === id ? null : prev));
  }, []);

  // ---- Settings ----

  const updateSetting = useCallback(async (key: string, value: string) => {
    await api.setSetting(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ---- Group management ----

  const createGroup = useCallback(
    async (name: string, icon: string | null = null) => {
      const created = await api.createGroup({ name, icon });
      setGroups((prev) =>
        [
          ...prev,
          { id: created.id, name: created.name, icon: created.icon },
        ].sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [],
  );

  const renameGroup = useCallback(
    async (id: string, name: string, icon: string | null = null) => {
      const updated = await api.updateGroup(id, { name, icon });
      setGroups((prev) =>
        prev
          .map((g) =>
            g.id === id
              ? { id: updated.id, name: updated.name, icon: updated.icon }
              : g,
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [],
  );

  const deleteGroup = useCallback(async (id: string) => {
    await api.deleteGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
    const commands = await api.listCommands();
    setCommandsList(commands.map(mapCommand));
  }, []);

  const dismissUpdate = useCallback(() => setUpdateInfo(null), []);

  const installUpdate = useCallback(async () => {
    setIsInstallingUpdate(true);
    try {
      await api.installUpdate();
    } catch (err) {
      toast.error("Failed to install update", {
        description: err instanceof Error ? err.message : String(err),
      });
      setIsInstallingUpdate(false);
    }
  }, []);

  const value: OrditoContextValue = {
    loading,
    error,
    query,
    setQuery,
    groups,
    groupNames,
    groupNameById,
    groupIdByName,
    createGroup,
    renameGroup,
    deleteGroup,
    commands: commandsList,
    selectedCommand,
    selectCommand,
    isCreatingCommand,
    startCreateCommand,
    cancelCreateCommand,
    isEditingCommand,
    editCommand,
    cancelEditCommand,
    saveCommand,
    deleteCommand,
    runCommand,
    cancelRun,
    runGroup,
    runningRunIdForCommand,
    activeSchedules,
    pausedSchedules,
    selectedSchedule,
    selectSchedule,
    isCreatingSchedule,
    startCreateSchedule,
    cancelCreateSchedule,
    toggleSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    historyFilter,
    setHistoryFilter,
    filteredRuns,
    runs: runsList,
    settings,
    updateSetting,
    updateInfo,
    isInstallingUpdate,
    dismissUpdate,
    installUpdate,
  };

  return (
    <OrditoContext.Provider value={value}>{children}</OrditoContext.Provider>
  );
}

export function useOrdito() {
  const context = useContext(OrditoContext);

  if (context === null) {
    throw new Error("useOrdito must be used within an OrditoProvider");
  }

  return context;
}
