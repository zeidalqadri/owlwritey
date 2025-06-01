"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createServerSupabaseClient, getServerSideSupabase } from "@/lib/supabase"
import { getServerSession } from "@/lib/session"
import { getUserRole } from "@/lib/hooks/use-user-role"
import type { Database } from "@/types/supabase"

// Set BYPASS_AUTH to false to use real data
const BYPASS_AUTH = false
// Define a constant for the mock user ID to check against
const MOCK_USER_ID = "mock-user-id"

export type Vessel = Database["public"]["Tables"]["vessels"]["Row"]

// Define the vessel schema for validation with OSV-specific fields
const vesselSchema = z.object({
  vessel_name: z.string().min(2, { message: "Vessel name must be at least 2 characters" }),
  imo_number: z.string().nullable().optional(),
  mmsi_number: z.string().nullable().optional(),
  vessel_type: z.string().min(2, { message: "Vessel type is required" }),
  year_built: z.number().int().positive().min(1900).max(new Date().getFullYear()),
  flag: z.string().nullable().optional(),
  gross_tonnage: z.number().positive().nullable().optional(),
  deadweight: z.number().positive().nullable().optional(),
  length_overall: z.number().positive({ message: "Length overall must be a positive number" }),
  beam: z.number().positive({ message: "Beam must be a positive number" }),
  bhp: z.number().positive().nullable().optional(),
  bollard_pull: z.number().positive().nullable().optional(),
  deck_area: z.number().positive().nullable().optional(),
  passenger_capacity: z.number().int().positive({ message: "Passenger capacity must be a positive integer" }),
  dynamic_positioning: z.enum(["DP-1", "DP-2", "DP-3", "No DP"]).nullable(),
  classification_society: z.string().nullable().optional(),
  shipyard: z.string().nullable().optional(),
  location: z.string().min(2, { message: "Location is required" }),
  description: z.string().nullable().optional(),
  features: z.array(z.string()).optional().nullable(),
  daily_rate: z.number().positive().nullable().optional(),
  weekly_rate: z.number().positive().nullable().optional(),
  monthly_rate: z.number().positive().nullable().optional(),
  status: z.enum(["Active", "Maintenance", "Unavailable", "Expired", "Valid", "Unknown"]),
  marketplace_visible: z.boolean(),
  main_image_url: z.string().url().nullable().optional(),
  images: z.array(z.string().url()).nullable().optional(),
})

export type VesselFormData = z.infer<typeof vesselSchema>

