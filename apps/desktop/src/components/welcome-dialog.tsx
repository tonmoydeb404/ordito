import { brand } from "@/lib/brand";
import { Button } from "@packages/ui/components/button";
import { Checkbox } from "@packages/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/dialog";
import { Rocket } from "lucide-react";
import { useState } from "react";

type WelcomeDialogProps = {
  open: boolean;
  isSeeding: boolean;
  onGetStarted: (loadStarter: boolean) => void;
};

export function WelcomeDialog({
  open,
  isSeeding,
  onGetStarted,
}: WelcomeDialogProps) {
  const [loadStarter, setLoadStarter] = useState(true);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent size="lg" showCloseButton={false}>
        <DialogHeader className="flex-row items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Rocket size={18} />
          </span>
          <span className="grid gap-0.5">
            <DialogTitle>Welcome to {brand.appName}</DialogTitle>
            <DialogDescription>{brand.description.short}</DialogDescription>
          </span>
        </DialogHeader>

        <div className="grid gap-4 p-4 pt-0">
          <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
            Organize your shell commands into named groups and run them with a
            single click — from the panel or the system tray. You can also
            schedule recurring (cron) and one-time runs, and review every
            execution in history.
          </p>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-control/40">
            <Checkbox
              id="welcome-starter"
              checked={loadStarter}
              onCheckedChange={(v) => setLoadStarter(v === true)}
              className="mt-0.5"
            />
            <span className="grid min-w-0 gap-1">
              <strong className="text-[0.82rem] text-ink">
                Load starter scripts
              </strong>
              <small className="text-[0.74rem] leading-relaxed text-muted-foreground">
                Adds three ready-made groups — Quick Launch, System Utilities,
                and Developer Tools — so you can see how {brand.appName} works.
                You can edit or delete them anytime.
              </small>
            </span>
          </label>
        </div>

        <div className="flex justify-end border-t border-border p-4">
          <Button
            onClick={() => onGetStarted(loadStarter)}
            disabled={isSeeding}
          >
            {isSeeding ? "Setting up…" : "Get started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
