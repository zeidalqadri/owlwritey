"use client"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Flag to bypass authentication during development
const BYPASS_AUTH = true
// Default role to use when bypassing auth
const DEFAULT_ROLE = "Admin" // You can change this to "Vessel Owner", "Vessel Operator", or "Charterer"

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchUserRole() {
      try {
        // Check for development role cookie
        const cookies = document.cookie.split(";")
        const devRoleCookie = cookies.find((cookie) => cookie.trim().startsWith("DEV_USER_ROLE="))

        if (devRoleCookie) {
          const devRole = devRoleCookie.split("=")[1].trim()
          setRole(devRole)
          setLoading(false)
          return
        }

        // If bypassing auth, return the default role
        if (BYPASS_AUTH) {
          setRole(DEFAULT_ROLE)
          setLoading(false)
          return
        }

        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setLoading(false)
          return null
        }

        // Get the user's profile
        const { data, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (error) {
          console.error("Error fetching user role:", error)
          setLoading(false)
          return null
        }

        setRole(data?.role || "Charterer")
        setLoading(false)
      } catch (error) {
        console.error("Error in useUserRole hook:", error)
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [supabase])

  return { role, loading }
}
