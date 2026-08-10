import type { Metadata } from "next";

import { PrivacyView } from "@/views/privacy";
import { sitePaths } from "@/config/paths-config";

export const metadata: Metadata = {
  title: "Privacy — Ordito",
  description:
    "Ordito is local-first. Your commands, schedules, and run history never leave your device. No accounts, no cloud, no telemetry.",
  alternates: { canonical: sitePaths.privacy },
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
