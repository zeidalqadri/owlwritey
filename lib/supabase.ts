import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') {
    console.warn("Missing or demo Supabase environment variables - using mock data")
    // Return a dummy client that won't be used
    return createClient("https://demo.supabase.co", "demo-key")
  }

  console.log("Creating Supabase client with URL:", supabaseUrl)
  return createClient<Database>(supabaseUrl, supabaseKey)
}

export function getServerSideSupabase() {
  return createServerSupabaseClient()
}
