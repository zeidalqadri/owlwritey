import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/session"
import { getUserRole } from "@/lib/hooks/use-user-role"
import {
  getBookingsForUser,
  getBookingsForVesselOwner,
  getBookingsForVesselOperator,
} from "@/app/actions/booking-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { BookingsList } from "./components/bookings-list"

export const metadata = {
  title: "Bookings | Maritime Marketplace",
  description: "Manage your bookings",
}

export default async function BookingsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/bookings")
  }

  const userId = session.user.id
  const userRole = await getUserRole(userId)

  // Get bookings based on user role
  let bookings = []
  let pageTitle = "Your Bookings"
  let pageDescription = "View and manage your booking requests"

  if (userRole === "Admin") {
    bookings = await getBookingsForUser(userId, true) // Get all bookings for admin
    pageTitle = "All Bookings"
    pageDescription = "View and manage all bookings in the system"
  } else if (userRole === "Vessel Owner") {
    bookings = await getBookingsForVesselOwner(userId)
    pageTitle = "Vessel Bookings"
    pageDescription = "View and manage bookings for your vessels"
  } else if (userRole === "Vessel Operator") {
    bookings = await getBookingsForVesselOperator(userId)
    pageTitle = "Assigned Vessel Bookings"
    pageDescription = "View and manage bookings for vessels you are assigned to operate"
  } else {
    // Regular user (Charterer)
    bookings = await getBookingsForUser(userId)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={pageTitle} text={pageDescription} />
      <div className="mb-8">
        <BookingsList bookings={bookings} userRole={userRole} />
      </div>
    </DashboardShell>
  )
}
