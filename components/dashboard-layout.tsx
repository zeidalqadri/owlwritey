import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: string
}

export function DashboardLayout({ children, userRole = "Charterer" }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 hidden w-64 md:block">
        <DashboardSidebar userRole={userRole} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-h-screen md:ml-64">
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>

        {/* Single footer for dashboard */}
        <footer className="border-t bg-background">
          <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
            <div className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} marimar. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="/terms" className="hover:underline">
                Terms
              </a>
              <a href="/privacy" className="hover:underline">
                Privacy
              </a>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
