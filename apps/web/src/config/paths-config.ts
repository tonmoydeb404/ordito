/**
 * Central path configuration for the Ordito web site.
 *
 * Single source of truth for every internal route, dynamic path builder,
 * and external URL used across the app. Import from here instead of
 * hardcoding path strings.
 */

// ---------------------------------------------------------------------------
// External URLs
// ---------------------------------------------------------------------------

// @brand:generated-start
export const externalUrls = {
  site: "https://ordito.tonmoydeb.com",
  download: "https://github.com/tonmoydeb404/ordito/releases/latest",
  repository: "https://github.com/tonmoydeb404/ordito",
  license: "https://github.com/tonmoydeb404/ordito/blob/main/LICENSE",
} as const;
// @brand:generated-end

// ---------------------------------------------------------------------------
// Internal static paths
// ---------------------------------------------------------------------------

export const sitePaths = {
  home: "/",
  features: "/features",
  docs: {
    root: "/docs",
    details: (slug: string) => `/docs/${slug}`,
  },
  alternatives: {
    root: "/alternatives",
    details: (slug: string) => `/alternatives/${slug}`,
  },
  changelog: "/changelog",
  download: "/download",
  support: "/support",
  privacy: "/privacy",
  terms: "/terms",
} as const;

export type SitePath = string;

/** Static (non-dynamic) routes, in declaration order — consumed by sitemap and nav. */
export const staticRoutes: readonly SitePath[] = [
  sitePaths.home,
  sitePaths.features,
  sitePaths.docs.root,
  sitePaths.alternatives.root,
  sitePaths.changelog,
  sitePaths.download,
  sitePaths.support,
  sitePaths.privacy,
  sitePaths.terms,
];

// ---------------------------------------------------------------------------
// Full URLs (static path joined with the canonical site origin)
// ---------------------------------------------------------------------------

export const siteUrl = (path: string = sitePaths.home): string =>
  `${externalUrls.site}${path}`;
