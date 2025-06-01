import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/session"
import { getUserRole } from "@/lib/hooks/use-user-role"
import { getVesselById } from "@/app/actions/vessel-actions"
import { getVesselBookings } from "@/app/actions/booking-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { BookingsList } from "@/app/dashboard/bookings/components/bookings-list"
import { VesselDetails } from "@/app/marketplace/[id]/components/vessel-details"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

interface VesselOperatorPageProps {
  params: {
    id: string
  }
}

export default async function VesselOperatorPage({ params }: VesselOperatorPageProps) {
  const vesselId = params.id

  const session = await getServerSession()

  if (!session) {
    redirect(`/login?callbackUrl=/dashboard/operator/vessel/${vesselId}`)
  }

  const userId = session.user.id
  const userRole = await getUserRole(userId)

  // Redirect if not a Vessel Operator or Admin
  if (userRole !== "Vessel Operator" && userRole !== "Admin") {
    redirect("/dashboard")
  }

  // Get vessel details
  const vessel = await getVesselById(vesselId)

  if (!vessel) {
    redirect("/dashboard/operator?error=vessel-not-found")
  }

  // Verify the operator is assigned to this vessel
  if (userRole === "Vessel Operator") {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase
      .from("vessel_operators")
      .select("id")
      .eq("vessel_id", vesselId)
      .eq("operator_id", userId)
      .single()

    if (error || !data) {
      redirect("/dashboard/operator?error=not-authorized")
    }
  }

  // Get vessel bookings
  const bookings = await getVesselBookings(vesselId)

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading={`Manage Vessel: ${vessel.name}`}
        text="View details and manage bookings for this vessel"
      />

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="details">Vessel Details</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Bookings</CardTitle>
              <CardDescription>View and manage bookings for this vessel</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingsList bookings={bookings} userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Vessel Details</CardTitle>
              <CardDescription>Specifications and information about this vessel</CardDescription>
            </CardHeader>
            <CardContent>
              <VesselDetails vessel={vessel} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
