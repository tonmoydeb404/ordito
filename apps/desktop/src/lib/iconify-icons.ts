const SEARCH_PREFIXES: string[] = [];

type IconifySearchResponse = {
  icons?: string[];
};

export async function searchIconifyIcons(
  query: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const params = new URLSearchParams({
    query,
    limit: "64",
    prefixes: SEARCH_PREFIXES.join(","),
  });

  const res = await fetch(`https://api.iconify.design/search?${params}`, {
    signal,
  });
  if (!res.ok) {
    throw new Error(`Iconify search failed with status ${res.status}`);
  }

  const data = (await res.json()) as IconifySearchResponse;
  return data.icons ?? [];
}

export function formatIconLabel(iconKey: string): string {
  const [prefix, name] = iconKey.split(":");
  if (!name) return iconKey;
  return `${name.replace(/-/g, " ")} (${prefix})`;
}
