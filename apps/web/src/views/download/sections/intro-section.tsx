import { BreadcrumbBuilder } from "@/components/builders";
import { sitePaths } from "@/config/paths-config";

export function DownloadIntroSection() {
  return (
    <>
      <BreadcrumbBuilder
        items={[
          { label: "Home", href: sitePaths.home },
          { label: "Download", href: sitePaths.download },
        ]}
      />
      <h1 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">
        Get Ordito
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Free and open source under the MIT License. Pre-built desktop binaries
        are published on GitHub Releases for macOS and Windows.
      </p>
    </>
  );
}
