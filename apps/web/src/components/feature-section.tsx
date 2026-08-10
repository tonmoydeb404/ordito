import {
  AppScreenshot,
  type AppScreenshotView,
} from "@/components/app-screenshot";
import { cn } from "@/lib/utils";

type Tone = "rose" | "violet" | "blue";
type Span = "wide" | "narrow" | "full";

type FeatureSectionProps = {
  id: string;
  title: string;
  description: string;
  visualTitle: string;
  visualDescription: string;
  visualView: AppScreenshotView;
  tone: Tone;
  span: Span;
};

// Same noise texture used by the Aceternity Wobble Card demo, applied here
// as a static overlay (no pointer-tracking tilt).
const NOISE_URL = "https://assets.aceternity.com/noise.webp";

const toneClassName: Record<Tone, string> = {
  rose: "bg-gradient-to-br from-rose-500 via-pink-600 to-rose-900",
  violet: "bg-gradient-to-br from-violet-500 via-indigo-600 to-slate-900",
  blue: "bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-800",
};

const spanClassName: Record<Span, string> = {
  wide: "lg:col-span-2 min-h-[420px] lg:min-h-[340px]",
  narrow: "min-h-[300px] lg:min-h-[340px]",
  full: "lg:col-span-3 min-h-[460px] lg:min-h-[360px]",
};

/**
 * Bento-grid feature card: a gradient, noise-textured panel with a
 * title/description caption and a product screenshot inset near the edge,
 * clipped by the card's rounded corners. Layout and colors are modeled on
 * the Aceternity Wobble Card demo, without its pointer-tracking tilt effect.
 */
export function FeatureSection({
  id,
  title,
  description,
  visualDescription,
  visualView,
  tone,
  span,
}: FeatureSectionProps) {
  const hasVisual = span !== "narrow";

  return (
    <div
      id={id}
      className={cn(
        "relative flex scroll-mt-8 flex-col overflow-hidden rounded-2xl p-6 text-white sm:p-8",
        toneClassName[tone],
        spanClassName[span],
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: `url(${NOISE_URL})`,
          backgroundSize: "180px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-xs">
        <h3 className="text-left text-balance text-xl leading-tight font-bold tracking-tight md:text-2xl lg:text-3xl">
          {title}
        </h3>
        <p className="mt-4 text-left text-sm leading-6 text-white/80">
          {description}
        </p>
      </div>

      {hasVisual && (
        <div
          className={cn(
            "pointer-events-none absolute right-6 bottom-6 hidden w-64 sm:block lg:w-72",
            span === "full" && "lg:w-88",
          )}
        >
          <AppScreenshot view={visualView} className="shadow-2xl" />
        </div>
      )}

      <span className="sr-only">{visualDescription}</span>
    </div>
  );
}
