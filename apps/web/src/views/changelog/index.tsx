import { CTACard } from "@/components/cards";
import { PageShell } from "@/components/page-shell";
import { ChangelogIntroSection } from "./sections/intro-section";
import { TimelineSection } from "./sections/timeline-section";

export function ChangelogView() {
  return (
    <PageShell>
      <ChangelogIntroSection />
      <TimelineSection />
      <CTACard className="mt-12" />
    </PageShell>
  );
}
