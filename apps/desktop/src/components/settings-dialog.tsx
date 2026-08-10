import { useModal } from "@/context/modal-context";
import { useOrdito } from "@/context/ordito-context";
import { api } from "@/lib/api";
import { brand } from "@/lib/brand";
import { Button } from "@packages/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/dialog";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { Switch } from "@packages/ui/components/switch";
import { Download, Moon, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-2">
      <h3 className="text-[0.68rem] font-[760] text-faint">{title}</h3>
      {children}
    </section>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  icon,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-control text-muted-foreground">
            {icon}
          </span>
        )}
        <span className="grid min-w-0 gap-0.5">
          <strong className="text-[0.82rem] text-ink">{title}</strong>
          <small className="truncate text-[0.7rem] text-muted-foreground">
            {description}
          </small>
        </span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}

export function SettingsDialog() {
  const { settings: settingsModal } = useModal();
  const { settings, updateSetting } = useOrdito();
  const { theme, setTheme } = useTheme();

  const [maxHistoryRuns, setMaxHistoryRuns] = useState("500");
  const [logRetentionDays, setLogRetentionDays] = useState("30");
  const [autostart, setAutostart] = useState(false);

  useEffect(() => {
    setMaxHistoryRuns(settings.max_history_runs ?? "500");
    setLogRetentionDays(settings.log_retention_days ?? "30");
    api
      .isAutostartEnabled()
      .then(setAutostart)
      .catch(() => {});
  }, [settings]);

  function handleThemeToggle(checked: boolean) {
    setTheme(checked ? "dark" : "light");
  }

  function handleHistoryRunsBlur() {
    const value = maxHistoryRuns.trim() || "500";
    if (value !== (settings.max_history_runs ?? "500")) {
      updateSetting("max_history_runs", value);
    }
  }

  function handleLogRetentionBlur() {
    const value = logRetentionDays.trim() || "30";
    if (value !== (settings.log_retention_days ?? "30")) {
      updateSetting("log_retention_days", value);
    }
  }

  async function handleAutostartToggle(checked: boolean) {
    setAutostart(checked);
    try {
      if (checked) {
        await api.enableAutostart();
        toast.success(`${brand.appName} will launch on system boot.`);
      } else {
        await api.disableAutostart();
        toast.success("Autostart disabled.");
      }
    } catch (err) {
      console.error("Autostart toggle failed:", err);
      toast.error("Failed to change autostart setting.");
      setAutostart(!checked);
    }
  }

  async function handleExport() {
    try {
      const json = await api.exportConfig();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ordito-config.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Configuration exported.");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Export failed. Please try again.");
    }
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        await api.importConfig(text);
        toast.success("Configuration imported. Reloading…");
        window.location.reload();
      } catch (err) {
        console.error("Import failed:", err);
        toast.error("Import failed. Check the file and try again.");
      }
    };
    input.click();
  }

  function handleClose(open: boolean) {
    if (!open) settingsModal.close();
  }

  return (
    <Dialog open={settingsModal.isOpen} onOpenChange={handleClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure {brand.appName} to fit your workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-6 overflow-auto scrollbar-thin p-4">
          <SettingsSection title="APPEARANCE">
            <ToggleRow
              title="Dark theme"
              description="Toggle between dark and light appearance."
              checked={theme === "dark"}
              onChange={handleThemeToggle}
              icon={<Moon size={15} />}
            />
          </SettingsSection>

          <SettingsSection title="EXECUTION">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="set-history" className="text-[0.76rem]">
                  Max history runs
                </Label>
                <Input
                  id="set-history"
                  type="number"
                  min="1"
                  value={maxHistoryRuns}
                  onChange={(e) => setMaxHistoryRuns(e.currentTarget.value)}
                  onBlur={handleHistoryRunsBlur}
                  className="h-8"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="set-retention" className="text-[0.76rem]">
                  Log retention (days)
                </Label>
                <Input
                  id="set-retention"
                  type="number"
                  min="1"
                  value={logRetentionDays}
                  onChange={(e) => setLogRetentionDays(e.currentTarget.value)}
                  onBlur={handleLogRetentionBlur}
                  className="h-8"
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="SYSTEM">
            <ToggleRow
              title="Start at login"
              description={`Launch ${brand.appName} automatically on system boot.`}
              checked={autostart}
              onChange={handleAutostartToggle}
            />
          </SettingsSection>

          <SettingsSection title="DATA">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex-1"
                size="sm"
              >
                <Download size={14} />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={handleImport}
                className="flex-1"
                size="sm"
              >
                <Upload size={14} />
                Import
              </Button>
            </div>
          </SettingsSection>
        </div>

        <div className="flex justify-end border-t border-border p-4">
          <DialogClose render={<Button variant="secondary">Done</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
