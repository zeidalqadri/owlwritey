"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, Search, ShoppingBag, Heart, User, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { CartSidebar } from "@/components/cart-sidebar"
import { WishlistSidebar } from "@/components/wishlist-sidebar"

export function AsosHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { getCartItemCount, toggleCart } = useCart()
  const { getWishlistItemCount, toggleWishlist } = useWishlist()

  const isLoggedIn = true // In a real app, this would check the auth state
  const isDashboard = pathname.startsWith("/dashboard")

  // Don't render on dashboard pages
  if (isDashboard) {
    return null
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to marketplace with search query
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const vesselCategories = [
    { name: "Platform Supply Vessels", href: "/marketplace?type=PSV" },
    { name: "Anchor Handling", href: "/marketplace?type=AHTS" },
    { name: "Crew Boats", href: "/marketplace?type=Crew" },
    { name: "Dive Support", href: "/marketplace?type=Dive" },
    { name: "Construction", href: "/marketplace?type=Construction" },
    { name: "Offshore Wind", href: "/marketplace?type=Wind" },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white text-xs py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>🚢 Ship Your Energy Operations Forward</span>
            <span>•</span>
            <span>24/7 Maritime Support</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/help" className="hover:underline">Help</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/about" className="hover:underline">About</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top Section */}
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/marimar-logo.png" alt="marimar logo" width={40} height={40} />
              <span className="text-2xl font-bold text-primary">marimar</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="flex w-full">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search vessels, locations, specifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-24 h-12 text-base border-2 border-gray-200 focus:border-accent"
                  />
                  <div className="absolute right-1 top-1 flex items-center space-x-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // Navigate to AI search page
                        window.location.href = '/marketplace/ai-search'
                      }}
                      className="h-10 px-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                      title="AI-Powered Search"
                    >
                      🧠 AI
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-10 bg-accent hover:bg-accent-dark"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Account */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={toggleWishlist}
              >
                <Heart className="h-5 w-5" />
                {getWishlistItemCount() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center bg-[hsl(var(--wishlist))] hover:bg-[hsl(var(--wishlist))]"
                  >
                    {getWishlistItemCount()}
                  </Badge>
                )}
                <span className="hidden md:inline ml-1">Saved</span>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={toggleCart}
              >
                <ShoppingBag className="h-5 w-5" />
                {getCartItemCount() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center bg-[hsl(var(--cart))] hover:bg-[hsl(var(--cart))]"
                  >
                    {getCartItemCount()}
                  </Badge>
                )}
                <span className="hidden md:inline ml-1">Cart</span>
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-6 py-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={getContextualPlaceholder()}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-12 h-12 text-base border-2 border-gray-200 focus:border-accent"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="absolute right-1 top-1 h-10 bg-accent hover:bg-accent-dark"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>

                    {/* Mobile Categories */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-primary">Categories</h3>
                      {vesselCategories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="block py-2 text-gray-700 hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>

                    {/* Mobile Account */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-primary">Account</h3>
                      <Link
                        href="/dashboard"
                        className="block py-2 text-gray-700 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/orders"
                        className="block py-2 text-gray-700 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="hidden md:block border-t py-3">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                {vesselCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/marketplace"
                  className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-dark transition-colors"
                >
                  Browse All Vessels
                </Link>
                <Link
                  href="/marketplace/ai-search"
                  className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  🧠 AI Search
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Sidebars */}
      <CartSidebar />
      <WishlistSidebar />
    </>
  )
}