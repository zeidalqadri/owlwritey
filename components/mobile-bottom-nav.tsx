"use client"

import { Home, Search, Heart, ShoppingBag, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { getCartItemCount } = useCart()
  const { getWishlistItemCount } = useWishlist()

  const navigationItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/"
    },
    {
      name: "Browse",
      href: "/marketplace",
      icon: Search,
      isActive: pathname.startsWith("/marketplace")
    },
    {
      name: "Saved",
      href: "#",
      icon: Heart,
      isActive: false,
      badge: getWishlistItemCount(),
      onClick: () => {
        // This would trigger the wishlist sidebar
        // For now, we'll just show the marketplace
        window.location.href = "/marketplace"
      }
    },
    {
      name: "Cart",
      href: "#",
      icon: ShoppingBag,
      isActive: false,
      badge: getCartItemCount(),
      onClick: () => {
        // This would trigger the cart sidebar
        // For now, we'll just show the marketplace
        window.location.href = "/marketplace"
      }
    },
    {
      name: "Account",
      href: "/dashboard",
      icon: User,
      isActive: pathname.startsWith("/dashboard")
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow-lg">
      <div className="grid grid-cols-5">
        {navigationItems.map((item) => {
          const Icon = item.icon
          
          if (item.onClick) {
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-2 text-xs relative",
                  item.isActive 
                    ? "text-accent bg-accent/5" 
                    : "text-gray-600 hover:text-accent"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {item.badge && item.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 w-4 text-xs flex items-center justify-center p-0 bg-accent"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="font-medium">{item.name}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 text-xs relative",
                item.isActive 
                  ? "text-accent bg-accent/5" 
                  : "text-gray-600 hover:text-accent"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 text-xs flex items-center justify-center p-0 bg-accent"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}