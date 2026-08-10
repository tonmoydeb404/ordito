import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id?: string;
  title: string;
  description: string;
  className?: string;
};

/**
 * Shared section typography matched to the reference site's scale:
 * a flat text-3xl/font-medium heading (no responsive size jump) and a
 * text-base muted description capped at max-w-lg. Keep every homepage
 * section heading routed through this component so the type scale stays
 * consistent site-wide.
 */
export function SectionHeading({
  id,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-10 max-w-lg space-y-2 md:mb-12", className)}>
      <h2 id={id} className="text-3xl font-medium">
        {title}
      </h2>
      <p className="text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
