import { BreadcrumbBuilder } from "@/components/builders";
import { LinkCard } from "@/components/cards";
import { PageShell } from "@/components/page-shell";
import { sitePaths } from "@/config/paths-config";
import { docs } from "@/content/docs";

export function DocsView() {
  return (
    <PageShell>
      <BreadcrumbBuilder
        items={[
          { label: "Home", href: sitePaths.home },
          { label: "Docs", href: sitePaths.docs.root },
        ]}
      />
      <h1 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">
        Ordito documentation
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Everything from your first saved command to cron schedules, run history,
        and troubleshooting.
      </p>

      <ul className="mt-10 space-y-4">
        {docs.map((doc) => (
          <li key={doc.slug}>
            <LinkCard
              title={doc.title}
              description={doc.metaDescription}
              href={sitePaths.docs.details(doc.slug)}
            />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
