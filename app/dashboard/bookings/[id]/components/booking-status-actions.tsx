"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Play, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  approveBooking,
  rejectBooking,
  markBookingAsActive,
  markBookingAsCompleted,
} from "@/app/actions/booking-actions"
import type { Booking } from "@/app/actions/booking-actions"

interface BookingStatusActionsProps {
  booking: Booking
  userRole: string
  isVesselOwner: boolean
  isVesselOperator: boolean
}

export function BookingStatusActions({
  booking,
  userRole,
  isVesselOwner,
  isVesselOperator,
}: BookingStatusActionsProps) {
  const router = useRouter()
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isMarkActiveDialogOpen, setIsMarkActiveDialogOpen] = useState(false)
  const [isMarkCompletedDialogOpen, setIsMarkCompletedDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApproveConfirm = async () => {
    setIsSubmitting(true)
    try {
      const result = await approveBooking(booking.id)
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
    }
  }

  const handleRejectConfirm = async () => {
    setIsSubmitting(true)
    try {
      const result = await rejectBooking(booking.id)
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
    }
  }

  const handleMarkActiveConfirm = async () => {
    setIsSubmitting(true)
    try {
      const result = await markBookingAsActive(booking.id)
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
    }
  }

  const handleMarkCompletedConfirm = async () => {
    setIsSubmitting(true)
    try {
      const result = await markBookingAsCompleted(booking.id)
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
    }
  }

  // Check if user can approve/reject bookings (Admin or Vessel Owner of this vessel)
  const canManageBookings = userRole === "Admin" || isVesselOwner

  // Check if user can mark bookings as active/completed (Admin or Vessel Operator of this vessel)
  const canOperateVessels = userRole === "Admin" || isVesselOperator

  // Determine which actions to show based on booking status and user role
  const showApproveReject = canManageBookings && booking.status === "PENDING_CONFIRMATION"
  const showMarkActive = canOperateVessels && booking.status === "CONFIRMED"
  const showMarkCompleted = canOperateVessels && booking.status === "ACTIVE"

  // If no actions available, show a message
  if (!showApproveReject && !showMarkActive && !showMarkCompleted) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          {booking.status === "COMPLETED" || booking.status === "REJECTED" || booking.status === "CANCELLED"
            ? "This booking has been finalized and no further actions are available."
            : "You don't have permission to change the status of this booking."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {showApproveReject && (
          <>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setIsApproveDialogOpen(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Booking
            </Button>
            <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject Booking
            </Button>
          </>
        )}

        {showMarkActive && (
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsMarkActiveDialogOpen(true)}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Charter
          </Button>
        )}

        {showMarkCompleted && (
          <Button
            variant="default"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsMarkCompletedDialogOpen(true)}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Complete Charter
          </Button>
        )}
      </div>

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
            <Button onClick={handleApproveConfirm} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
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
            <Button onClick={handleMarkActiveConfirm} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
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
            <Button
              onClick={handleMarkCompletedConfirm}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Complete Charter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
