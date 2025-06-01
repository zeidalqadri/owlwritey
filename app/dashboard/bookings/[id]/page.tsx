import { notFound, redirect } from "next/navigation"
import { getServerSession } from "@/lib/session"
import { getUserRole } from "@/lib/hooks/use-user-role"
import { getBookingById } from "@/app/actions/booking-actions"
import { getVesselById } from "@/app/actions/vessel-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { BookingStatusActions } from "./components/booking-status-actions"
import { AISMapWidget } from "@/components/ais-map-widget"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { CalendarDays, Ship, Anchor, Navigation, MapPin } from "lucide-react"

export const metadata = {
  title: "Booking Details | Maritime Marketplace",
  description: "View and manage booking details",
}

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession()

  if (!session) {
    redirect(`/login?callbackUrl=/dashboard/bookings/${params.id}`)
  }

  const userId = session.user.id
  const userRole = await getUserRole(userId)
  const booking = await getBookingById(params.id)

  if (!booking) {
    notFound()
  }

  // Get vessel details
  const vessel = await getVesselById(booking.vessel_id)

  if (!vessel) {
    notFound()
  }

  // Check if booking is active or confirmed
  const isActiveOrConfirmed = booking.status === "ACTIVE" || booking.status === "CONFIRMED"

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Booking #${booking.id.substring(0, 8)}`}
        text={`${vessel.vessel_name} - ${format(new Date(booking.start_date), "PPP")} to ${format(
          new Date(booking.end_date),
          "PPP",
        )}`}
      />

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Information about this charter booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" /> Start Date
                </h3>
                <p className="text-sm">{format(new Date(booking.start_date), "PPP")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" /> End Date
                </h3>
                <p className="text-sm">{format(new Date(booking.end_date), "PPP")}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Ship className="h-4 w-4" /> Vessel
              </h3>
              <p className="text-sm">{vessel.vessel_name}</p>
              <p className="text-xs text-muted-foreground">{vessel.vessel_type}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Operation Region
              </h3>
              <p className="text-sm">{booking.region || vessel.current_region || vessel.location}</p>
            </div>

            {booking.notes && (
              <div>
                <h3 className="text-sm font-medium">Notes</h3>
                <p className="text-sm whitespace-pre-line">{booking.notes}</p>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="text-sm font-medium">Status</h3>
              <div className="mt-2">
                <BookingStatusActions booking={booking} userRole={userRole} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isActiveOrConfirmed && vessel.latitude && vessel.longitude && (
            <Card>
              <CardHeader>
                <CardTitle>Live Vessel Tracking</CardTitle>
                <CardDescription>Current position and navigation data</CardDescription>
              </CardHeader>
              <CardContent>
                <AISMapWidget
                  vesselId={vessel.id}
                  vesselName={vessel.vessel_name}
                  initialLatitude={vessel.latitude}
                  initialLongitude={vessel.longitude}
                  initialTimestamp={vessel.ais_timestamp}
                  enableRealtime={true}
                  mapHeight="300px"
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Vessel Information</CardTitle>
              <CardDescription>Details about the chartered vessel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <Anchor className="h-4 w-4" /> IMO Number
                  </h3>
                  <p className="text-sm">{vessel.imo_number || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <Navigation className="h-4 w-4" /> DP Rating
                  </h3>
                  <p className="text-sm">{vessel.dynamic_positioning || "None"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Specifications</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>Length: {vessel.length || "N/A"}m</div>
                  <div>Beam: {vessel.beam || "N/A"}m</div>
                  <div>Draft: {vessel.draft || "N/A"}m</div>
                  <div>Deck Area: {vessel.deck_area || "N/A"}m²</div>
                  <div>Bollard Pull: {vessel.bollard_pull || "N/A"}T</div>
                  <div>Passenger Capacity: {vessel.passenger_capacity || "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
