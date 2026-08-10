import type { MetadataRoute } from "next";
import { comparisons } from "@/content/comparisons";
import { docs } from "@/content/docs";
import { sitePaths, siteUrl, staticRoutes } from "@/config/paths-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: siteUrl(route),
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === sitePaths.home ? 1 : 0.8,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...comparisons.map((c) => sitePaths.alternatives.details(c.slug)),
    ...docs.map((d) => sitePaths.docs.details(d.slug)),
  ].map((route) => ({
    url: siteUrl(route),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...dynamicEntries];
}
