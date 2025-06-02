"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Clock, Star, Ship, Anchor, Users, MapPin, Eye, ShoppingBag, Heart } from "lucide-react"
import { AsosVesselCard } from "@/components/asos-vessel-card"
import { useEffect, useState } from "react"

interface Vessel {
  id: string
  vessel_name: string
  vessel_type: string
  location: string
  daily_rate?: number
  weekly_rate?: number
  monthly_rate?: number
  images?: string[]
  specifications?: {
    length?: number
    crew_capacity?: number
    tonnage?: number
    year_built?: number
  }
  availability_status?: string
  rating?: number
  total_reviews?: number
  tags?: string[]
  is_featured?: boolean
  discount_percentage?: number
  features?: string[]
  description?: string
}

// API client
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || ''

const apiClient = {
  async getFeaturedVessels() {
    const response = await fetch(`${API_BASE_URL}/api/vessels?is_featured=true&limit=4`)
    if (!response.ok) {
      throw new Error('Failed to fetch featured vessels')
    }
    return await response.json()
  },

  async getNewArrivals() {
    const response = await fetch(`${API_BASE_URL}/api/vessels?sort_by=newest&limit=2`)
    if (!response.ok) {
      throw new Error('Failed to fetch new arrivals')
    }
    return await response.json()
  },

  async getVesselsOnSale() {
    // For now, just get featured vessels with discount
    const response = await fetch(`${API_BASE_URL}/api/vessels?is_featured=true&limit=10`)
    if (!response.ok) {
      throw new Error('Failed to fetch vessels on sale')
    }
    const vessels = await response.json()
    return vessels.filter((v: Vessel) => v.discount_percentage && v.discount_percentage > 0)
  },

  async seedVessels() {
    const response = await fetch(`${API_BASE_URL}/api/vessels/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to seed vessels')
    }
    return await response.json()
  }
}

export function AsosHome() {
  const [featuredVessels, setFeaturedVessels] = useState<Vessel[]>([])
  const [newArrivals, setNewArrivals] = useState<Vessel[]>([])
  const [onSale, setOnSale] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true)
        
        // Try to fetch data
        let featured = await apiClient.getFeaturedVessels()
        
        // If no data exists, seed the database
        if (featured.length === 0) {
          console.log('No vessels found, seeding database...')
          await apiClient.seedVessels()
          
          // Retry fetching data after seeding
          featured = await apiClient.getFeaturedVessels()
        }
        
        const [newArrivalsData, onSaleData] = await Promise.all([
          apiClient.getNewArrivals(),
          apiClient.getVesselsOnSale()
        ])
        
        setFeaturedVessels(featured)
        setNewArrivals(newArrivalsData)
        setOnSale(onSaleData)
        
      } catch (error) {
        console.error('Error loading home data:', error)
        // Set empty arrays as fallback
        setFeaturedVessels([])
        setNewArrivals([])
        setOnSale([])
      } finally {
        setLoading(false)
      }
    }
    
    loadHomeData()
  }, [])

  return (
    <div className="flex-1">
      {/* Hero Section - ASOS Style */}
      <section className="relative w-full h-[80vh] min-h-[700px] bg-gradient-to-br from-primary via-primary-light to-secondary">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1568347877321-f8935c7dc5a3"
          alt="Modern offshore vessel"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="container text-center text-white space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge className="bg-accent text-white text-sm px-4 py-2 mb-4">
                  NEW MARITIME SEASON
                </Badge>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                  Ship Your
                </h1>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-accent">
                  Operations
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                Discover the latest offshore support vessels. From PSVs to AHTS—find your perfect maritime match.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent-dark text-white px-8 py-4 text-lg">
                <Link href="/marketplace">
                  Shop Vessels Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Stats - ASOS Style */}
        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-white">
              <div>
                <div className="text-2xl md:text-3xl font-bold">500+</div>
                <div className="text-sm text-gray-300">Verified Vessels</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">24/7</div>
                <div className="text-sm text-gray-300">Maritime Support</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">50+</div>
                <div className="text-sm text-gray-300">Global Locations</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">4.9★</div>
                <div className="text-sm text-gray-300">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals - ASOS Style */}
      <section className="w-full py-12 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-6 w-6 text-accent" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                New Arrivals
              </h2>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                Latest Listings
              </Badge>
            </div>
            <Button asChild variant="outline">
              <Link href="/marketplace?sort=newest">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.slice(0, 2).map((vessel) => (
                <AsosVesselCard key={vessel.id} vessel={vessel} />
              ))}
              
              {/* New Arrivals CTA Card */}
              <Card className="border-2 border-dashed border-gray-300 hover:border-accent transition-colors cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">See All New Vessels</h3>
                  <p className="text-sm text-gray-600 mb-4">Discover the latest additions to our fleet</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/marketplace?sort_by=newest">Browse All</Link>
                  </Button>
                </CardContent>
              </Card>
              
              {/* Fill remaining slots if we have more featured vessels */}
              {featuredVessels.slice(0, 1).map((vessel) => (
                <AsosVesselCard key={`featured-${vessel.id}`} vessel={vessel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories - ASOS Style */}
      <section className="w-full py-12 bg-gray-50">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Shop by Vessel Type
            </h2>
            <p className="text-gray-600">Find the perfect vessel for your operation</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "PSV", fullName: "Platform Supply", icon: Ship, count: 120 },
              { name: "AHTS", fullName: "Anchor Handling", icon: Anchor, count: 85 },
              { name: "Crew", fullName: "Crew Transfer", icon: Users, count: 95 },
              { name: "Construction", fullName: "Construction", icon: Ship, count: 45 },
              { name: "Dive", fullName: "Dive Support", icon: Ship, count: 35 },
              { name: "Wind", fullName: "Wind Farm", icon: Ship, count: 28 }
            ].map((category) => {
              const Icon = category.icon
              return (
                <Link
                  key={category.name}
                  href={`/marketplace?vessel_type=${encodeURIComponent(category.fullName)}`}
                  className="group"
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/10 transition-colors">
                        <Icon className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{category.fullName}</p>
                      <Badge variant="secondary" className="text-xs">
                        {category.count} vessels
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Deals - ASOS Style */}
      <section className="w-full py-12 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Star className="h-6 w-6 text-accent" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Featured Deals
              </h2>
              <Badge className="bg-red-500 text-white">
                Limited Time
              </Badge>
            </div>
            <Button asChild variant="outline">
              <Link href="/marketplace?is_featured=true">
                View All Deals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {onSale.length > 0 ? (
                onSale.slice(0, 2).map((vessel) => (
                  <AsosVesselCard key={vessel.id} vessel={vessel} />
                ))
              ) : (
                featuredVessels.slice(0, 2).map((vessel) => (
                  <AsosVesselCard key={vessel.id} vessel={vessel} />
                ))
              )}
              
              {/* Fill with featured vessels if available */}
              {featuredVessels.slice(2, 4).map((vessel) => (
                <AsosVesselCard key={`featured-deals-${vessel.id}`} vessel={vessel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Now - ASOS Style */}
      <section className="w-full py-12 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-6 w-6" />
              <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
            </div>
            <p className="text-gray-200">What maritime professionals are booking this week</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">AHTS Vessels</div>
              <p className="text-gray-200 mb-4">High demand for anchor handling operations in the North Sea</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/marketplace?vessel_type=Anchor Handling Tug Supply">Shop AHTS</Link>
              </Button>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Wind Farm Support</div>
              <p className="text-gray-200 mb-4">Growing demand for offshore wind installation vessels</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/marketplace?vessel_type=Wind Farm Support Vessel">Shop Wind Support</Link>
              </Button>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Fast Crew Transfer</div>
              <p className="text-gray-200 mb-4">High-speed crew boats for efficient personnel transport</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/marketplace?vessel_type=Crew Transfer Vessel">Shop Crew Boats</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup - ASOS Style */}
      <section className="w-full py-12 bg-white border-t">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Stay Updated on New Vessels
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to know about new vessel listings, special deals, and maritime market insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button className="bg-accent hover:bg-accent-dark text-white px-6">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Join 10,000+ maritime professionals. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}