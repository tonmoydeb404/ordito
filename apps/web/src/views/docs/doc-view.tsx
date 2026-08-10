import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { BreadcrumbBuilder } from "@/components/builders";
import { PageShell } from "@/components/page-shell";
import { sitePaths } from "@/config/paths-config";
import type { DocPage } from "@/content/docs";

type DocViewProps = {
  doc: DocPage;
  next: DocPage | null;
};

export function DocView({ doc, next }: DocViewProps) {
  return (
    <PageShell>
      <BreadcrumbBuilder
        items={[
          { label: "Home", href: sitePaths.home },
          { label: "Docs", href: sitePaths.docs.root },
          { label: doc.title, href: sitePaths.docs.details(doc.slug) },
        ]}
      />

      <h1 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">
        {doc.h1}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        {doc.intro}
      </p>

      <div className="mt-12 space-y-10">
        {doc.body.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-medium">{section.heading}</h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
              {section.text}
            </p>
          </section>
        ))}
      </div>

      {doc.shortcuts && doc.shortcuts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-medium">Keyboard shortcuts</h2>
          <dl className="mt-4 divide-y divide-border overflow-hidden rounded-lg ring-1 ring-foreground/10">
            {doc.shortcuts.map((shortcut) => (
              <div
                key={shortcut.action}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <dt className="text-sm leading-6 text-muted-foreground">
                  {shortcut.action}
                </dt>
                <dd>
                  <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                    {shortcut.keys}
                  </kbd>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {next && (
        <section className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">Next</p>
          <Link
            href={sitePaths.docs.details(next.slug)}
            className="group mt-2 inline-flex items-center gap-2 text-lg font-medium"
          >
            {next.title}
            <ArrowRight
              className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </section>
      )}
    </PageShell>
  );
}
