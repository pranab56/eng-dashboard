import * as React from "react"

import { cn } from "@/lib/utils"

const variantClasses: Record<string, string> = {
  borderblack: "border border-gray-400 focus-visible:ring-gray-200",
}

type InputProps = React.ComponentProps<"input"> & {
  variant?: keyof typeof variantClasses
}

function Input({ className, type, variant, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-12 w-full min-w-0 rounded-md border  bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        variant ? variantClasses[variant] : "",
        className
      )}
      {...props}
    />
  )
}

export { Input }