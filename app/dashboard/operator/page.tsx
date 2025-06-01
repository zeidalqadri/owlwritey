import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/session"
import { getUserRole } from "@/lib/hooks/use-user-role"
import { getBookingsForVesselOperator } from "@/app/actions/booking-actions"
import { getAssignedVessels } from "@/app/actions/vessel-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { BookingsList } from "@/app/dashboard/bookings/components/bookings-list"
import { VesselAssignmentsList } from "./components/vessel-assignments-list"
import { OperatorVesselTrackingGrid } from "./components/operator-vessel-tracking-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ship, Calendar, Navigation } from "lucide-react"

export const metadata = {
  title: "Operator Dashboard | Maritime Marketplace",
  description: "Manage your vessel operations and bookings",
}

export default async function OperatorDashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/operator")
  }

  const userId = session.user.id
  const userRole = await getUserRole(userId)

  // Redirect if not a Vessel Operator or Admin
  if (userRole !== "Vessel Operator" && userRole !== "Admin") {
    redirect("/dashboard")
  }

  // Get assigned vessels and their bookings
  const assignedVessels = await getAssignedVessels(userId)
  const bookings = await getBookingsForVesselOperator(userId)

  // Count active bookings
  const activeBookings = bookings.filter((booking) => booking.status === "ACTIVE").length
  const confirmedBookings = bookings.filter((booking) => booking.status === "CONFIRMED").length

  return (
    <div className="space-y-6">
      <DashboardHeader heading="Vessel Operator Dashboard" text="Manage your assigned vessels and bookings" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Vessels</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedVessels.length}</div>
            <p className="text-xs text-muted-foreground">Vessels you are responsible for operating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Charters</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently ongoing vessel operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Charters</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Confirmed bookings awaiting operation</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tracking">Vessel Tracking</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="vessels">Assigned Vessels</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Vessel Tracking</CardTitle>
              <CardDescription>Monitor the real-time position and status of your assigned vessels</CardDescription>
            </CardHeader>
            <CardContent>
              <OperatorVesselTrackingGrid vessels={assignedVessels} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Bookings</CardTitle>
              <CardDescription>View and manage bookings for vessels you are assigned to operate</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingsList bookings={bookings} userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vessels" className="space-y-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Assigned Vessels</CardTitle>
              <CardDescription>Vessels you are responsible for operating</CardDescription>
            </CardHeader>
            <CardContent>
              <VesselAssignmentsList vessels={assignedVessels} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
