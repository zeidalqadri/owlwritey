"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Ship, Calendar, User, MapPin, CheckCircle, XCircle, Play, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
  approveBooking,
  rejectBooking,
  markBookingAsActive,
  markBookingAsCompleted,
  cancelBooking,
} from "@/app/actions/booking-actions"
import type { Booking } from "@/app/actions/booking-actions"
import { useTheme } from "@/components/theme-provider"
import { getStatusBadgeClasses } from "@/lib/theme-config"

interface BookingsListProps {
  bookings: Booking[]
  userRole: string
}

export function BookingsList({ bookings, userRole }: BookingsListProps) {
  const router = useRouter()
  const { colorScheme } = useTheme()
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isMarkActiveDialogOpen, setIsMarkActiveDialogOpen] = useState(false)
  const [isMarkCompletedDialogOpen, setIsMarkCompletedDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleViewDetails = (bookingId: string) => {
    router.push(`/dashboard/bookings/${bookingId}`)
  }

  const openActionDialog = (bookingId: string, dialogType: string) => {
    setSelectedBookingId(bookingId)

    switch (dialogType) {
      case "approve":
        setIsApproveDialogOpen(true)
        break
      case "reject":
        setIsRejectDialogOpen(true)
        break
      case "active":
        setIsMarkActiveDialogOpen(true)
        break
      case "completed":
        setIsMarkCompletedDialogOpen(true)
        break
      case "cancel":
        setIsCancelDialogOpen(true)
        break
    }
  }

  const handleApproveConfirm = async () => {
    if (!selectedBookingId) return

    setIsSubmitting(true)
    try {
      const result = await approveBooking(selectedBookingId)
      if (result.success) {
        toast({
          title: "Booking approved",
          description: "The booking has been successfully approved.",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve booking.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsApproveDialogOpen(false)
      setSelectedBookingId(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!selectedBookingId) return

    setIsSubmitting(true)
    try {
      const result = await rejectBooking(selectedBookingId)
      if (result.success) {
        toast({
          title: "Booking rejected",
          description: "The booking has been rejected.",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject booking.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsRejectDialogOpen(false)
      setSelectedBookingId(null)
    }
  }

  const handleMarkActiveConfirm = async () => {
    if (!selectedBookingId) return

    setIsSubmitting(true)
    try {
      const result = await markBookingAsActive(selectedBookingId)
      if (result.success) {
        toast({
          title: "Charter started",
          description: "The booking has been marked as active.",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to mark booking as active.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsMarkActiveDialogOpen(false)
      setSelectedBookingId(null)
    }
  }

  const handleMarkCompletedConfirm = async () => {
    if (!selectedBookingId) return

    setIsSubmitting(true)
    try {
      const result = await markBookingAsCompleted(selectedBookingId)
      if (result.success) {
        toast({
          title: "Charter completed",
          description: "The booking has been marked as completed.",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to mark booking as completed.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsMarkCompletedDialogOpen(false)
      setSelectedBookingId(null)
    }
  }

  const handleCancelConfirm = async () => {
    if (!selectedBookingId) return

    setIsSubmitting(true)
    try {
      const result = await cancelBooking(selectedBookingId)
      if (result.success) {
        toast({
          title: "Booking cancelled",
          description: "The booking has been cancelled.",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel booking.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsCancelDialogOpen(false)
      setSelectedBookingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const badgeClasses = getStatusBadgeClasses(status, userRole)

    return (
      <Badge variant="outline" className={badgeClasses}>
        {getStatusLabel(status)}
      </Badge>
    )
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
        return "Pending"
      case "CONFIRMED":
        return "Confirmed"
      case "ACTIVE":
        return "Active"
      case "COMPLETED":
        return "Completed"
      case "REJECTED":
        return "Rejected"
      case "CANCELLED":
        return "Cancelled"
      default:
        return status
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

  // Determine which actions to show based on user role
  const canApproveReject = userRole === "Admin" || userRole === "Vessel Owner"
  const canOperateVessels = userRole === "Admin" || userRole === "Vessel Operator"
  const canCancel = true // All users can cancel their own bookings, but we'll check ownership in the server action

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Booking #{booking.id.substring(0, 8)}</CardTitle>
                <CardDescription>
                  {format(new Date(booking.start_date), "MMM d, yyyy")} -{" "}
                  {format(new Date(booking.end_date), "MMM d, yyyy")}
                </CardDescription>
              </div>
              {getStatusBadge(booking.status)}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Ship className={`mr-2 h-4 w-4 ${colorScheme.highlight}`} />
                  <span>Vessel: {booking.vessel?.name || "Unknown Vessel"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className={`mr-2 h-4 w-4 ${colorScheme.highlight}`} />
                  <span>Location: {booking.vessel?.location || "Unknown Location"}</span>
                </div>
              </div>
              <div className="space-y-2">
                {userRole !== "Charterer" && (
                  <div className="flex items-center text-sm">
                    <User className={`mr-2 h-4 w-4 ${colorScheme.highlight}`} />
                    <span>Charterer: {booking.charterer?.full_name || "Unknown User"}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Calendar className={`mr-2 h-4 w-4 ${colorScheme.highlight}`} />
                  <span>Personnel: {booking.personnel_onboard}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking.id)}>
              View Details
            </Button>

            {/* Show action dropdown if there are actions available */}
            {((canApproveReject && booking.status === "PENDING_CONFIRMATION") ||
              (canOperateVessels && booking.status === "CONFIRMED") ||
              (canOperateVessels && booking.status === "ACTIVE") ||
              (canCancel && (booking.status === "PENDING_CONFIRMATION" || booking.status === "CONFIRMED"))) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className={colorScheme.primary}>
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Booking Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Approve/Reject actions for Vessel Owners and Admins */}
                  {canApproveReject && booking.status === "PENDING_CONFIRMATION" && (
                    <>
                      <DropdownMenuItem onClick={() => openActionDialog(booking.id, "approve")}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Approve Booking
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openActionDialog(booking.id, "reject")}>
                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                        Reject Booking
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Start/Complete Charter actions for Vessel Operators and Admins */}
                  {canOperateVessels && booking.status === "CONFIRMED" && (
                    <DropdownMenuItem onClick={() => openActionDialog(booking.id, "active")}>
                      <Play className="mr-2 h-4 w-4 text-blue-600" />
                      Start Charter
                    </DropdownMenuItem>
                  )}

                  {canOperateVessels && booking.status === "ACTIVE" && (
                    <DropdownMenuItem onClick={() => openActionDialog(booking.id, "completed")}>
                      <CheckSquare className="mr-2 h-4 w-4 text-purple-600" />
                      Complete Charter
                    </DropdownMenuItem>
                  )}

                  {/* Cancel action for all users (for their own bookings) */}
                  {canCancel && (booking.status === "PENDING_CONFIRMATION" || booking.status === "CONFIRMED") && (
                    <>
                      {(canOperateVessels || canApproveReject) && <DropdownMenuSeparator />}
                      <DropdownMenuItem onClick={() => openActionDialog(booking.id, "cancel")}>
                        <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                        Cancel Booking
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardFooter>
        </Card>
      ))}

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this booking? This will confirm the vessel reservation for the requested
              dates.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleApproveConfirm} className={colorScheme.primary} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Approve Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Reject Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Active Confirmation Dialog */}
      <Dialog open={isMarkActiveDialogOpen} onOpenChange={setIsMarkActiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Charter</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this booking as active? This indicates that the charter has physically
              started.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkActiveDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleMarkActiveConfirm} className={colorScheme.primary} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Start Charter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Completed Confirmation Dialog */}
      <Dialog open={isMarkCompletedDialogOpen} onOpenChange={setIsMarkCompletedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Charter</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this booking as completed? This indicates that the charter has physically
              ended.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkCompletedDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleMarkCompletedConfirm} className={colorScheme.primary} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Complete Charter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isSubmitting}>
              Back
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
