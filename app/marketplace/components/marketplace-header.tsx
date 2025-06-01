"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Anchor, Ship, Search, MapPin, Filter, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export function MarketplaceHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('location') || '')
  const [vesselType, setVesselType] = useState(searchParams.get('type') || 'all')

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    
    if (searchTerm) {
      params.set('location', searchTerm)
    } else {
      params.delete('location')
    }
    
    if (vesselType && vesselType !== 'all') {
      params.set('type', vesselType)
    } else {
      params.delete('type')
    }
    
    router.push(`/marketplace?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white rounded-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Find the Perfect Vessel
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              Browse certified offshore support vessels from trusted operators worldwide. 
              Professional crews, transparent pricing, instant booking.
            </p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 text-center mb-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold">{Math.floor(Math.random() * 50) + 30}</div>
                <div className="text-sm text-blue-100">Available Vessels</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-blue-100">Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-blue-100">Completed Charters</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/dashboard/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  My Bookings
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent text-white hover:bg-white/10 border-white">
                <Link href="/dashboard/vessels">
                  <Anchor className="mr-2 h-4 w-4" />
                  List Your Vessel
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Airbnb Style */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 space-y-2">
              <label className="text-sm font-semibold text-gray-700">WHERE</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-semibold text-gray-700">VESSEL TYPE</label>
              <Select value={vesselType} onValueChange={setVesselType}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="AHTS">AHTS Vessels</SelectItem>
                  <SelectItem value="PSV">Platform Supply</SelectItem>
                  <SelectItem value="Crew Boat">Crew Boats</SelectItem>
                  <SelectItem value="ROV Support">ROV Support</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-semibold text-gray-700">WHEN</label>
              <Input
                placeholder="Select dates..."
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                type="date"
              />
            </div>

            <div className="md:col-span-2">
              <Button 
                onClick={handleSearch}
                size="lg" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breadcrumb and quick filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Vessel Marketplace</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Quick filters:</span>
          <Link 
            href="/marketplace?type=AHTS" 
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
          >
            AHTS
          </Link>
          <Link 
            href="/marketplace?type=PSV" 
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
          >
            Supply
          </Link>
          <Link 
            href="/marketplace?location=gulf" 
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
          >
            Gulf of Mexico
          </Link>
          <Link 
            href="/marketplace?location=north sea" 
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
          >
            North Sea
          </Link>
        </div>
      </div>
    </div>
  )
}
