"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// CORRECT IMPORT: useTheme should be imported from next-themes
import { useTheme } from "next-themes"
import { RoleIndicator } from "@/components/role-indicator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function MainHeader() {
  const pathname = usePathname()
  // useTheme is now correctly sourced from next-themes
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isLoggedIn = true // In a real app, this would check the auth state
  const isDashboard = pathname.startsWith("/dashboard")

  // Don't render the main header on dashboard pages
  if (isDashboard) {
    return null
  }

  const mainNavItems = [
    {
      title: "Home",
      href: "/",
      active: pathname === "/",
    },
    {
      title: "Marketplace",
      href: "/marketplace",
      active: pathname === "/marketplace" || pathname.startsWith("/marketplace/"),
    },
    {
      title: "About",
      href: "/about",
      active: pathname === "/about",
    },
  ]

  const userNavItems = isLoggedIn
    ? [
        {
          title: "Dashboard",
          href: "/dashboard",
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
        },
        {
          title: "Logout",
          href: "/logout",
        },
      ]
    : [
        {
          title: "Login",
          href: "/login",
        },
        {
          title: "Register",
          href: "/register",
        },
      ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/marimar-logo.png" alt="marimar logo" width={40} height={40} />
            <span className="text-xl font-semibold text-foreground">marimar</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  item.active ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-4">
            {isLoggedIn ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm">Account</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      My Account
                      <RoleIndicator />
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userNavItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>{item.title}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-6 py-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Image src="/images/marimar-logo.png" alt="marimar logo" width={40} height={40} />
                <span className="text-xl font-semibold text-foreground">marimar</span>
              </Link>
              <div className="flex flex-col gap-3">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-base font-medium transition-colors hover:text-primary ${
                      item.active ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {isLoggedIn ? (
                  <>
                    <Button asChild className="w-full">
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                        Account
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="w-full">
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        Register
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                  </>
                )}
              </div>
              <div className="mt-4">
                <RoleIndicator />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
