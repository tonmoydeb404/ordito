import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { footerGroups } from "@/content/homepage";
import { Separator } from "@packages/ui/components/separator";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="container w-full pb-10 md:pb-16">
      <Separator />
      <div className="grid gap-12 py-10 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="max-w-xs space-y-3">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Image
              src="/logo.svg"
              alt="Ordito Logo"
              width={24}
              height={24}
              className="border rounded-xl"
            />
            Ordito
          </Link>
          <p className="text-sm leading-6 text-muted-foreground">
            A focused desktop app for saving, running, scheduling, and reviewing
            repeatable shell commands.
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title} className="min-w-32 space-y-3">
            <h2 className="text-sm font-medium">{group.title}</h2>
            <ul className="space-y-2">
              {group.links.map((link) => {
                const isExternal = "external" in link && link.external;

                return (
                  <li key={link.label}>
                    {isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ordito. Released under the MIT License.
        </p>
        <ThemeToggle />
      </div>
    </footer>
  );
}
