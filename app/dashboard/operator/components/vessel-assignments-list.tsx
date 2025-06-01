"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Ship, Anchor, Users, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Vessel } from "@/app/actions/vessel-actions"

interface VesselAssignmentsListProps {
  vessels: Vessel[]
}

export function VesselAssignmentsList({ vessels }: VesselAssignmentsListProps) {
  const router = useRouter()

  if (vessels.length === 0) {
    return (
      <div className="text-center py-12">
        <Ship className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No vessels assigned</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't been assigned to operate any vessels yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {vessels.map((vessel) => (
        <Card key={vessel.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{vessel.name}</CardTitle>
              <Badge
                variant="outline"
                className={`
                ${
                  vessel.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : vessel.status === "maintenance"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                }
              `}
              >
                {vessel.status.charAt(0).toUpperCase() + vessel.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Ship className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Type: {vessel.vessel_type}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Anchor className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Length: {vessel.length}m</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Capacity: {vessel.passenger_capacity} passengers</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Location: {vessel.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Daily Rate: ${vessel.daily_rate.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/marketplace/${vessel.id}`}>View Details</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href={`/dashboard/operator/vessel/${vessel.id}`}>Manage Bookings</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
