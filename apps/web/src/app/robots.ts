import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/homepage";

// Search-and-cite crawlers for AI engines. Listed explicitly to document
// intent: Ordito allows these bots so its content can be cited in AI answers.
// The wildcard rule below already permits them; this avoids accidental
// future blocks. Training-only crawlers (e.g. CCBot) are also allowed.
const aiCitationBots = [
  "GPTBot", // OpenAI / ChatGPT
  "ChatGPT-User",
  "PerplexityBot", // Perplexity
  "ClaudeBot", // Anthropic / Claude
  "anthropic-ai",
  "Google-Extended", // Google Gemini & AI Overviews
  "Bingbot", // Microsoft Copilot
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...aiCitationBots.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
