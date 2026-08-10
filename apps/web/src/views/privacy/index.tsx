import { PageShell } from "@/components/page-shell";
import { CommandsSection } from "./sections/commands-section";
import { LocalDataSection } from "./sections/local-data-section";
import { NoTransmissionSection } from "./sections/no-transmission-section";
import { PrivacyIntroSection } from "./sections/intro-section";
import { VerifySection } from "./sections/verify-section";

export function PrivacyView() {
  return (
    <PageShell>
      <PrivacyIntroSection />
      <LocalDataSection />
      <NoTransmissionSection />
      <CommandsSection />
      <VerifySection />
    </PageShell>
  );
}
