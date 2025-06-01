"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Ship, Calendar, Users, Settings, ShieldCheck, Anchor, CalendarRange } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { RoleIndicator } from "@/components/role-indicator"
import { Separator } from "@/components/ui/separator"

interface DashboardSidebarProps {
  userRole: string
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { colorScheme } = useTheme()

  const isAdmin = userRole === "Admin"
  const isVesselOwner = userRole === "Vessel Owner"
  const isVesselOperator = userRole === "Vessel Operator"

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/bookings",
      label: "Bookings",
      icon: Calendar,
      active: pathname === "/dashboard/bookings" || pathname.startsWith("/dashboard/bookings/"),
    },
    {
      href: "/dashboard/calendar",
      label: "Calendar",
      icon: CalendarRange,
      active: pathname === "/dashboard/calendar",
    },
    // Show vessels link for Admins and Vessel Owners
    ...(isAdmin || isVesselOwner
      ? [
          {
            href: "/dashboard/vessels",
            label: "My Vessels",
            icon: Ship,
            active: pathname === "/dashboard/vessels" || pathname.startsWith("/dashboard/vessels/"),
          },
        ]
      : []),
    // Show operator dashboard for Vessel Operators
    ...(isVesselOperator
      ? [
          {
            href: "/dashboard/operator",
            label: "Operator Dashboard",
            icon: Anchor,
            active: pathname === "/dashboard/operator" || pathname.startsWith("/dashboard/operator/"),
          },
        ]
      : []),
    // Show admin links for Admins
    ...(isAdmin
      ? [
          {
            href: "/admin/users",
            label: "User Management",
            icon: Users,
            active: pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
          },
          {
            href: "/admin/roles",
            label: "Role Management",
            icon: ShieldCheck,
            active: pathname === "/admin/roles" || pathname.startsWith("/admin/roles/"),
          },
        ]
      : []),
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/marimar-logo.png" alt="marimar logo" width={40} height={40} className="invert" />
          <span className="text-xl font-semibold text-white">marimar</span>
        </Link>
        <div className="mt-2 flex items-center">
          <RoleIndicator />
        </div>
      </div>
      <Separator className="bg-gray-700 opacity-20" />
      <div className="flex-1 overflow-auto py-6 px-4">
        <nav className="grid items-start gap-2">
          {routes.map((route, index) => (
            <Link
              key={index}
              href={route.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                route.active ? "bg-primary/20 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-6">
        <Link
          href="/"
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700",
          )}
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
