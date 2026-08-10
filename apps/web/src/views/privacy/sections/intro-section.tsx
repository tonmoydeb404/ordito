import { BreadcrumbBuilder } from "@/components/builders";
import { sitePaths } from "@/config/paths-config";

export function PrivacyIntroSection() {
  return (
    <>
      <BreadcrumbBuilder
        items={[
          { label: "Home", href: sitePaths.home },
          { label: "Privacy", href: sitePaths.privacy },
        ]}
      />
      <h1 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">
        Your commands never leave your machine
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Ordito is a local-first desktop app. It stores everything on your device
        and does not contact any server to save, run, schedule, or review your
        commands.
      </p>
    </>
  );
}
