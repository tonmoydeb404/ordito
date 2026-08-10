import type { Metadata } from "next";

import { FeaturesView } from "@/views/features";
import { sitePaths } from "@/config/paths-config";

export const metadata: Metadata = {
  title: "Features — Ordito",
  description:
    "Tray execution, command groups and search, scheduling, and full run history. Everything a saved shell command needs.",
  alternates: { canonical: sitePaths.features },
};

export default function FeaturesPage() {
  return <FeaturesView />;
}
