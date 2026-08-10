import { sitePaths } from "@/config/paths-config";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@packages/ui/components/button";

export function LatestBuildSection() {
  return (
    <section className="mt-16 rounded-lg bg-muted p-6">
      <h2 className="text-lg font-medium">Get the latest build</h2>
      <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
        Pre-built binaries for macOS and Windows are on GitHub Releases.
      </p>
      <a
        href={sitePaths.download}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants(), "mt-4")}
      >
        View releases
      </a>
    </section>
  );
}
