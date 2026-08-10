import { ArrowDown, ExternalLink } from "lucide-react";

import { AppScreenshot } from "@/components/app-screenshot";
import { sitePaths } from "@/config/paths-config";
import { heroScreenshot } from "@/content/homepage";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="pt-20 md:pt-32 container" aria-labelledby="hero-title">
      <div className="max-w-lg space-y-6">
        <h1
          id="hero-title"
          className="text-3xl font-medium tracking-tight text-balance md:text-5xl"
        >
          Your commands, one tray click away
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
          Save the shell commands you use every day, run them without opening a
          terminal, schedule recurring work, and keep every result in one quiet
          desktop app.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            render={
              <Link href={sitePaths.download} target="_blank" rel="noreferrer">
                Download Now
                <ExternalLink data-icon="inline-end" aria-hidden="true" />
              </Link>
            }
            nativeButton={false}
            size={"lg"}
          />

          <Button
            render={
              <Link href="#features">
                Explore features
                <ArrowDown data-icon="inline-end" aria-hidden="true" />
              </Link>
            }
            variant={"outline"}
            size={"lg"}
          />
        </div>
        <div
          className="flex flex-wrap gap-2 pt-1"
          aria-label="Product availability"
        >
          <Badge variant="secondary">macOS</Badge>
          <Badge variant="secondary">Windows</Badge>
          <Badge variant="secondary">Linux</Badge>
          <Badge variant="outline">Free and open source</Badge>
        </div>
      </div>

      <AppScreenshot
        view={heroScreenshot}
        priority
        className="relative mt-16 overflow-hidden rounded-2xl bg-gradient-to-b from-muted/70 to-background md:mt-20"
      />
    </section>
  );
}
