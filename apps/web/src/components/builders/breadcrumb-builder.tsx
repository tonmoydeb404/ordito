import Link from "next/link";

import { SITE_URL } from "@/content/homepage";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbBuilderProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function BreadcrumbBuilder({ items, className }: BreadcrumbBuilderProps) {
  const lastIndex = items.length - 1;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav
        className={cn("text-sm text-muted-foreground", className)}
        aria-label="Breadcrumb"
      >
        {items.map((item, index) => {
          const isCurrent = index === lastIndex;
          return (
            <span key={item.href}>
              {index > 0 && " / "}
              {isCurrent ? (
                <span className="text-foreground">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
