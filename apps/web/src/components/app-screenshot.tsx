import Image from "next/image";

import { cn } from "@/lib/utils";

export type AppScreenshotView = "commands" | "schedules" | "history";

const SCREENSHOT_SRC: Record<AppScreenshotView, string> = {
  commands: "/screenshots/commands.png",
  schedules: "/screenshots/schedule.png",
  history: "/screenshots/history.png",
};

// Native resolution of every screenshot in public/screenshots (the macOS
// menu bar is cropped off; the app itself is borderless, so we add our own
// window chrome below).
const SOURCE_WIDTH = 3420;
const SOURCE_HEIGHT = 2126;

type AppScreenshotProps = {
  view: AppScreenshotView;
  priority?: boolean;
  className?: string;
};

/** A real screenshot of the full-window Ordito desktop app, framed like a window. */
export function AppScreenshot({
  view,
  priority,
  className,
}: AppScreenshotProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-lg border shadow-xl", className)}
    >
      <div className="flex items-center gap-1.5 border-b bg-muted/60 px-3 py-2">
        <span className="size-2.5 rounded-full bg-red-500/70" />
        <span className="size-2.5 rounded-full bg-yellow-500/70" />
        <span className="size-2.5 rounded-full bg-green-500/70" />
      </div>
      <Image
        src={SCREENSHOT_SRC[view]}
        alt={`Ordito ${view} view`}
        width={SOURCE_WIDTH}
        height={SOURCE_HEIGHT}
        priority={priority}
        className="block h-auto w-full"
      />
    </div>
  );
}
