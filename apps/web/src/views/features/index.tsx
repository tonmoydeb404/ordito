import { BreadcrumbBuilder } from "@/components/builders";
import { PageShell } from "@/components/page-shell";
import { sitePaths } from "@/config/paths-config";
import { features } from "@/content/features";

export function FeaturesView() {
  return (
    <PageShell>
      <BreadcrumbBuilder
        items={[
          { label: "Home", href: sitePaths.home },
          { label: "Features", href: sitePaths.features },
        ]}
      />
      <h1 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">
        Everything a saved command needs
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        From the tray click to the run history, each feature keeps repeatable
        shell work organized and out of the terminal.
      </p>

      <ul className="mt-10 space-y-4">
        {features.map((feature) => (
          <li
            key={feature.slug}
            className="rounded-lg p-5 ring-1 ring-foreground/10 bg-card"
          >
            <h2 className="text-base font-medium">{feature.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {feature.metaDescription}
            </p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
