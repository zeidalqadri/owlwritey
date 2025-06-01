"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"

// This component is only for development purposes
export function RoleSwitcher() {
  const { userRole, colorScheme } = useTheme()
  const router = useRouter()
  const [isChangingRole, setIsChangingRole] = useState(false)

  // Only show in development mode
  if (process.env.NODE_ENV === "production") return null

  const handleRoleChange = (newRole: string) => {
    setIsChangingRole(true)

    // In a real implementation, we would update the user's role in the database
    // For now, we'll just simulate it by setting a cookie and refreshing the page
    document.cookie = `DEV_USER_ROLE=${newRole}; path=/; max-age=86400`

    // Force a full page reload to ensure all components pick up the new role
    window.location.reload()

    setTimeout(() => {
      setIsChangingRole(false)
    }, 1000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50" disabled={isChangingRole}>
          {isChangingRole ? "Changing..." : `Role: ${userRole}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch Role (Dev Only)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleRoleChange("Admin")}>Admin</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("Vessel Owner")}>Vessel Owner</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("Vessel Operator")}>Vessel Operator</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("Charterer")}>Charterer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
