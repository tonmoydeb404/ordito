import { SiteFooter, SiteHeader } from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import { sitePaths } from "@/config/paths-config";
import { SITE_URL } from "@/content/homepage";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ordito — Your commands, one tray click away",
  description:
    "Save, run, schedule, and review repeatable shell commands from a focused desktop app for macOS and Windows. Free and open source.",
  alternates: {
    canonical: sitePaths.home,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Ordito",
    title: "Ordito — Your commands, one tray click away",
    description:
      "Save, run, schedule, and review repeatable shell commands from a focused desktop app for macOS and Windows.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ordito — Your commands, one tray click away",
    description:
      "Save, run, schedule, and review repeatable shell commands from a focused desktop app for macOS and Windows.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        fontSans.variable,
        fontMono.variable,
        "min-h-screen antialiased font-sans",
      )}
    >
      {process.env.NODE_ENV === "development" && (
        <head>
          <script
            async
            crossOrigin="anonymous"
            src="https://tweakcn.com/live-preview.min.js"
          />
        </head>
      )}
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
