import type { Metadata } from "next";

import { sitePaths } from "@/config/paths-config";
import { AlternativesView } from "@/views/alternatives";

export const metadata: Metadata = {
  title: "Ordito alternatives — How Ordito compares",
  description:
    "See how Ordito compares to cron, Raycast, Alfred, and shell aliases for running repeatable shell commands.",
  alternates: { canonical: sitePaths.alternatives.root },
};

export default function AlternativesPage() {
  return <AlternativesView />;
}
