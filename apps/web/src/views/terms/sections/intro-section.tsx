import { BreadcrumbBuilder } from "@/components/builders";
import { sitePaths } from "@/config/paths-config";

export function TermsIntroSection() {
  return (
    <>
      <BreadcrumbBuilder
        items={[
          { label: "Home", href: sitePaths.home },
          { label: "Terms", href: sitePaths.terms },
        ]}
      />
      <h1 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">
        Terms of use
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Ordito is free, open-source software released under the MIT License.
        These terms explain what that means in plain language.
      </p>
    </>
  );
}
