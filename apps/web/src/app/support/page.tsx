import type { Metadata } from "next";

import { SupportView } from "@/views/support";
import { sitePaths } from "@/config/paths-config";

export const metadata: Metadata = {
  title: "Support — Ordito",
  description:
    "Get help with Ordito. Report bugs and request features on GitHub, read the docs, or review how Ordito handles your data.",
  alternates: { canonical: sitePaths.support },
};

export default function SupportPage() {
  return <SupportView />;
}
