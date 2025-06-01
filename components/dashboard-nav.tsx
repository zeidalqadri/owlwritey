"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { LayoutDashboard, Ship, Calendar, Users, Settings, ShieldCheck, Anchor, CalendarRange } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { roleColorSchemes } from "@/lib/theme-config"

interface DashboardNavProps {
  userRole: string
}

export function DashboardNav({ userRole }: DashboardNavProps) {
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
    <div className={`${colorScheme.sidebar} p-4 rounded-lg`}>
      <div className={`${colorScheme.sidebarText} text-lg font-bold mb-6`}>
        {colorScheme === roleColorSchemes.Admin
          ? "Admin"
          : colorScheme === roleColorSchemes["Vessel Owner"]
            ? "Vessel Owner"
            : colorScheme === roleColorSchemes["Vessel Operator"]
              ? "Vessel Operator"
              : "Charterer"}{" "}
        Dashboard
      </div>
      <nav className="grid items-start gap-2">
        {routes.map((route, index) => (
          <Link
            key={index}
            href={route.href}
            className={cn(
              buttonVariants({ variant: route.active ? "default" : "ghost" }),
              route.active
                ? `${colorScheme.secondary} hover:${colorScheme.secondary}`
                : `${colorScheme.sidebarText} hover:bg-opacity-10 hover:bg-white`,
              "justify-start",
            )}
          >
            <route.icon className="mr-2 h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
