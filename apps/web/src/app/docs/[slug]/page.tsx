import type { Metadata } from "next";

import { docs, getDoc } from "@/content/docs";
import { sitePaths } from "@/config/paths-config";
import { DocView } from "@/views/docs/doc-view";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (!doc) {
    return {};
  }

  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: { canonical: sitePaths.docs.details(doc.slug) },
  };
}

export default async function DocRoutePage({ params }: { params: Params }) {
  const { slug } = await params;
  const doc = getDoc(slug);

  if (!doc) {
    return null;
  }

  const index = docs.findIndex((d) => d.slug === slug);
  const nextDoc = index >= 0 && index < docs.length - 1 ? docs[index + 1] : null;

  return <DocView doc={doc} next={nextDoc ?? null} />;
}
