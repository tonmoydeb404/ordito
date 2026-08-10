import { primaryNav, REPOSITORY_URL } from "@/content/homepage";

export type NavItem = { label: string; href: string; external?: boolean };

export const navItems: NavItem[] = [
  ...primaryNav.map((item) => ({ label: item.label, href: item.href })),
  { label: "GitHub", href: REPOSITORY_URL, external: true },
];
