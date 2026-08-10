import { PageShell } from "@/components/page-shell";
import { BuildSourceSection } from "./sections/build-source-section";
import { DownloadsSection } from "./sections/downloads-section";
import { DownloadIntroSection } from "./sections/intro-section";

export function DownloadView() {
  return (
    <PageShell>
      <DownloadIntroSection />
      <DownloadsSection />
      <BuildSourceSection />
    </PageShell>
  );
}
