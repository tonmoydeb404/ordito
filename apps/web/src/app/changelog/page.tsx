import type { Metadata } from "next";

import { ChangelogView } from "@/views/changelog";
import { sitePaths } from "@/config/paths-config";

export const metadata: Metadata = {
  title: "Changelog — Ordito",
  description:
    "What's new in each build of Ordito. New features, improvements, and fixes for the tray-based shell command runner.",
  alternates: { canonical: sitePaths.changelog },
};

export default function ChangelogPage() {
  return <ChangelogView />;
}
