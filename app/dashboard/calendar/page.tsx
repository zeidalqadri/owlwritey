import { getUserRole } from "@/lib/hooks/use-user-role"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { BookingCalendar } from "./components/booking-calendar"
import { mockVessels } from "@/lib/mock-data"

export const metadata = {
  title: "Booking Calendar | Maritime Marketplace",
  description: "View vessel availability and bookings in a calendar format",
}

export default async function CalendarPage() {
  // In a real app, you would get the user ID from the session
  // For now, we'll use a mock user ID
  const userId = "mock-user-id"
  const userRole = await getUserRole(userId)

  // In a real app, you would fetch vessels from the database
  // For now, we'll use mock data
  const vessels = mockVessels

  return (
    <DashboardShell>
      <DashboardHeader heading="Booking Calendar" text="View vessel availability and bookings in a calendar format" />
      <div className="mb-8">
        <BookingCalendar userId={userId} userRole={userRole} vessels={vessels} />
      </div>
    </DashboardShell>
  )
}
