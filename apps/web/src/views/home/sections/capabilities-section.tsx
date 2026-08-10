import {
  CalendarClock,
  History,
  Laptop,
  MousePointerClick,
} from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { capabilities } from "@/content/homepage";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card";

const capabilityIcons = {
  mouse: MousePointerClick,
  laptop: Laptop,
  calendar: CalendarClock,
  history: History,
} as const;

export function CapabilitiesSection() {
  return (
    <section aria-labelledby="capabilities-title" className="container py-24">
      <SectionHeading
        id="capabilities-title"
        title="Made for commands worth saving"
        description="Ordito keeps repeatable shell work close without trying to replace the terminal."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {capabilities.map((capability) => {
          const Icon = capabilityIcons[capability.icon];

          return (
            <Card key={capability.title} className="h-full">
              <CardHeader>
                <Icon
                  className="mb-2 size-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <CardTitle>{capability.title}</CardTitle>
                <CardDescription className="leading-6">
                  {capability.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
