import { sitePaths } from "@/config/paths-config";
import { SITE_URL, faqItems } from "@/content/homepage";
import { HomeView } from "@/views/home";

export default function Home() {
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Ordito",
    description:
      "Save, run, schedule, and review repeatable shell commands from a focused desktop app for macOS and Windows.",
    url: SITE_URL,
    downloadUrl: sitePaths.download,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    license: "https://opensource.org/licenses/MIT",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeView />
    </>
  );
}
