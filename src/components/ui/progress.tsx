import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-lg",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full flex-1 transition-all duration-700 ease-in-out rounded-full shadow-[0_0_12px_2px_rgba(255,140,0,0.3)]",
        value === 100
          ? "bg-gradient-to-r from-orange-400 via-fuchsia-500 to-purple-600 animate-pulse"
          : "bg-gradient-to-r from-orange-400 via-yellow-400 to-pink-500"
      )}
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
