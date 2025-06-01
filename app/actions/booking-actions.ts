"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient, getServerSideSupabase } from "@/lib/supabase"
import { getServerSession } from "@/lib/session"
import { getUserRole } from "@/lib/hooks/use-user-role"
import type { Database } from "@/types/supabase"
import { mockBookings } from "@/lib/mock-data"

// Flag to bypass authentication during development
const BYPASS_AUTH = false
// Define a constant for the mock user ID to check against
const MOCK_USER_ID = "mock-user-id"

export type Booking = Database["public"]["Tables"]["bookings"]["Row"]

export async function getBookingsForUser(userId: string, isAdmin = false) {
  // If using mock user ID, return mock data
  if (userId === MOCK_USER_ID) {
    if (isAdmin) {
      return mockBookings
    }
    return mockBookings.filter((booking) => booking.charterer_id === userId)
  }

  try {
    const supabase = getServerSideSupabase()

    // If admin, get all bookings
    if (isAdmin) {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          vessel:vessel_id(
            id,
            name,
            vessel_type,
            location
          ),
          charterer:charterer_id(
            id,
            full_name,
            email
          ),
          operator:operator_id(
            id,
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching all bookings:", error)
        return []
      }

      return data as any[]
    }

    // For regular users, get only their bookings
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        vessel:vessel_id(
          id,
          name,
          vessel_type,
          location
        )
      `)
      .eq("charterer_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user bookings:", error)
      return []
    }

    return data as any[]
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

export async function getBookingsForVesselOwner(ownerId: string) {
  // If using mock user ID, return mock data
  if (ownerId === MOCK_USER_ID) {
    return mockBookings
  }

  try {
    const supabase = getServerSideSupabase()

    // First, get all vessels owned by this user
    const { data: vessels, error: vesselError } = await supabase.from("vessels").select("id").eq("owner_id", ownerId)

    if (vesselError || !vessels || vessels.length === 0) {
      console.error("Error fetching owner vessels:", vesselError)
      return []
    }

    // Get all bookings for these vessels
    const vesselIds = vessels.map((v) => v.id)
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        vessel:vessel_id(
          id,
          name,
          vessel_type,
          location
        ),
        charterer:charterer_id(
          id,
          full_name,
          email
        ),
        operator:operator_id(
          id,
          full_name,
          email
        )
      `)
      .in("vessel_id", vesselIds)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching vessel owner bookings:", error)
      return []
    }

    return data as any[]
  } catch (error) {
    console.error("Error fetching vessel owner bookings:", error)
    return []
  }
}

export async function getBookingsForVesselOperator(operatorId: string) {
  // If using mock user ID, return mock data
  if (operatorId === MOCK_USER_ID) {
    return mockBookings.filter((booking) => booking.operator_id === operatorId)
  }

  try {
    const supabase = getServerSideSupabase()

    // First, get all vessels this operator is assigned to
    const { data: assignments, error: assignmentError } = await supabase
      .from("vessel_operators")
      .select("vessel_id")
      .eq("operator_id", operatorId)

    if (assignmentError || !assignments || assignments.length === 0) {
      console.error("Error fetching operator vessel assignments:", assignmentError)
      return []
    }

    // Get all bookings for these vessels
    const vesselIds = assignments.map((a) => a.vessel_id)
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        vessel:vessel_id(
          id,
          name,
          vessel_type,
          location
        ),
        charterer:charterer_id(
          id,
          full_name,
          email
        )
      `)
      .in("vessel_id", vesselIds)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching vessel operator bookings:", error)
      return []
    }

    return data as any[]
  } catch (error) {
    console.error("Error fetching vessel operator bookings:", error)
    return []
  }
}

export async function getVesselBookings(vesselId: string) {
  // If using mock vessel ID, return mock data
  if (vesselId === "mock-vessel-id") {
    return mockBookings.filter((booking) => booking.vessel_id === vesselId)
  }

  try {
    const supabase = getServerSideSupabase()

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        charterer:charterer_id(
          id,
          full_name,
          email
        ),
        operator:operator_id(
          id,
          full_name,
          email
        )
      `)
      .eq("vessel_id", vesselId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching vessel bookings:", error)
      return []
    }

    return data as any[]
  } catch (error) {
    console.error("Error fetching vessel bookings:", error)
    return []
  }
}

