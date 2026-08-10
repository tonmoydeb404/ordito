import type { Metadata } from "next";

import { sitePaths } from "@/config/paths-config";
import { DownloadView } from "@/views/download";

export const metadata: Metadata = {
  title: "Download Ordito — macOS, Windows & Ubuntu",
  description:
    "Download Ordito for macOS, Windows, or Ubuntu. Free and open source under the MIT License, or build it from source.",
  alternates: { canonical: sitePaths.download },
};

export default function DownloadPage() {
  return <DownloadView />;
}
