"use server"

import { getServerSideSupabase } from "@/lib/supabase"
import { mockBookings } from "@/lib/mock-data"

// Flag to bypass authentication during development
const BYPASS_AUTH = true
// Define a constant for the mock user ID to check against
const MOCK_USER_ID = "mock-user-id"

export async function getAllBookings() {
  // If bypassing auth, return mock data
  if (BYPASS_AUTH) {
    return mockBookings
  }

  try {
    const supabase = getServerSideSupabase()

    // Modified query to avoid relationship errors
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        vessel:vessels(
          id,
          vessel_name,
          vessel_type,
          location
        ),
        charterer:profiles(
          id,
          full_name,
          email
        ),
        operator:profiles(
          id,
          full_name,
          email
        )
      `)
      .order("start_date", { ascending: true })

    if (error) {
      console.error("Error fetching all bookings:", error)
      return []
    }

    return data as any[]
  } catch (error) {
    console.error("Error fetching all bookings:", error)
    return []
  }
}

export async function getBookingsForUser(userId: string) {
  // If using mock user ID, return mock data
  if (userId === MOCK_USER_ID || BYPASS_AUTH) {
    return mockBookings.filter((booking) => booking.charterer_id === userId)
  }

  try {
    const supabase = getServerSideSupabase()

    // Modified query to avoid relationship errors
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        vessel:vessels(
          id,
          vessel_name,
          vessel_type,
          location
        ),
        charterer:profiles(
          id,
          full_name,
          email
        )
      `)
      .eq("charterer_id", userId)
      .order("start_date", { ascending: true })

    if (error) {
      console.error("Error fetching user bookings:", error)
      return []
    }

    return data as any[]
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return []
  }
}

export async function getBookingsForVesselOwner(ownerId: string) {
  // If using mock user ID, return mock data
  if (ownerId === MOCK_USER_ID || BYPASS_AUTH) {
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

    // Modified query to avoid relationship errors
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        vessel:vessels(
          id,
          vessel_name,
          vessel_type,
          location
        ),
        charterer:profiles(
          id,
          full_name,
          email
        ),
        operator:profiles(
          id,
          full_name,
          email
        )
      `)
      .in("vessel_id", vesselIds)
      .order("start_date", { ascending: true })

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
  if (operatorId === MOCK_USER_ID || BYPASS_AUTH) {
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

    // Modified query to avoid relationship errors
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        vessel:vessels(
          id,
          vessel_name,
          vessel_type,
          location
        ),
        charterer:profiles(
          id,
          full_name,
          email
        ),
        operator:profiles(
          id,
          full_name,
          email
        )
      `)
      .in("vessel_id", vesselIds)
      .order("start_date", { ascending: true })

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

export async function getBookingsForVessel(vesselId: string) {
  // If using mock vessel ID, return mock data
  if (vesselId === "mock-vessel-id" || BYPASS_AUTH) {
    return mockBookings.filter((booking) => booking.vessel_id === vesselId)
  }

  try {
    const supabase = getServerSideSupabase()

    // Modified query to avoid relationship errors
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        charterer:profiles(
          id,
          full_name,
          email
        ),
        operator:profiles(
          id,
          full_name,
          email
        )
      `)
      .eq("vessel_id", vesselId)
      .order("start_date", { ascending: true })

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

export async function getVesselAvailability(vesselId: string, startDate: string, endDate: string) {
  // If using mock vessel ID, return mock data
  if (vesselId === "mock-vessel-id" || BYPASS_AUTH) {
    const overlappingBookings = mockBookings.filter(
      (booking) =>
        booking.vessel_id === vesselId &&
        booking.status !== "REJECTED" &&
        booking.status !== "CANCELLED" &&
        booking.start_date <= endDate &&
        booking.end_date >= startDate,
    )

    return {
      available: overlappingBookings.length === 0,
      conflictingBookings: overlappingBookings,
    }
  }

  try {
    const supabase = getServerSideSupabase()

    // Get all bookings for this vessel that overlap with the requested period
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("vessel_id", vesselId)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
      .in("status", ["PENDING_CONFIRMATION", "CONFIRMED", "ACTIVE"])

    if (error) {
      console.error("Error checking vessel availability:", error)
      return { available: false, error: "Failed to check availability" }
    }

    // If there are any overlapping bookings, the vessel is not available
    return {
      available: data.length === 0,
      conflictingBookings: data,
    }
  } catch (error) {
    console.error("Error checking vessel availability:", error)
    return { available: false, error: "Failed to check availability" }
  }
}
