import { zodResolver } from "@hookform/resolvers/zod";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Check,
  ChevronRight,
  Copy,
  FolderOpen,
  LucideX,
  Pencil,
  Play,
  SquareTerminal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState } from "@/components/empty-state";
import { HistoryRow } from "@/components/history-row";
import { IconPicker, IconPreview } from "@/components/icon-picker";
import { Button } from "@packages/ui/components/button";
import { FieldGroup } from "@packages/ui/components/field";
import { InputGroupButton } from "@packages/ui/components/input-group";
import { Separator } from "@packages/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/ui/components/tabs";
import {
  RhfControlled,
  RhfInput,
  RhfInputGroup,
  RhfSelect,
  RhfSwitch,
  RhfTextarea,
} from "@packages/ui/fields/rhf";

import { useOrdito } from "@/context/ordito-context";
import { formatDateTime, formatTimestamp } from "@/lib/format";
import { scheduledLabel, statusDotClass, statusLabels } from "@/lib/status";
import type { CommandFormData } from "@/types";

const commandSchema = z.object({
  icon: z.string().nullable(),
  name: z.string().trim().min(1, "Name is required"),
  command: z.string().trim().min(1, "Command is required"),
  cwd: z.string().trim(),
  group: z.string().min(1, "Select a group"),
  runInBackground: z.boolean(),
  requiresConfirmation: z.boolean(),
});

type CommandFormValues = z.infer<typeof commandSchema>;

const CREATE_DEFAULTS: CommandFormValues = {
  icon: null,
  name: "",
  command: "",
  cwd: "",
  group: "Development",
  runInBackground: true,
  requiresConfirmation: false,
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        });
      }}
      className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors duration-120 hover:bg-control-hover hover:text-ink"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <dt className="text-[0.68rem] font-[760] text-faint">{label}</dt>
      <dd className="text-[0.8rem] text-ink">{children}</dd>
    </div>
  );
}

function CodeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-[0.68rem] font-[760] text-faint">{label}</dt>
      <dd className="flex items-start gap-1.5 rounded-lg border border-border bg-field px-2.5 py-2">
        <code className="min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-[0.72rem] text-muted-foreground">
          {value}
        </code>
        <CopyButton value={value} />
      </dd>
    </div>
  );
}

