import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainHeader } from "@/components/main-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/contexts/CartContext"
import { WishlistProvider } from "@/contexts/WishlistContext"
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "marimar - Offshore Support Vessel Marketplace",
  description: "Charter, operate, and manage offshore support vessels with our comprehensive platform.",
  generator: "Next.js",
  icons: {
    icon: "/images/marimar-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <div className="flex min-h-screen flex-col">
                  <MainHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                  <Toaster />
                </div>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
