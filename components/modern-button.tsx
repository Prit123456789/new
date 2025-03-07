"use client"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/theme-context"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
  {
    variants: {
      variant: {
        default: "",
        outline: "border",
        ghost: "hover:bg-opacity-10",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  fullWidth?: boolean
}

const ModernButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    const { colors } = useTheme()

    // Apply theme colors based on variant
    const themeClasses =
      variant === "outline"
        ? `${colors.buttonOutlineBorder} ${colors.buttonOutlineBg} ${colors.buttonOutlineText} ${colors.buttonOutlineHover}`
        : variant === "ghost"
          ? `${colors.buttonOutlineText} hover:${colors.buttonOutlineBg}`
          : `${colors.buttonBg} ${colors.buttonText} ${colors.buttonHover}`

    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth ? "w-full" : "",
          themeClasses,
          "shadow-md hover:shadow-lg transition-all duration-200",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

ModernButton.displayName = "ModernButton"

export { ModernButton }

