import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Temporarily disable auth redirects for development
  return NextResponse.next()

  // Original auth logic (commented out)
  /*
  const path = request.nextUrl.pathname
  
  // Check if the path is dashboard
  if (path.startsWith("/dashboard")) {
    // Get the session from the request
    const session = request.cookies.get("session")?.value
    
    // If there is no session, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }
  
  return NextResponse.next()
  */
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*"],
}
