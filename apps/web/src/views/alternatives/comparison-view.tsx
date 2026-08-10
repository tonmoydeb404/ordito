import { BreadcrumbBuilder } from "@/components/builders";
import { CTACard } from "@/components/cards";
import { PageShell } from "@/components/page-shell";
import { sitePaths } from "@/config/paths-config";
import type { Comparison } from "@/content/comparisons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@packages/ui/components/accordion";

export function ComparisonView({ comparison }: { comparison: Comparison }) {
  return (
    <PageShell>
      <BreadcrumbBuilder
        items={[
          { label: "Home", href: sitePaths.home },
          { label: "Alternatives", href: sitePaths.alternatives.root },
          {
            label: comparison.tool,
            href: sitePaths.alternatives.details(comparison.slug),
          },
        ]}
      />

      <h1 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">
        {comparison.h1}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        {comparison.intro}
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-medium">Where Ordito fits</h2>
        <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
          {comparison.orditoPitch}
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-card border p-5">
          <p className="text-sm font-medium">Use Ordito if you want</p>
          <p className="mt-2 leading-7 text-muted-foreground">
            {comparison.bestForOrdito}
          </p>
        </div>
        <div className="rounded-lg bg-card border p-5">
          <p className="text-sm font-medium">
            Keep {comparison.tool} if you want
          </p>
          <p className="mt-2 leading-7 text-muted-foreground">
            {comparison.bestForTool}
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-medium">How they compare</h2>
        <div className="mt-4 overflow-x-auto rounded-lg ring-1 ring-foreground/10">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-card">
                <th className="px-4 py-3 text-left font-medium">Capability</th>
                <th className="px-4 py-3 text-left font-medium">Ordito</th>
                <th className="px-4 py-3 text-left font-medium capitalize">
                  {comparison.tool}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.table.map((row) => (
                <tr key={row.capability} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.capability}
                  </td>
                  <td className="px-4 py-3">{row.ordito}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.other}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {comparison.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-medium">Common questions</h2>
          <Accordion className="mt-4">
            {comparison.faq.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="py-4 text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl pb-4 leading-7 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      <CTACard
        className="mt-12"
        showSourceButton={false}
        title={`Try Ordito for ${comparison.tool}`}
        description="Free and open source for macOS and Windows. Save a command once and keep it one tray click away."
      />
    </PageShell>
  );
}