// Mock vessel data for demo purposes
function getMockVessels(): Vessel[] {
  return [
    {
      id: "1",
      vessel_name: "Atlantic Pioneer",
      vessel_type: "AHTS",
      year_built: 2018,
      length_overall: 85.5,
      beam: 18.0,
      passenger_capacity: 24,
      location: "Gulf of Mexico",
      status: "Active",
      marketplace_visible: true,
      daily_rate: 12500,
      weekly_rate: 75000,
      monthly_rate: 300000,
      bollard_pull: 150,
      dynamic_positioning: "DP-2",
      deck_area: 450,
      bhp: 8000,
      description: "Modern AHTS vessel with advanced DP capabilities and excellent safety record.",
      features: ["DP-2", "Fire Fighting", "Oil Recovery", "ROV Support"],
      created_at: "2024-01-15T08:00:00Z",
      updated_at: "2024-01-15T08:00:00Z",
      owner_id: "owner-1",
      imo_number: "9876543",
      mmsi_number: "123456789",
      flag: "Marshall Islands",
      gross_tonnage: 2500,
      deadweight: 1800,
      classification_society: "DNV",
      shipyard: "Damen Shipyards",
      main_image_url: null,
      images: null
    },
    {
      id: "2",
      vessel_name: "Ocean Defender",
      vessel_type: "PSV",
      year_built: 2020,
      length_overall: 78.0,
      beam: 16.5,
      passenger_capacity: 18,
      location: "North Sea",
      status: "Active",
      marketplace_visible: true,
      daily_rate: 8500,
      weekly_rate: 51000,
      monthly_rate: 200000,
      bollard_pull: null,
      dynamic_positioning: "DP-2",
      deck_area: 380,
      bhp: 6500,
      description: "State-of-the-art platform supply vessel with large cargo capacity.",
      features: ["DP-2", "Cargo Handling", "Accommodation", "Helideck"],
      created_at: "2024-01-10T08:00:00Z",
      updated_at: "2024-01-10T08:00:00Z",
      owner_id: "owner-2",
      imo_number: "9876542",
      mmsi_number: "123456788",
      flag: "Norway",
      gross_tonnage: 2200,
      deadweight: 1600,
      classification_society: "DNV",
      shipyard: "Ulstein Verft",
      main_image_url: null,
      images: null
    },
    {
      id: "3",
      vessel_name: "Swift Current",
      vessel_type: "Crew Boat",
      year_built: 2019,
      length_overall: 32.0,
      beam: 8.5,
      passenger_capacity: 48,
      location: "West Africa",
      status: "Active",
      marketplace_visible: true,
      daily_rate: 3500,
      weekly_rate: 21000,
      monthly_rate: 85000,
      bollard_pull: null,
      dynamic_positioning: null,
      deck_area: 85,
      bhp: 2200,
      description: "High-speed crew transfer vessel with excellent passenger comfort.",
      features: ["Air Conditioning", "WiFi", "Safety Equipment", "Medical Facilities"],
      created_at: "2024-01-08T08:00:00Z",
      updated_at: "2024-01-08T08:00:00Z",
      owner_id: "owner-3",
      imo_number: "9876541",
      mmsi_number: "123456787",
      flag: "Panama",
      gross_tonnage: 350,
      deadweight: 280,
      classification_society: "ABS",
      shipyard: "Damen Shipyards",
      main_image_url: null,
      images: null
    },
    {
      id: "4",
      vessel_name: "Neptune's Force",
      vessel_type: "AHTS",
      year_built: 2017,
      length_overall: 90.0,
      beam: 20.0,
      passenger_capacity: 28,
      location: "Brazil",
      status: "Active",
      marketplace_visible: true,
      daily_rate: 15000,
      weekly_rate: 90000,
      monthly_rate: 360000,
      bollard_pull: 180,
      dynamic_positioning: "DP-3",
      deck_area: 520,
      bhp: 9500,
      description: "Heavy-duty AHTS with exceptional bollard pull and DP-3 capabilities.",
      features: ["DP-3", "Heavy Lifting", "Fire Fighting", "Subsea Support"],
      created_at: "2024-01-05T08:00:00Z",
      updated_at: "2024-01-05T08:00:00Z",
      owner_id: "owner-4",
      imo_number: "9876540",
      mmsi_number: "123456786",
      flag: "Liberia",
      gross_tonnage: 3200,
      deadweight: 2400,
      classification_society: "Lloyd's Register",
      shipyard: "Wartsila",
      main_image_url: null,
      images: null
    },
    {
      id: "5",
      vessel_name: "Horizon Explorer",
      vessel_type: "ROV Support",
      year_built: 2021,
      length_overall: 65.0,
      beam: 14.0,
      passenger_capacity: 16,
      location: "Southeast Asia",
      status: "Active",
      marketplace_visible: true,
      daily_rate: 18000,
      weekly_rate: 108000,
      monthly_rate: 430000,
      bollard_pull: null,
      dynamic_positioning: "DP-2",
      deck_area: 220,
      bhp: 4500,
      description: "Specialized ROV support vessel with cutting-edge subsea technology.",
      features: ["ROV Launch", "DP-2", "Survey Equipment", "Moonpool"],
      created_at: "2024-01-03T08:00:00Z",
      updated_at: "2024-01-03T08:00:00Z",
      owner_id: "owner-5",
      imo_number: "9876539",
      mmsi_number: "123456785",
      flag: "Singapore",
      gross_tonnage: 1800,
      deadweight: 1200,
      classification_society: "ABS",
      shipyard: "Vard",
      main_image_url: null,
      images: null
    },
    {
      id: "6",
      vessel_name: "Marine Guardian",
      vessel_type: "PSV",
      year_built: 2016,
      length_overall: 82.0,
      beam: 17.5,
      passenger_capacity: 22,
      location: "Trinidad",
      status: "Active",
      marketplace_visible: true,
      daily_rate: 9500,
      weekly_rate: 57000,
      monthly_rate: 225000,
      bollard_pull: null,
      dynamic_positioning: "DP-1",
      deck_area: 420,
      bhp: 7200,
      description: "Reliable platform supply vessel with proven track record in Caribbean operations.",
      features: ["DP-1", "Bulk Storage", "Liquid Mud", "Accommodation"],
      created_at: "2024-01-01T08:00:00Z",
      updated_at: "2024-01-01T08:00:00Z",
      owner_id: "owner-6",
      imo_number: "9876538",
      mmsi_number: "123456784",
      flag: "Trinidad and Tobago",
      gross_tonnage: 2400,
      deadweight: 1700,
      classification_society: "ABS",
      shipyard: "Eastern Shipbuilding",
      main_image_url: null,
      images: null
    }
  ]
}

