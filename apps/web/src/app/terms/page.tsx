import type { Metadata } from "next";

import { TermsView } from "@/views/terms";
import { sitePaths } from "@/config/paths-config";

export const metadata: Metadata = {
  title: "Terms — Ordito",
  description:
    "The terms for using Ordito, a free and open-source desktop app for saving, running, scheduling, and reviewing shell commands.",
  alternates: { canonical: sitePaths.terms },
};

export default function TermsPage() {
  return <TermsView />;
}
