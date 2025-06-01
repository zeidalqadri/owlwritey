"use client"

import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Ship, Users, Calendar, FileText, DollarSign, Clock } from "lucide-react"
import type { Booking } from "@/app/actions/booking-actions"
import type { Vessel } from "@/app/actions/vessel-actions"

interface BookingEventDetailsProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  vessel: Vessel | null
  onViewDetails: () => void
}

export function BookingEventDetails({ isOpen, onClose, booking, vessel, onViewDetails }: BookingEventDetailsProps) {
  if (!booking || !vessel) return null

  // Get status label and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
        return { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      case "CONFIRMED":
        return { label: "Confirmed", color: "bg-green-100 text-green-800 border-green-200" }
      case "ACTIVE":
        return { label: "Active", color: "bg-blue-100 text-blue-800 border-blue-200" }
      case "COMPLETED":
        return { label: "Completed", color: "bg-purple-100 text-purple-800 border-purple-200" }
      case "REJECTED":
        return { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" }
      case "CANCELLED":
        return { label: "Cancelled", color: "bg-gray-100 text-gray-800 border-gray-200" }
      default:
        return { label: status, color: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  const statusInfo = getStatusInfo(booking.status)
  const vesselName = vessel.name || (vessel as any).vessel_name || "Unknown Vessel"
  const chartererName = booking.charterer?.full_name || "Unknown Charterer"
  const operatorName = booking.operator?.full_name || "Not Assigned"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Booking Details</span>
            <Badge variant="outline" className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>Booking #{booking.id.substring(0, 8)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3">
            <Ship className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{vesselName}</p>
              <p className="text-sm text-muted-foreground">{vessel.vessel_type}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Booking Period</p>
              <p className="text-sm">
                {format(new Date(booking.start_date), "MMM d, yyyy")} -{" "}
                {format(new Date(booking.end_date), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Personnel</p>
              <p className="text-sm">Charterer: {chartererName}</p>
              <p className="text-sm">Operator: {operatorName}</p>
              <p className="text-sm">Personnel Onboard: {booking.personnel_onboard}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Project Details</p>
              <p className="text-sm">Reference: {booking.project_ref}</p>
              <p className="text-sm">Scope: {booking.scope_of_work}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Financial</p>
              <p className="text-sm">Base Charter: ${booking.base_charter_cost.toLocaleString()}</p>
              <p className="text-sm">Estimated Total: ${booking.estimated_total_cost.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Timestamps</p>
              <p className="text-sm">Created: {format(new Date(booking.created_at), "MMM d, yyyy")}</p>
              {booking.updated_at && (
                <p className="text-sm">Last Updated: {format(new Date(booking.updated_at), "MMM d, yyyy")}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={onViewDetails}>View Full Details</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