export async function getBookingById(bookingId: string) {
  // If using mock booking ID, return mock data
  if (bookingId.startsWith("mock-")) {
    const booking = mockBookings.find((b) => b.id === bookingId)
    return booking || null
  }

  try {
    const supabase = getServerSideSupabase()

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        vessel:vessel_id(
          id,
          name,
          vessel_type,
          location
        ),
        charterer:charterer_id(
          id,
          full_name,
          email
        ),
        operator:operator_id(
          id,
          full_name,
          email
        )
      `)
      .eq("id", bookingId)
      .single()

    if (error) {
      console.error("Error fetching booking:", error)
      return null
    }

    return data as any
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

export async function approveBooking(bookingId: string) {
  try {
    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to approve bookings",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("vessel_id, status")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError)
      return { success: false, error: "Booking not found" }
    }

    // Check if booking is in the correct state
    if (booking.status !== "PENDING_CONFIRMATION") {
      return {
        success: false,
        error: "Only pending bookings can be approved",
      }
    }

    // Check if user has permission to approve this booking
    if (userRole !== "Admin") {
      // If not admin, check if user is the vessel owner
      const { data: vessel, error: vesselError } = await supabase
        .from("vessels")
        .select("owner_id")
        .eq("id", booking.vessel_id)
        .single()

      if (vesselError || !vessel) {
        console.error("Error fetching vessel:", vesselError)
        return { success: false, error: "Failed to verify vessel ownership" }
      }

      if (vessel.owner_id !== session.user.id) {
        return {
          success: false,
          error: "You don't have permission to approve this booking",
        }
      }
    }

    // Update the booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    if (updateError) {
      console.error("Error approving booking:", updateError)
      throw new Error("Failed to approve booking")
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/bookings")
    revalidatePath(`/dashboard/bookings/${bookingId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error approving booking:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function rejectBooking(bookingId: string) {
  try {
    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to reject bookings",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("vessel_id, status")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError)
      return { success: false, error: "Booking not found" }
    }

    // Check if booking is in the correct state
    if (booking.status !== "PENDING_CONFIRMATION") {
      return {
        success: false,
        error: "Only pending bookings can be rejected",
      }
    }

    // Check if user has permission to reject this booking
    if (userRole !== "Admin") {
      // If not admin, check if user is the vessel owner
      const { data: vessel, error: vesselError } = await supabase
        .from("vessels")
        .select("owner_id")
        .eq("id", booking.vessel_id)
        .single()

      if (vesselError || !vessel) {
        console.error("Error fetching vessel:", vesselError)
        return { success: false, error: "Failed to verify vessel ownership" }
      }

      if (vessel.owner_id !== session.user.id) {
        return {
          success: false,
          error: "You don't have permission to reject this booking",
        }
      }
    }

    // Update the booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "REJECTED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    if (updateError) {
      console.error("Error rejecting booking:", updateError)
      throw new Error("Failed to reject booking")
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/bookings")
    revalidatePath(`/dashboard/bookings/${bookingId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error rejecting booking:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function markBookingAsActive(bookingId: string) {
  try {
    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to update booking status",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("vessel_id, status")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError)
      return { success: false, error: "Booking not found" }
    }

    // Check if booking is in the correct state
    if (booking.status !== "CONFIRMED") {
      return {
        success: false,
        error: "Only confirmed bookings can be marked as active",
      }
    }

    // Check if user has permission to update this booking
    let hasPermission = userRole === "Admin"

    if (!hasPermission && userRole === "Vessel Operator") {
      // Check if user is assigned as operator for this vessel
      const { data: assignment, error: assignmentError } = await supabase
        .from("vessel_operators")
        .select("id")
        .eq("vessel_id", booking.vessel_id)
        .eq("operator_id", session.user.id)
        .single()

      hasPermission = !assignmentError && !!assignment
    }

    if (!hasPermission) {
      return {
        success: false,
        error: "You don't have permission to update this booking",
      }
    }

    // Update the booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "ACTIVE",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    if (updateError) {
      console.error("Error updating booking status:", updateError)
      throw new Error("Failed to update booking status")
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/bookings")
    revalidatePath(`/dashboard/bookings/${bookingId}`)
    revalidatePath("/dashboard/operator")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function markBookingAsCompleted(bookingId: string) {
  try {
    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to update booking status",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("vessel_id, status")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError)
      return { success: false, error: "Booking not found" }
    }

    // Check if booking is in the correct state
    if (booking.status !== "ACTIVE") {
      return {
        success: false,
        error: "Only active bookings can be marked as completed",
      }
    }

    // Check if user has permission to update this booking
    let hasPermission = userRole === "Admin"

    if (!hasPermission && userRole === "Vessel Operator") {
      // Check if user is assigned as operator for this vessel
      const { data: assignment, error: assignmentError } = await supabase
        .from("vessel_operators")
        .select("id")
        .eq("vessel_id", booking.vessel_id)
        .eq("operator_id", session.user.id)
        .single()

      hasPermission = !assignmentError && !!assignment
    }

    if (!hasPermission) {
      return {
        success: false,
        error: "You don't have permission to update this booking",
      }
    }

    // Update the booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "COMPLETED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    if (updateError) {
      console.error("Error updating booking status:", updateError)
      throw new Error("Failed to update booking status")
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/bookings")
    revalidatePath(`/dashboard/bookings/${bookingId}`)
    revalidatePath("/dashboard/operator")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to cancel bookings",
      }
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("charterer_id, status")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError)
      return { success: false, error: "Booking not found" }
    }

    // Check if booking is in a state that can be cancelled
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      return {
        success: false,
        error: "This booking cannot be cancelled",
      }
    }

    // Check if user is the charterer
    if (booking.charterer_id !== session.user.id) {
      // Get user role
      const userRole = await getUserRole(session.user.id)

      // Only the charterer or an admin can cancel a booking
      if (userRole !== "Admin") {
        return {
          success: false,
          error: "You don't have permission to cancel this booking",
        }
      }
    }

    // Update the booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "CANCELLED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    if (updateError) {
      console.error("Error cancelling booking:", updateError)
      throw new Error("Failed to cancel booking")
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/bookings")
    revalidatePath(`/dashboard/bookings/${bookingId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getVesselById(vesselId: string) {
  const supabase = getServerSideSupabase()

  const { data, error } = await supabase.from("vessels").select("*").eq("id", vesselId).single()

  if (error) {
    console.error("Error fetching vessel:", error)
    return null
  }

  return data
}

interface CreateBookingParams {
  vessel_id: string
  start_date: string
  end_date: string
  personnel_onboard: number
  scope_of_work: string
  project_ref: string | null
  base_charter_cost: number
  estimated_total_cost: number
}

export async function createBooking(data: CreateBookingParams) {
  try {
    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to create a booking",
      }
    }

    // Insert the new booking
    const { data: newBooking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        vessel_id: data.vessel_id,
        charterer_id: session.user.id,
        start_date: data.start_date,
        end_date: data.end_date,
        personnel_onboard: data.personnel_onboard,
        scope_of_work: data.scope_of_work,
        project_ref: data.project_ref,
        status: "PENDING_CONFIRMATION",
        base_charter_cost: data.base_charter_cost,
        estimated_total_cost: data.estimated_total_cost,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating booking:", insertError)
      throw new Error("Failed to create booking")
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/bookings")

    return {
      success: true,
      bookingId: newBooking.id,
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
