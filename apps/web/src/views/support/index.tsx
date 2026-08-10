import { PageShell } from "@/components/page-shell";
import { BeforeFilingSection } from "./sections/before-filing-section";
import { SupportChannelsSection } from "./sections/channels-section";
import { SupportIntroSection } from "./sections/intro-section";

export function SupportView() {
  return (
    <PageShell>
      <SupportIntroSection />
      <SupportChannelsSection />
      <BeforeFilingSection />
    </PageShell>
  );
}
