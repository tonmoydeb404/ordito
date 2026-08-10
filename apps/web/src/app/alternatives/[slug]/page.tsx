import type { Metadata } from "next";

import { comparisons, getComparison } from "@/content/comparisons";
import { sitePaths, siteUrl } from "@/config/paths-config";
import { ComparisonView } from "@/views/alternatives/comparison-view";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return comparisons.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparison(slug);

  if (!comparison) {
    return {};
  }

  return {
    title: comparison.metaTitle,
    description: comparison.metaDescription,
    alternates: { canonical: sitePaths.alternatives.details(comparison.slug) },
    openGraph: {
      title: comparison.metaTitle,
      description: comparison.metaDescription,
      url: siteUrl(sitePaths.alternatives.details(comparison.slug)),
    },
  };
}

export default async function ComparisonRoutePage({ params }: { params: Params }) {
  const { slug } = await params;
  const comparison = getComparison(slug);

  if (!comparison) {
    return null;
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comparison.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ComparisonView comparison={comparison} />
    </>
  );
}
