import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
      default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md transition-shadow",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md transition-shadow",
      outline: "border border-border/30 bg-card text-foreground shadow-sm hover:bg-accent hover:shadow-md transition-shadow",
      secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md transition-shadow"
    }

    const sizes = {
      default: "px-4 py-3 text-base",
      sm: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-lg"
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
