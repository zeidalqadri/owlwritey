import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Clock, Star, Ship, Anchor, Users, MapPin, Eye, ShoppingBag, Heart } from "lucide-react"
import { AsosVesselCard } from "@/components/asos-vessel-card"

// Mock featured vessels for ASOS-style showcase
const featuredVessels = [
  {
    id: "1",
    vessel_name: "Ocean Pioneer PSV",
    vessel_type: "Platform Supply Vessel",
    location: "Aberdeen, Scotland",
    daily_rate: 15000,
    weekly_rate: 98000,
    monthly_rate: 420000,
    images: ["https://images.unsplash.com/photo-1568347877321-f8935c7dc5a3"],
    specifications: {
      length: 76,
      crew_capacity: 28,
      tonnage: 3200,
      year_built: 2018
    },
    availability_status: "Available",
    rating: 4.8,
    total_reviews: 42,
    tags: ["DP2", "Offshore", "North Sea"],
    is_featured: true,
    discount_percentage: 15
  },
  {
    id: "2",
    vessel_name: "Atlantic Anchor AHTS",
    vessel_type: "Anchor Handling Tug Supply",
    location: "Houston, Texas",
    daily_rate: 22000,
    images: ["https://images.unsplash.com/photo-1609337231803-2adad48ea1d1"],
    specifications: {
      length: 89,
      crew_capacity: 35,
      year_built: 2020
    },
    availability_status: "Limited",
    rating: 4.9,
    total_reviews: 38,
    tags: ["DP3", "Heavy Lifting"]
  },
  {
    id: "3",
    vessel_name: "Nordic Crew Boat",
    vessel_type: "Crew Transfer Vessel",
    location: "Stavanger, Norway",
    daily_rate: 8500,
    images: ["https://images.unsplash.com/photo-1601311852860-1d8f42381551"],
    specifications: {
      length: 42,
      crew_capacity: 60,
      year_built: 2019
    },
    availability_status: "Available",
    rating: 4.6,
    total_reviews: 29
  },
  {
    id: "4",
    vessel_name: "Deep Sea Constructor",
    vessel_type: "Construction Support Vessel",
    location: "Singapore",
    daily_rate: 35000,
    images: ["https://images.unsplash.com/photo-1568347877321-f8935c7dc5a3"],
    specifications: {
      length: 145,
      crew_capacity: 120,
      year_built: 2017
    },
    availability_status: "Available",
    rating: 4.9,
    total_reviews: 56,
    is_featured: true
  }
]

const newArrivals = featuredVessels.slice(0, 2)
const onSale = featuredVessels.filter(v => v.discount_percentage)

export default function HomePage() {
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
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg">
                <Link href="/marketplace?featured=true">Browse Featured</Link>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((vessel) => (
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
                  <Link href="/marketplace?sort=newest">Browse All</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
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
                  href={`/marketplace?type=${category.name}`}
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
              <Link href="/marketplace?featured=true">
                View All Deals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {onSale.map((vessel) => (
              <AsosVesselCard key={vessel.id} vessel={vessel} />
            ))}
            
            {/* More deals placeholder cards */}
            {featuredVessels.slice(0, 2).map((vessel) => (
              <AsosVesselCard key={`featured-${vessel.id}`} vessel={vessel} />
            ))}
          </div>
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
                <Link href="/marketplace?type=AHTS">Shop AHTS</Link>
              </Button>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Wind Farm Support</div>
              <p className="text-gray-200 mb-4">Growing demand for offshore wind installation vessels</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/marketplace?type=Wind">Shop Wind Support</Link>
              </Button>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Fast Crew Transfer</div>
              <p className="text-gray-200 mb-4">High-speed crew boats for efficient personnel transport</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/marketplace?type=Crew">Shop Crew Boats</Link>
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