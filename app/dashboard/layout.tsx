import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getUserRole } from "@/lib/hooks/use-user-role"
import { getServerSession } from "@/lib/session"

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get user role for the dashboard layout
  const session = await getServerSession()
  const userRole = session ? await getUserRole(session.user.id) : "Charterer"

  return <DashboardLayout userRole={userRole}>{children}</DashboardLayout>
}
