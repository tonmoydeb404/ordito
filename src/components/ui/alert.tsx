import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
      direction: {
        left: "has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 text-left [&>svg]:translate-y-0.5",
        center:
          "has-[>svg]:grid-cols-1 grid-cols-1 justify-items-center text-center [&>svg]:justify-self-center [&>svg]:mb-2",
        right:
          "has-[>svg]:grid-cols-[1fr_calc(var(--spacing)*4)] grid-cols-[1fr_0] has-[>svg]:gap-x-3 text-right [&>svg]:translate-y-0.5 [&>svg]:col-start-2 [&>svg]:row-start-1",
      },
    },
    defaultVariants: {
      variant: "default",
      direction: "left",
    },
  }
);

function Alert({
  className,
  variant,
  direction,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        alertVariants({ variant, direction }),
        `direction-${direction || "left"}`,
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "line-clamp-1 min-h-4 font-medium tracking-tight in-[.direction-left]:col-start-2 in-[.direction-center]:col-start-1 in-[.direction-right]:col-start-1",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground grid gap-1 text-sm [&_p]:leading-relaxed in-[.direction-left]:col-start-2 in-[.direction-left]:justify-items-start in-[.direction-center]:col-start-1 in-[.direction-center]:justify-items-center in-[.direction-right]:col-start-1 in-[.direction-right]:justify-items-end",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
