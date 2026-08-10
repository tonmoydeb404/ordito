"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { sitePaths } from "@/config/paths-config";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@packages/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@packages/ui/components/drawer";
import { navItems } from "./config";

export function SiteMobileMenu() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerTrigger render={<Button variant="outline" size="icon" />}>
          <Menu aria-hidden="true" />
          <span className="sr-only">Open navigation</span>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Ordito</DrawerTitle>
            <DrawerDescription>
              Your saved shell commands, one tray click away.
            </DrawerDescription>
          </DrawerHeader>
          <nav className="flex flex-col px-4" aria-label="Mobile navigation">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="border-b py-4 text-base font-medium last:border-b-0"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="border-b py-4 text-base font-medium last:border-b-0"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <DrawerFooter>
            <a
              href={sitePaths.download}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants(), "w-full")}
              onClick={() => setMobileOpen(false)}
            >
              Download latest release
            </a>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
