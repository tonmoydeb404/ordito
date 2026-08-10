import { SectionHeading } from "@/components/section-heading";
import { workflow } from "@/content/homepage";
import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent } from "@packages/ui/components/card";

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="scroll-mt-8 container py-24"
      aria-labelledby="workflow-title"
    >
      <SectionHeading
        id="workflow-title"
        title="Save it once. Stop recalling it."
        description="A short loop for the command-line work that repeats throughout the week."
      />
      <Card>
        <CardContent className="grid gap-8 py-2 md:grid-cols-3 md:gap-0">
          {workflow.map((step, index) => (
            <div
              key={step.title}
              className="flex gap-4 md:px-5 first:md:pl-0 last:md:pr-0"
            >
              <Badge variant="secondary">{index + 1}</Badge>
              <div className="space-y-2">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <kbd className="rounded-md border bg-muted px-2 py-1 text-xs text-foreground">
            ⌘/Ctrl K
          </kbd>
          Focus search
        </span>
        <span className="flex items-center gap-2">
          <kbd className="rounded-md border bg-muted px-2 py-1 text-xs text-foreground">
            ↑ ↓
          </kbd>
          Select a command
        </span>
        <span className="flex items-center gap-2">
          <kbd className="rounded-md border bg-muted px-2 py-1 text-xs text-foreground">
            Enter
          </kbd>
          Run selection
        </span>
      </div>
    </section>
  );
}
