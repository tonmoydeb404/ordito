import type { LucideIcon } from "lucide-react";
import { Bug, LifeBuoy, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { sitePaths } from "@/config/paths-config";
import { REPOSITORY_URL } from "@/content/homepage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card";

type Channel = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
  external: boolean;
};

const channels: Channel[] = [
  {
    icon: Bug,
    title: "Report a bug",
    description:
      "Found something broken or behaving unexpectedly? Open an issue with steps to reproduce it.",
    href: `${REPOSITORY_URL}/issues`,
    cta: "Open an issue",
    external: true,
  },
  {
    icon: MessageSquare,
    title: "Ask a question",
    description:
      "Stuck on setup or wondering how a feature works? Start a discussion or check existing issues.",
    href: `${REPOSITORY_URL}/issues`,
    cta: "Browse issues",
    external: true,
  },
  {
    icon: LifeBuoy,
    title: "Read the docs",
    description:
      "Installation, saving commands, scheduling, history, and troubleshooting — covered step by step.",
    href: sitePaths.docs.root,
    cta: "Open docs",
    external: false,
  },
  {
    icon: ShieldCheck,
    title: "Privacy & security",
    description:
      "Ordito is local-first with no accounts, cloud sync, or telemetry. See exactly what stays on your device.",
    href: sitePaths.privacy,
    cta: "Read the privacy notes",
    external: false,
  },
];

export function SupportChannelsSection() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {channels.map((channel) => {
        const Icon = channel.icon;
        const link = channel.external ? (
          <a
            href={channel.href}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-foreground underline underline-offset-4"
          >
            {channel.cta}
          </a>
        ) : (
          <Link
            href={channel.href}
            className="text-sm font-medium text-foreground underline underline-offset-4"
          >
            {channel.cta}
          </Link>
        );

        return (
          <Card key={channel.title}>
            <CardHeader>
              <Icon
                className="mb-2 size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <CardTitle className="text-base">{channel.title}</CardTitle>
              <CardDescription className="leading-6">
                {channel.description}
              </CardDescription>
            </CardHeader>
            <CardContent>{link}</CardContent>
          </Card>
        );
      })}
    </div>
  );
}
