"use client"

import { useTheme } from "@/components/theme-provider"
import { Badge } from "@/components/ui/badge"

export function RoleIndicator() {
  const { userRole, colorScheme } = useTheme()

  if (!userRole) return null

  return (
    <Badge variant="outline" className={`${colorScheme.accent} ml-2`}>
      {userRole}
    </Badge>
  )
}