export function CommandDetailPanel() {
  const {
    selectedCommand,
    groupNames,
    groupNameById,
    runCommand,
    cancelRun,
    runs,
    activeSchedules,
    selectCommand,
    isCreatingCommand,
    cancelCreateCommand,
    isEditingCommand,
    editCommand,
    cancelEditCommand,
    saveCommand,
  } = useOrdito();

  const cmd = selectedCommand;
  const showForm = isCreatingCommand || (isEditingCommand && !!cmd);
  const editingCommand = isCreatingCommand ? null : cmd;

  const form = useForm<CommandFormValues>({
    resolver: zodResolver(commandSchema),
    defaultValues: CREATE_DEFAULTS,
    mode: "onTouched",
  });
  const { control, reset, handleSubmit, setValue, formState } = form;

  useEffect(() => {
    if (!showForm) return;

    if (editingCommand) {
      reset({
        icon: editingCommand.icon,
        name: editingCommand.name,
        command: editingCommand.command,
        cwd: editingCommand.cwd,
        group: groupNameById(editingCommand.groupId),
        requiresConfirmation: editingCommand.requiresConfirmation,
        runInBackground: editingCommand.runInBackground,
      });
    } else {
      reset({
        ...CREATE_DEFAULTS,
        group: groupNames[0] ?? "Development",
      });
    }
  }, [showForm, editingCommand, groupNames, groupNameById, reset]);

  function closeForm() {
    if (editingCommand) {
      cancelEditCommand();
    } else {
      cancelCreateCommand();
    }
  }

  async function onSubmit(data: CommandFormValues) {
    try {
      const payload: CommandFormData = {
        name: data.name,
        command: data.command,
        cwd: data.cwd,
        group: data.group,
        requiresConfirmation: data.requiresConfirmation,
        runInBackground: data.runInBackground,
        icon: data.icon,
      };
      await saveCommand(payload, editingCommand?.id);
    } catch (err) {
      console.error("Failed to save command:", err);
      toast.error("Failed to save command.");
    }
  }

  if (!cmd && !isCreatingCommand) {
    return (
      <aside className="flex h-full w-full flex-col bg-panel">
        <EmptyState
          className="w-full h-full border-0"
          icon={<SquareTerminal size={24} />}
          title="No command selected"
          description="Select a command from the list to see its details."
        />
      </aside>
    );
  }

  if (showForm) {
    const heading = editingCommand ? "Edit command" : "New command";

    return (
      <aside className="flex h-full w-full flex-col border-l border-border bg-panel">
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <h2 className="min-w-0 flex-1 truncate text-[0.88rem] font-[720] text-ink">
            {heading}
          </h2>
          <Button variant="outline" size="icon-sm" onClick={closeForm}>
            <LucideX size={14} />
          </Button>
        </div>

        <Separator />

        <form
          id="command-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <FieldGroup className="min-h-0 flex-1 gap-4 overflow-auto scrollbar-thin p-4">
            <RhfControlled
              control={control}
              name="icon"
              label="Icon"
              render={(field) => (
                <IconPicker
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />

            <RhfInput
              control={control}
              name="name"
              id="cmd-name"
              label="Name"
              placeholder="Deploy staging"
            />

            <RhfTextarea
              control={control}
              name="command"
              id="cmd-command"
              label="Command"
              className="min-h-24 resize-none font-mono"
              placeholder="pnpm deploy:staging"
              rows={3}
            />

            <RhfInputGroup
              control={control}
              name="cwd"
              id="cmd-cwd"
              label="Working directory"
              className="font-mono"
              placeholder="~/Works/project"
              endAddon={
                <InputGroupButton
                  aria-label="Browse folder"
                  onClick={async () => {
                    const selected = await open({
                      directory: true,
                      multiple: false,
                    });
                    if (typeof selected === "string") {
                      setValue("cwd", selected, { shouldDirty: true });
                    }
                  }}
                >
                  <FolderOpen size={15} />
                </InputGroupButton>
              }
            />

            <RhfSelect
              control={control}
              name="group"
              label="Group"
              options={groupNames.map((name) => ({ label: name, value: name }))}
            />

            <RhfSwitch
              control={control}
              name="runInBackground"
              id="cmd-bg"
              label="Run in background"
              description="Capture output silently. Off opens a terminal window."
              fieldClassName="items-center justify-between rounded-lg bg-muted p-3"
              aria-label="Run in background"
            />

            <RhfSwitch
              control={control}
              name="requiresConfirmation"
              id="cmd-confirm"
              label="Confirm before running"
              description="Require approval for sensitive commands."
              fieldClassName="items-center justify-between rounded-lg bg-muted p-3"
              aria-label="Confirm before running"
            />
          </FieldGroup>

          <Separator />

          <div className="flex items-center gap-2 px-4 py-3">
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              type="submit"
              disabled={formState.isSubmitting}
            >
              {editingCommand ? "Save changes" : "Save command"}
              <ChevronRight size={15} />
            </Button>
          </div>
        </form>
      </aside>
    );
  }

  const groupName = cmd?.groupId ? groupNameById(cmd.groupId) : "";
  const commandRuns = runs.filter((r) => r.commandId === cmd?.id).slice(0, 20);
  const isScheduled =
    cmd?.status === "idle" &&
    activeSchedules.some((s) => s.commandId === cmd.id);

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-panel">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-control text-muted-foreground">
          <IconPreview iconKey={cmd!.icon} className="size-4.5" />
        </span>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h2 className="truncate text-[0.88rem] font-[720] text-ink">
            {cmd!.name}
          </h2>
          <div className="flex items-center gap-1.5">
            <span
              className={`size-1.5 rounded-full ${statusDotClass[cmd!.status]}`}
            />
            <span className="text-[0.68rem] text-faint">
              {isScheduled ? scheduledLabel : statusLabels[cmd!.status]}
            </span>
          </div>
        </div>

        <div>
          <Button
            variant={"outline"}
            size={"icon-sm"}
            onClick={() => selectCommand(null)}
          >
            <LucideX size={14} />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs
        defaultValue="details"
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>

        {/* Details tab */}
        <TabsContent
          value="details"
          className="min-h-0 flex-1 overflow-auto scrollbar-thin"
        >
          <dl className="grid gap-3.5 px-4 py-4">
            <DetailField label="Group">{groupName}</DetailField>

            <CodeField label="Command" value={cmd!.command} />

            <CodeField label="Working directory" value={cmd!.cwd} />

            <div className="grid grid-cols-2 gap-3">
              <DetailField label="Confirmation required">
                {cmd!.requiresConfirmation ? "Yes" : "No"}
              </DetailField>
              <DetailField label="Background mode">
                {cmd!.runInBackground ? "Yes" : "No"}
              </DetailField>
            </div>

            <DetailField label="Last run">
              {cmd!.lastRunAt ? formatDateTime(cmd!.lastRunAt) : "Never run"}
            </DetailField>

            <DetailField label="Last run (relative)">
              {formatTimestamp(cmd!.lastRunAt)}
            </DetailField>
          </dl>
        </TabsContent>

        {/* History tab */}
        <TabsContent
          value="history"
          className="min-h-0 flex-1 overflow-auto scrollbar-thin"
        >
          {commandRuns.length === 0 ? (
            <div className="grid place-items-center gap-1.5 px-6 py-12 text-center">
              <span className="text-[0.82rem] font-bold text-ink">
                No runs yet
              </span>
              <span className="text-[0.72rem] text-muted-foreground">
                Run this command to see its execution history.
              </span>
            </div>
          ) : (
            <div className="p-4">
              {commandRuns.map((run) => (
                <HistoryRow
                  key={run.id}
                  run={run}
                  commandName={cmd!.name}
                  onCancel={cancelRun}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Button className="flex-1" onClick={() => runCommand(cmd!.id)}>
          <Play size={14} fill="currentColor" strokeWidth={0} />
          Run command
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Edit command"
          onClick={() => editCommand(cmd!.id)}
        >
          <Pencil size={14} />
        </Button>
      </div>
    </aside>
  );
}