export async function getVessels(includeHidden = false) {
  try {
    console.log("Fetching vessels from Supabase...")
    
    // If environment variables are missing, return mock data for demo
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
      console.log("Using mock vessel data for demo")
      return getMockVessels()
    }
    
    const supabase = getServerSideSupabase()

    let query = supabase.from("vessels").select("*")

    if (!includeHidden) {
      query = query.eq("marketplace_visible", true).eq("status", "Active")
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching vessels:", error)
      return getMockVessels()
    }

    console.log(`Successfully fetched ${data.length} vessels from Supabase`)
    return data as Vessel[]
  } catch (error) {
    console.error("Exception fetching vessels:", error)
    return getMockVessels()
  }
}

export async function getVesselById(id: string) {
  try {
    // If environment variables are missing, return mock data for demo
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
      console.log("Using mock vessel data for vessel ID:", id)
      const mockVessels = getMockVessels()
      return mockVessels.find(v => v.id === id) || null
    }
    
    const supabase = getServerSideSupabase()

    const { data, error } = await supabase
      .from("vessels")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching vessel by ID:", error)
      // Fallback to mock data
      const mockVessels = getMockVessels()
      return mockVessels.find(v => v.id === id) || null
    }

    return data as Vessel
  } catch (error) {
    console.error("Exception fetching vessel by ID:", error)
    // Fallback to mock data
    const mockVessels = getMockVessels()
    return mockVessels.find(v => v.id === id) || null
  }
}

export async function getVesselsByOwner(ownerId: string) {
  // If using mock user ID, return empty array
  if (ownerId === MOCK_USER_ID) {
    return []
  }

  try {
    const supabase = getServerSideSupabase()

    const { data, error } = await supabase
      .from("vessels")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching owner vessels:", error)
      return []
    }

    return data as Vessel[]
  } catch (error) {
    console.error("Exception fetching owner vessels:", error)
    return []
  }
}

export async function getAssignedVessels(operatorId: string) {
  // If using mock user ID, return empty array
  if (operatorId === MOCK_USER_ID) {
    return []
  }

  try {
    const supabase = getServerSideSupabase()

    // Get vessels this operator is assigned to
    const { data, error } = await supabase
      .from("vessel_operators")
      .select(`
        vessels:vessel_id(*)
      `)
      .eq("operator_id", operatorId)

    if (error) {
      console.error("Error fetching assigned vessels:", error)
      return []
    }

    // Extract vessels from the nested structure
    const vessels = data.map((item) => item.vessels) as Vessel[]
    return vessels
  } catch (error) {
    console.error("Exception fetching assigned vessels:", error)
    return []
  }
}

