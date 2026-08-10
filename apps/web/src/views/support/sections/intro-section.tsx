import { BreadcrumbBuilder } from "@/components/builders";
import { sitePaths } from "@/config/paths-config";

export function SupportIntroSection() {
  return (
    <>
      <BreadcrumbBuilder
        items={[
          { label: "Home", href: sitePaths.home },
          { label: "Support", href: sitePaths.support },
        ]}
      />
      <h1 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">
        Get help with Ordito
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Ordito is free and open source. The fastest way to get help is right in
        the GitHub repository — pick the path that fits below.
      </p>
    </>
  );
}
