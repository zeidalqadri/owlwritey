"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Views, momentLocalizer } from "react-big-calendar"
import { format, parseISO } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import {
  getAllBookings,
  getBookingsForUser,
  getBookingsForVesselOwner,
  getBookingsForVesselOperator,
} from "../actions/calendar-actions"
import type { Vessel } from "@/app/actions/vessel-actions"
import type { Booking } from "@/app/actions/booking-actions"

// Import the CSS for react-big-calendar
import "react-big-calendar/lib/css/react-big-calendar.css"

// We need to import moment for the localizer
import moment from "moment"

// Create a localizer using moment
const localizer = momentLocalizer(moment)

interface BookingCalendarProps {
  userId: string
  userRole: string
  vessels: Vessel[]
}

// Define the event interface for the calendar
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    booking: Booking
    vessel: Vessel
  }
  status: string
}

export function BookingCalendar({ userId, userRole, vessels }: BookingCalendarProps) {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("month")
  const [date, setDate] = useState(new Date())
  const [selectedVesselId, setSelectedVesselId] = useState<string>("all")
  const [statusFilters, setStatusFilters] = useState({
    PENDING_CONFIRMATION: true,
    CONFIRMED: true,
    ACTIVE: true,
    COMPLETED: true,
    REJECTED: false,
    CANCELLED: false,
  })

  // Fetch bookings based on user role
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      try {
        let fetchedBookings: Booking[] = []

        if (userRole === "Admin") {
          fetchedBookings = await getAllBookings()
        } else if (userRole === "Vessel Owner") {
          fetchedBookings = await getBookingsForVesselOwner(userId)
        } else if (userRole === "Vessel Operator") {
          fetchedBookings = await getBookingsForVesselOperator(userId)
        } else {
          // Regular charterer
          fetchedBookings = await getBookingsForUser(userId)
        }

        setBookings(fetchedBookings)
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [userId, userRole])

  // Convert bookings to calendar events
  const events = useMemo(() => {
    return bookings
      .filter((booking) => {
        // Filter by vessel if a specific vessel is selected
        if (selectedVesselId !== "all" && booking.vessel_id !== selectedVesselId) {
          return false
        }

        // Filter by status
        return statusFilters[booking.status as keyof typeof statusFilters]
      })
      .map((booking) => {
        // Find the vessel from our vessels list or use the vessel from the booking
        const vessel =
          vessels.find((v) => v.id === booking.vessel_id) ||
          (booking.vessel as unknown as Vessel) ||
          ({
            id: booking.vessel_id,
            name: "Unknown Vessel",
            vessel_type: "Unknown",
            status: "unknown",
          } as Vessel)

        // Handle vessel name property differences
        const vesselName = vessel.name || (vessel as any).vessel_name || "Unknown Vessel"

        return {
          id: booking.id,
          title: `${vesselName} - ${getStatusLabel(booking.status)}`,
          start: parseISO(booking.start_date),
          end: parseISO(booking.end_date),
          resource: {
            booking,
            vessel,
          },
          status: booking.status,
        }
      })
  }, [bookings, vessels, selectedVesselId, statusFilters])

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    router.push(`/dashboard/bookings/${event.id}`)
  }

  // Handle date change
  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  // Handle view change
  const handleViewChange = (newView: string) => {
    setView(newView)
  }

  // Get status label
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

  // Custom event styling based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#6b7280" // Default gray

    switch (event.status) {
      case "PENDING_CONFIRMATION":
        backgroundColor = "#f59e0b" // Amber
        break
      case "CONFIRMED":
        backgroundColor = "#10b981" // Green
        break
      case "ACTIVE":
        backgroundColor = "#3b82f6" // Blue
        break
      case "COMPLETED":
        backgroundColor = "#8b5cf6" // Purple
        break
      case "REJECTED":
        backgroundColor = "#ef4444" // Red
        break
      case "CANCELLED":
        backgroundColor = "#6b7280" // Gray
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onNavigate("TODAY")}>
            Today
          </Button>
          <Button variant="outline" onClick={() => onNavigate("PREV")}>
            &lt;
          </Button>
          <Button variant="outline" onClick={() => onNavigate("NEXT")}>
            &gt;
          </Button>
          <span className="text-lg font-semibold">{label}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tabs defaultValue="month" onValueChange={onView}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
            </TabsList>
          </Tabs>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Calendar Filters</SheetTitle>
                <SheetDescription>Filter bookings by vessel and status</SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vessel-filter">Vessel</Label>
                  <Select value={selectedVesselId} onValueChange={setSelectedVesselId}>
                    <SelectTrigger id="vessel-filter">
                      <SelectValue placeholder="Select a vessel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vessels</SelectItem>
                      {vessels.map((vessel) => (
                        <SelectItem key={vessel.id} value={vessel.id}>
                          {vessel.name || (vessel as any).vessel_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Booking Status</Label>
                  <div className="space-y-2">
                    {Object.keys(statusFilters).map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={statusFilters[status as keyof typeof statusFilters]}
                          onCheckedChange={(checked) => {
                            setStatusFilters((prev) => ({
                              ...prev,
                              [status]: !!checked,
                            }))
                          }}
                        />
                        <label
                          htmlFor={`status-${status}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {getStatusLabel(status)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Button variant="default" onClick={() => router.push("/dashboard/bookings/new")}>
            New Booking
          </Button>
        </div>
      </div>
    )
  }

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const vessel = event.resource.vessel
    const booking = event.resource.booking
    const chartererName = booking.charterer?.full_name || "Unknown Charterer"

    return (
      <div className="h-full w-full p-1 overflow-hidden cursor-pointer" onClick={() => handleEventClick(event)}>
        <div className="text-xs font-semibold truncate">{vessel.name || (vessel as any).vessel_name}</div>
        <div className="text-xs truncate">{chartererName}</div>
      </div>
    )
  }

  // Custom agenda event component
  const AgendaEvent = ({ event }: { event: CalendarEvent }) => {
    const vessel = event.resource.vessel
    const booking = event.resource.booking
    const chartererName = booking.charterer?.full_name || "Unknown Charterer"

    return (
      <div className="flex items-center gap-2">
        <div>
          <div className="font-semibold">{vessel.name || (vessel as any).vessel_name}</div>
          <div className="text-sm text-muted-foreground">Charterer: {chartererName}</div>
          <div className="text-sm">
            {format(event.start, "MMM d, yyyy")} - {format(event.end, "MMM d, yyyy")}
          </div>
        </div>
        <Badge
          variant="outline"
          className={`ml-auto ${
            event.status === "PENDING_CONFIRMATION"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : event.status === "CONFIRMED"
                ? "bg-green-50 text-green-700 border-green-200"
                : event.status === "ACTIVE"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : event.status === "COMPLETED"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : event.status === "REJECTED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
          }`}
        >
          {getStatusLabel(event.status)}
        </Badge>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-[600px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            view={view as any}
            date={date}
            onNavigate={handleNavigate}
            onView={(newView) => handleViewChange(newView)}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent,
              agenda: {
                event: AgendaEvent,
              },
            }}
            eventPropGetter={eventStyleGetter}
            popup
            selectable
            onSelectEvent={handleEventClick}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Legend</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: "#f59e0b" }}></div>
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: "#10b981" }}></div>
              <span className="text-sm">Confirmed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: "#3b82f6" }}></div>
              <span className="text-sm">Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: "#8b5cf6" }}></div>
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: "#ef4444" }}></div>
              <span className="text-sm">Rejected</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: "#6b7280" }}></div>
              <span className="text-sm">Cancelled</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
