import Link from "next/link";

import { sitePaths } from "@/config/paths-config";
import { Button } from "@packages/ui/components/button";
import Image from "next/image";
import { navItems } from "./config";
import { SiteMobileMenu } from "./site-mobile-menu";

export function SiteHeader() {
  return (
    <header className="w-full bg-background/80 backdrop-blur-md pt-10">
      <div className="container flex items-center justify-between gap-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-medium">
          <Image
            src="/logo.svg"
            alt="Ordito Logo"
            width={32}
            height={32}
            className="border rounded-xl"
          />
          <span className="text-lg">Ordito</span>
        </Link>

        <nav
          className="hidden items-center gap-5 md:flex"
          aria-label="Primary navigation"
        >
          {navItems.map((item) =>
            item.external ? (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            ),
          )}
          <Button
            nativeButton={false}
            render={
              <Link href={sitePaths.download} target="_blank" rel="noreferrer">
                Download
              </Link>
            }
          />
        </nav>

        <SiteMobileMenu />
      </div>
    </header>
  );
}
