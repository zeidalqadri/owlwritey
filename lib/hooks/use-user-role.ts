import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Flag to bypass authentication during development
const BYPASS_AUTH = true
// Default role to use when bypassing auth
const DEFAULT_ROLE = "Admin" // You can change this to "Vessel Owner", "Vessel Operator", or "Charterer"

export async function getUserRole(userId: string): Promise<string> {
  // Check for development role cookie
  const cookieStore = cookies()
  const devRoleCookie = cookieStore.get("DEV_USER_ROLE")

  if (devRoleCookie) {
    return devRoleCookie.value
  }

  // If bypassing auth, return the default role
  if (BYPASS_AUTH && userId === "mock-user-id") {
    return DEFAULT_ROLE
  }

  try {
    const supabase = createClient(cookieStore)

    // Query the profiles table to get the user's role
    const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user role:", error)
      return "Charterer" // Default role if there's an error
    }

    return data?.role || "Charterer" // Return the role or default to "Charterer"
  } catch (error) {
    console.error("Error in getUserRole:", error)
    return "Charterer" // Default role if there's an exception
  }
}