export async function createVessel(data: VesselFormData) {
  try {
    // Validate the data
    const validatedData = vesselSchema.parse(data)

    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to create a vessel",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Check if user has permission to create vessels
    if (userRole !== "Admin" && userRole !== "Vessel Owner") {
      return {
        success: false,
        error: "You don't have permission to create vessels",
      }
    }

    // If using mock user ID, return success without actually creating
    if (session.user.id === MOCK_USER_ID) {
      return {
        success: true,
        vesselId: "mock-vessel-id",
      }
    }

    // Insert the new vessel
    const { data: newVessel, error: insertError } = await supabase
      .from("vessels")
      .insert({
        ...validatedData,
        owner_id: session.user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating vessel:", insertError)
      throw new Error("Failed to create vessel")
    }

    // Revalidate the vessels page
    revalidatePath("/marketplace")
    revalidatePath("/dashboard/vessels")

    return {
      success: true,
      vesselId: newVessel.id,
    }
  } catch (error) {
    console.error("Error creating vessel:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return {
        success: false,
        error: `Validation error: ${errorMessage}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function updateVessel(id: string, data: VesselFormData) {
  try {
    // Validate the data
    const validatedData = vesselSchema.parse(data)

    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to update a vessel",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Check if user has permission to update vessels
    if (userRole !== "Admin" && userRole !== "Vessel Owner") {
      return {
        success: false,
        error: "You don't have permission to update vessels",
      }
    }

    // If using mock user ID, return success without actually updating
    if (session.user.id === MOCK_USER_ID) {
      return {
        success: true,
      }
    }

    // If user is a Vessel Owner, verify they own this vessel
    if (userRole === "Vessel Owner") {
      const { data: vessel, error: vesselError } = await supabase
        .from("vessels")
        .select("owner_id")
        .eq("id", id)
        .single()

      if (vesselError) {
        console.error("Error fetching vessel:", vesselError)
        return { success: false, error: "Failed to verify vessel ownership" }
      }

      if (vessel.owner_id !== session.user.id) {
        return {
          success: false,
          error: "You can only update vessels you own",
        }
      }
    }

    // Update the vessel
    const { error: updateError } = await supabase
      .from("vessels")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating vessel:", updateError)
      throw new Error("Failed to update vessel")
    }

    // Revalidate the vessels page
    revalidatePath("/marketplace")
    revalidatePath(`/marketplace/${id}`)
    revalidatePath("/dashboard/vessels")
    revalidatePath(`/dashboard/vessels/${id}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating vessel:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return {
        success: false,
        error: `Validation error: ${errorMessage}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function deleteVessel(id: string) {
  try {
    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to delete a vessel",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Check if user has permission to delete vessels
    if (userRole !== "Admin" && userRole !== "Vessel Owner") {
      return {
        success: false,
        error: "You don't have permission to delete vessels",
      }
    }

    // If using mock user ID, return success without actually deleting
    if (session.user.id === MOCK_USER_ID) {
      return {
        success: true,
      }
    }

    // If user is a Vessel Owner, verify they own this vessel
    if (userRole === "Vessel Owner") {
      const { data: vessel, error: vesselError } = await supabase
        .from("vessels")
        .select("owner_id")
        .eq("id", id)
        .single()

      if (vesselError) {
        console.error("Error fetching vessel:", vesselError)
        return { success: false, error: "Failed to verify vessel ownership" }
      }

      if (vessel.owner_id !== session.user.id) {
        return {
          success: false,
          error: "You can only delete vessels you own",
        }
      }
    }

    // Check if vessel has any bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id")
      .eq("vessel_id", id)
      .limit(1)

    if (bookingsError) {
      console.error("Error checking vessel bookings:", bookingsError)
      return { success: false, error: "Failed to check vessel bookings" }
    }

    if (bookings && bookings.length > 0) {
      return {
        success: false,
        error: "Cannot delete vessel with existing bookings",
      }
    }

    // Delete the vessel
    const { error: deleteError } = await supabase.from("vessels").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting vessel:", deleteError)
      throw new Error("Failed to delete vessel")
    }

    // Revalidate the vessels page
    revalidatePath("/marketplace")
    revalidatePath("/dashboard/vessels")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting vessel:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getFeaturedVessels(limit = 3) {
  try {
    // If environment variables are missing, return mock data for demo
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
      console.log("Using mock featured vessel data for demo")
      return getMockVessels().slice(0, limit)
    }
    
    const supabase = getServerSideSupabase()

    const { data, error } = await supabase
      .from("vessels")
      .select("*")
      .eq("marketplace_visible", true)
      .eq("status", "Active")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching featured vessels:", error)
      return getMockVessels().slice(0, limit)
    }

    return data as Vessel[]
  } catch (error) {
    console.error("Error fetching featured vessels:", error)
    return getMockVessels().slice(0, limit)
  }
}

export async function assignOperatorToVessel(vesselId: string, operatorId: string) {
  try {
    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to assign operators",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Check if user has permission to assign operators
    if (userRole !== "Admin" && userRole !== "Vessel Owner") {
      return {
        success: false,
        error: "You don't have permission to assign operators",
      }
    }

    // If using mock user ID, return success without actually assigning
    if (session.user.id === MOCK_USER_ID || operatorId === MOCK_USER_ID) {
      return {
        success: true,
      }
    }

    // If user is a Vessel Owner, verify they own this vessel
    if (userRole === "Vessel Owner") {
      const { data: vessel, error: vesselError } = await supabase
        .from("vessels")
        .select("owner_id")
        .eq("id", vesselId)
        .single()

      if (vesselError) {
        console.error("Error fetching vessel:", vesselError)
        return { success: false, error: "Failed to verify vessel ownership" }
      }

      if (vessel.owner_id !== session.user.id) {
        return {
          success: false,
          error: "You can only assign operators to vessels you own",
        }
      }
    }

    // Verify the operator exists and has the Vessel Operator role
    const { data: operator, error: operatorError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", operatorId)
      .single()

    if (operatorError || !operator) {
      console.error("Error fetching operator:", operatorError)
      return { success: false, error: "Operator not found" }
    }

    if (operator.role !== "Vessel Operator") {
      return {
        success: false,
        error: "Selected user is not a Vessel Operator",
      }
    }

    // Check if assignment already exists
    const { data: existingAssignment, error: checkError } = await supabase
      .from("vessel_operators")
      .select("id")
      .eq("vessel_id", vesselId)
      .eq("operator_id", operatorId)
      .single()

    if (!checkError && existingAssignment) {
      return {
        success: false,
        error: "Operator is already assigned to this vessel",
      }
    }

    // Create the assignment
    const { error: insertError } = await supabase.from("vessel_operators").insert({
      vessel_id: vesselId,
      operator_id: operatorId,
      assigned_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error assigning operator:", insertError)
      throw new Error("Failed to assign operator")
    }

    // Revalidate relevant paths
    revalidatePath(`/dashboard/vessels/${vesselId}`)
    revalidatePath(`/dashboard/operator`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error assigning operator:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function removeOperatorFromVessel(vesselId: string, operatorId: string) {
  try {
    // Connect to Supabase
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to remove operators",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Check if user has permission to remove operators
    if (userRole !== "Admin" && userRole !== "Vessel Owner") {
      return {
        success: false,
        error: "You don't have permission to remove operators",
      }
    }

    // If using mock user ID, return success without actually removing
    if (session.user.id === MOCK_USER_ID || operatorId === MOCK_USER_ID) {
      return {
        success: true,
      }
    }

    // If user is a Vessel Owner, verify they own this vessel
    if (userRole === "Vessel Owner") {
      const { data: vessel, error: vesselError } = await supabase
        .from("vessels")
        .select("owner_id")
        .eq("id", vesselId)
        .single()

      if (vesselError) {
        console.error("Error fetching vessel:", vesselError)
        return { success: false, error: "Failed to verify vessel ownership" }
      }

      if (vessel.owner_id !== session.user.id) {
        return {
          success: false,
          error: "You can only remove operators from vessels you own",
        }
      }
    }

    // Check if there are active bookings for this vessel with this operator
    const { data: activeBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id")
      .eq("vessel_id", vesselId)
      .eq("operator_id", operatorId)
      .in("status", ["CONFIRMED", "ACTIVE"])
      .limit(1)

    if (!bookingsError && activeBookings && activeBookings.length > 0) {
      return {
        success: false,
        error: "Cannot remove operator with active bookings",
      }
    }

    // Remove the assignment
    const { error: deleteError } = await supabase
      .from("vessel_operators")
      .delete()
      .eq("vessel_id", vesselId)
      .eq("operator_id", operatorId)

    if (deleteError) {
      console.error("Error removing operator:", deleteError)
      throw new Error("Failed to remove operator")
    }

    // Revalidate relevant paths
    revalidatePath(`/dashboard/vessels/${vesselId}`)
    revalidatePath(`/dashboard/operator`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error removing operator:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getVesselOperators(vesselId: string) {
  try {
    // If using a mock vessel ID, return empty array
    if (vesselId === "mock-vessel-id") {
      return []
    }

    const supabase = getServerSideSupabase()

    const { data, error } = await supabase
      .from("vessel_operators")
      .select(`
        operator_id,
        assigned_at,
        profiles:operator_id(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("vessel_id", vesselId)
      .order("assigned_at", { ascending: false })

    if (error) {
      console.error("Error fetching vessel operators:", error)
      return []
    }

    return data.map((item) => ({
      operatorId: item.operator_id,
      assignedAt: item.assigned_at,
      profile: item.profiles,
    }))
  } catch (error) {
    console.error("Error fetching vessel operators:", error)
    return []
  }
}
