import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/session"
import { getUserRole } from "@/lib/hooks/use-user-role"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getBookingsForUser,
  getBookingsForVesselOwner,
  getBookingsForVesselOperator,
} from "@/app/actions/booking-actions"
import { getVesselsByOwner, getAssignedVessels } from "@/app/actions/vessel-actions"
import { RecentBookings } from "@/app/dashboard/components/recent-bookings"
import { BookingStats } from "@/app/dashboard/components/booking-stats"
import { VesselStats } from "@/app/dashboard/components/vessel-stats"
import { FleetOverviewMap } from "@/components/fleet-overview-map"
import { Ship, Calendar, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getColorScheme } from "@/lib/theme-config"

export const metadata = {
  title: "Dashboard | marimar",
  description: "Manage your maritime marketplace account",
}

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login?callbackUrl=/dashboard")
  }

  const userId = session.user.id
  const userRole = await getUserRole(userId)
  const colorScheme = getColorScheme(userRole)

  // Get data based on user role
  let bookings = []
  let vessels = []
  let dashboardTitle = "Dashboard"
  let dashboardDescription = "Manage your maritime marketplace account"

  if (userRole === "Admin") {
    bookings = await getBookingsForUser(userId, true) // Get all bookings for admin
    vessels = await getVesselsByOwner(userId) // Get admin's vessels if any
    dashboardTitle = "Admin Dashboard"
    dashboardDescription = "Manage the marimar platform"
  } else if (userRole === "Vessel Owner") {
    bookings = await getBookingsForVesselOwner(userId)
    vessels = await getVesselsByOwner(userId)
    dashboardTitle = "Vessel Owner Dashboard"
    dashboardDescription = "Manage your vessels and bookings"
  } else if (userRole === "Vessel Operator") {
    bookings = await getBookingsForVesselOperator(userId)
    vessels = await getAssignedVessels(userId)
    dashboardTitle = "Vessel Operator Dashboard"
    dashboardDescription = "Manage your assigned vessels and bookings"
  } else {
    // Regular user (Charterer)
    bookings = await getBookingsForUser(userId)
    dashboardTitle = "Charterer Dashboard"
    dashboardDescription = "Manage your vessel bookings"
  }

  // Format vessels for the map
  const vesselPositions = vessels
    .filter((v) => v.latitude && v.longitude) // Only include vessels with position data
    .map((v) => ({
      id: v.id,
      vessel_name: v.name, // Adjust field name based on your actual data structure
      vessel_type: v.vessel_type,
      status: v.status,
      latitude: v.latitude,
      longitude: v.longitude,
      sog: v.sog,
      cog: v.cog,
      ais_timestamp: v.ais_timestamp,
    }))

  return (
    <>
      <DashboardHeader heading={dashboardTitle} text={dashboardDescription} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className={`h-4 w-4 ${colorScheme.highlight}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {userRole === "Vessel Owner"
                ? "Bookings for your vessels"
                : userRole === "Vessel Operator"
                  ? "Bookings for vessels you operate"
                  : "Your booking requests"}
            </p>
          </CardContent>
        </Card>

        {(userRole === "Vessel Owner" || userRole === "Admin" || userRole === "Vessel Operator") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userRole === "Vessel Operator" ? "Assigned Vessels" : "Your Vessels"}
              </CardTitle>
              <Ship className={`h-4 w-4 ${colorScheme.highlight}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vessels.length}</div>
              <p className="text-xs text-muted-foreground">
                {userRole === "Vessel Operator" ? "Vessels you are assigned to operate" : "Vessels you have listed"}
              </p>
            </CardContent>
          </Card>
        )}

        {userRole === "Admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className={`h-4 w-4 ${colorScheme.highlight}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Registered platform users</p>
            </CardContent>
          </Card>
        )}

        {/* Active Bookings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className={`h-4 w-4 ${colorScheme.highlight}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.filter((b) => b.status === "ACTIVE").length}</div>
            <p className="text-xs text-muted-foreground">Currently ongoing charters</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 mt-6">
        <TabsList className="w-full border-b pb-0 justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          {(userRole === "Vessel Owner" || userRole === "Admin" || userRole === "Vessel Operator") && (
            <TabsTrigger value="vessels">Vessels</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-2">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader className="pb-3">
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your most recent booking activity</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <RecentBookings bookings={bookings.slice(0, 5)} userRole={userRole} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader className="pb-3">
                <CardTitle>Booking Statistics</CardTitle>
                <CardDescription>Summary of your booking activity</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingStats bookings={bookings} />
              </CardContent>
            </Card>
          </div>

          {(userRole === "Vessel Owner" || userRole === "Admin" || userRole === "Vessel Operator") && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Vessel Statistics</CardTitle>
                <CardDescription>
                  {userRole === "Vessel Operator"
                    ? "Summary of vessels you operate"
                    : "Summary of your vessel listings"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VesselStats vessels={vessels} />
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <Button asChild className={colorScheme.primary}>
                <Link href="/marketplace">
                  Browse Vessels <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/bookings">
                  View All Bookings <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/calendar">
                  View Calendar <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              {userRole === "Vessel Owner" && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/vessels/add">
                    Add New Vessel <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}

              {userRole === "Vessel Operator" && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/operator">
                    Operator Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}

              {userRole === "Admin" && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/users">
                    Manage Users <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4 mt-2">
          {vesselPositions.length > 0 ? (
            <FleetOverviewMap
              initialVessels={vesselPositions}
              enableRealtime={true}
              mapHeight="calc(100vh - 220px)"
              userRole={userRole}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Ship className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">No vessel position data available</h3>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
                  There are no vessels with position data available for tracking. Position data will appear here once
                  vessels start reporting their AIS information.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4 mt-2">
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Your most recent booking activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <RecentBookings bookings={bookings} userRole={userRole} />
            </CardContent>
            <div className="px-6 py-4">
              <Button asChild className={colorScheme.primary}>
                <Link href="/dashboard/bookings">
                  View All Bookings <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </TabsContent>

        {(userRole === "Vessel Owner" || userRole === "Admin" || userRole === "Vessel Operator") && (
          <TabsContent value="vessels" className="space-y-4 mt-2">
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <CardTitle>{userRole === "Vessel Operator" ? "Assigned Vessels" : "Your Vessels"}</CardTitle>
                <CardDescription>
                  {userRole === "Vessel Operator"
                    ? "Vessels you are assigned to operate"
                    : "Vessels you have listed in the marketplace"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vessels.length === 0 ? (
                  <div className="text-center py-6">
                    <Ship className={`mx-auto h-12 w-12 ${colorScheme.highlight}`} />
                    <h3 className="mt-2 text-lg font-medium">No vessels found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {userRole === "Vessel Operator"
                        ? "You haven't been assigned to any vessels yet."
                        : "You haven't added any vessels to the marketplace yet."}
                    </p>
                    {userRole === "Vessel Owner" && (
                      <Button asChild className={`mt-4 ${colorScheme.primary}`}>
                        <Link href="/dashboard/vessels/add">Add Your First Vessel</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {vessels.slice(0, 6).map((vessel) => (
                      <Card key={vessel.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{vessel.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Type</p>
                              <p className="font-medium">{vessel.vessel_type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Location</p>
                              <p className="font-medium">{vessel.location}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="font-medium capitalize">{vessel.status}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Daily Rate</p>
                              <p className="font-medium">${vessel.daily_rate.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                        <div className="px-6 py-4 bg-gray-50">
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={
                                userRole === "Vessel Operator"
                                  ? `/dashboard/operator/vessel/${vessel.id}`
                                  : `/dashboard/vessels/${vessel.id}`
                              }
                            >
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              {vessels.length > 0 && (
                <div className="px-6 py-4 border-t">
                  <Button asChild className={colorScheme.primary}>
                    <Link href={userRole === "Vessel Operator" ? "/dashboard/operator" : "/dashboard/vessels"}>
                      View All Vessels <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}
