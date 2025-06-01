"use client"

import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Ship } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Booking } from "@/app/actions/booking-actions"
import { useTheme } from "@/components/theme-provider"
import { getStatusBadgeClasses } from "@/lib/theme-config"

interface RecentBookingsProps {
  bookings: Booking[]
  userRole: string
}

export function RecentBookings({ bookings, userRole }: RecentBookingsProps) {
  const router = useRouter()
  const { colorScheme } = useTheme()

  const handleViewDetails = (bookingId: string) => {
    router.push(`/dashboard/bookings/${bookingId}`)
  }

  const getStatusBadge = (status: string) => {
    const badgeClasses = getStatusBadgeClasses(status, userRole)

    switch (status) {
      case "PENDING_CONFIRMATION":
        return (
          <Badge variant="outline" className={badgeClasses}>
            Pending
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge variant="outline" className={badgeClasses}>
            Confirmed
          </Badge>
        )
      case "ACTIVE":
        return (
          <Badge variant="outline" className={badgeClasses}>
            Active
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="outline" className={badgeClasses}>
            Completed
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className={badgeClasses}>
            Rejected
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline" className={badgeClasses}>
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-6">
        <Calendar className={`mx-auto h-12 w-12 ${colorScheme.highlight}`} />
        <h3 className="mt-2 text-lg font-medium">No bookings found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {userRole === "Vessel Owner"
            ? "You don't have any booking requests for your vessels yet."
            : userRole === "Vessel Operator"
              ? "You don't have any assigned vessels with bookings yet."
              : "You haven't made any booking requests yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start space-x-4">
            <Ship className={`h-10 w-10 ${colorScheme.highlight}`} />
            <div>
              <div className="font-medium">Booking #{booking.id.substring(0, 8)}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(booking.start_date), "MMM d, yyyy")} -{" "}
                {format(new Date(booking.end_date), "MMM d, yyyy")}
              </div>
              <div className="mt-1">{getStatusBadge(booking.status)}</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking.id)}>
            View
          </Button>
        </div>
      ))}
    </div>
  )
}
