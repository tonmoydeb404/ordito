import { CapabilitiesSection } from "./sections/capabilities-section";
import { ClosingSection } from "./sections/closing-section";
import { FaqSection } from "./sections/faq-section";
import { FeaturesSection } from "./sections/features-section";
import { HeroSection } from "./sections/hero-section";
import { WorkflowSection } from "./sections/workflow-section";

export function HomeView() {
  return (
    <>
      <HeroSection />
      <CapabilitiesSection />
      <FeaturesSection />
      <WorkflowSection />
      <FaqSection />
      <ClosingSection />
    </>
  );
}
