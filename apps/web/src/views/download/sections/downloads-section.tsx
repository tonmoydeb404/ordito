"use client";

import { Laptop, Monitor, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

import { sitePaths } from "@/config/paths-config";
import { scriptUrls } from "@/config/scripts-config";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@packages/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/ui/components/tabs";

type OsId = "macos" | "windows" | "linux";

const platforms: {
  id: OsId;
  label: string;
  icon: typeof Monitor;
  description: string;
  command: string;
}[] = [
  {
    id: "macos",
    label: "macOS",
    icon: Monitor,
    description:
      "Apple Silicon only. Installs via Homebrew — the .dmg is unsigned and macOS will flag it as damaged if opened directly.",
    command: `curl -fsSL ${scriptUrls.setupSh} | sh`,
  },
  {
    id: "windows",
    label: "Windows",
    icon: Laptop,
    description: "x64 only. Downloads and silently runs the latest installer.",
    command: `irm ${scriptUrls.setupPs1} | iex`,
  },
  {
    id: "linux",
    label: "Ubuntu / Linux",
    icon: Terminal,
    description: "x86_64 only. Downloads the .deb and installs it via dpkg.",
    command: `curl -fsSL ${scriptUrls.setupSh} | sh`,
  },
];

function detectOs(): OsId {
  if (typeof navigator === "undefined") return "macos";
  const ua = navigator.userAgent;
  if (/Win/i.test(ua)) return "windows";
  if (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) return "linux";
  return "macos";
}

export function DownloadsSection() {
  const [os, setOs] = useState<OsId>("macos");

  useEffect(() => {
    setOs(detectOs());
  }, []);

  return (
    <Tabs
      value={os}
      onValueChange={(value) => setOs(value as OsId)}
      className="mt-10"
    >
      <TabsList className="grid h-auto w-full grid-cols-1 gap-3 bg-transparent p-0 group-data-horizontal/tabs:h-auto sm:grid-cols-3">
        {platforms.map((platform) => (
          <TabsTrigger
            key={platform.id}
            value={platform.id}
            className="h-auto flex-col items-start gap-1 rounded-lg border border-border bg-card px-4 py-3 text-left shadow-none after:content-none data-active:border-primary data-active:bg-primary data-active:shadow-none data-active:text-primary-foreground data-active:hover:text-primary-foreground data-active:hover:bg-primary/90 dark:data-active:bg-primary dark:data-active:text-primary-foreground"
          >
            <platform.icon className="size-5" aria-hidden="true" />
            <span className="text-sm font-medium">{platform.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {platforms.map((platform) => (
        <TabsContent
          key={platform.id}
          value={platform.id}
          className="mt-6 rounded-lg border border-border bg-card p-4"
        >
          <p className="text-sm leading-6 text-muted-foreground">
            {platform.description}
          </p>
          <code className="mt-3 block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {platform.command}
          </code>
          {platform.id === "windows" ? (
            <a
              href={sitePaths.download}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "link" }),
                "mt-2 h-auto p-0 text-xs",
              )}
            >
              Or download the .msi/.exe manually
            </a>
          ) : null}
        </TabsContent>
      ))}
    </Tabs>
  );
}
