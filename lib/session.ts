import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

// Flag to bypass authentication during development
const BYPASS_AUTH = true // Changed to true to bypass auth

export async function getServerSession() {
  // If bypassing auth, return a mock session
  if (BYPASS_AUTH) {
    return {
      user: {
        id: "mock-user-id",
        email: "dev@example.com",
        name: "Development User",
      },
    }
  }

  // Normal authentication flow
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}
