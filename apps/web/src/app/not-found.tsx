import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { sitePaths } from "@/config/paths-config";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@packages/ui/components/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="max-w-md text-3xl font-medium tracking-tight md:text-4xl">
        This page ran away
      </h1>
      <p className="max-w-md leading-7 text-muted-foreground">
        The page you were looking for does not exist. Head back to the homepage
        or grab the latest release.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonVariants()}>
          Back to home
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
        <a
          href={sitePaths.download}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Download Ordito
        </a>
      </div>
    </div>
  );
}
