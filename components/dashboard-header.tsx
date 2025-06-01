import type React from "react"
import { cva } from "class-variance-authority"
import { RoleIndicator } from "@/components/role-indicator"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg"
}

const headingVariants = cva("font-bold tracking-tight text-gray-900 dark:text-gray-100", {
  variants: {
    size: {
      default: "text-2xl sm:text-3xl",
      sm: "text-xl sm:text-2xl",
      lg: "text-3xl sm:text-4xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const textVariants = cva("text-gray-600 dark:text-gray-400", {
  variants: {
    size: {
      default: "text-sm sm:text-base",
      sm: "text-xs sm:text-sm",
      lg: "text-base sm:text-lg",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export function DashboardHeader({
  heading,
  text,
  children,
  className,
  size = "default",
  ...props
}: DashboardHeaderProps) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      <div className="space-y-1">
        <h1 className={cn("flex items-center", headingVariants({ size }))}>
          {heading}
          <RoleIndicator />
        </h1>
        {text && <p className={textVariants({ size })}>{text}</p>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
