"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "@packages/ui/components/button";

type ThemeOption = "light" | "dark" | "system";

const config: Record<
  ThemeOption,
  { icon: typeof Sun; label: string; next: ThemeOption }
> = {
  light: { icon: Sun, label: "Light", next: "dark" },
  dark: { icon: Moon, label: "Dark", next: "system" },
  system: { icon: Monitor, label: "System", next: "light" },
};

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resolvedTheme, setTheme]);

  const current = (theme as ThemeOption | undefined) ?? "system";
  const { icon: Icon, label, next } = config[current];

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Theme: ${label}. Click for ${config[next].label}. Press ⌘D to toggle dark mode.`}
      title={`Theme: ${label} — press ⌘D to toggle`}
      onClick={() => setTheme(next)}
    >
      {mounted ? <Icon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}
