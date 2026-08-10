import type { Metadata } from "next";

import { DocsView } from "@/views/docs";
import { sitePaths } from "@/config/paths-config";

export const metadata: Metadata = {
  title: "Docs — Ordito",
  description:
    "Learn how to save shell commands, run them from the tray, schedule recurring runs, and review execution history in Ordito.",
  alternates: { canonical: sitePaths.docs.root },
};

export default function DocsPage() {
  return <DocsView />;
}
