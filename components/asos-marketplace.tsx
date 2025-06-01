"use client"

import { useState, useEffect } from "react"
import { Filter, Grid, List, SlidersHorizontal, Search, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AsosVesselCard } from "@/components/asos-vessel-card"
import { RecentlyViewedSection } from "@/components/recently-viewed-section"

// Mock vessel data - In a real app, this would come from your API
const mockVessels = [
  {
    id: "1",
    vessel_name: "Ocean Pioneer PSV",
    vessel_type: "Platform Supply Vessel",
    location: "Aberdeen, Scotland",
    daily_rate: 15000,
    weekly_rate: 98000,
    monthly_rate: 420000,
    images: ["/images/psv-1.jpg", "/images/psv-1-2.jpg"],
    specifications: {
      length: 76,
      crew_capacity: 28,
      tonnage: 3200,
      year_built: 2018,
      deck_space: 650,
      fuel_capacity: 1200
    },
    availability_status: "Available",
    rating: 4.8,
    total_reviews: 42,
    tags: ["DP2", "Offshore", "North Sea"],
    is_featured: true,
    features: ["Dynamic Positioning", "ROV Support", "Crane Capability", "Mud Tanks"],
    description: "Modern PSV with excellent safety record and experienced crew."
  },
  {
    id: "2",
    vessel_name: "Atlantic Anchor AHTS",
    vessel_type: "Anchor Handling Tug Supply",
    location: "Houston, Texas",
    daily_rate: 22000,
    weekly_rate: 140000,
    monthly_rate: 600000,
    images: ["/images/ahts-1.jpg"],
    specifications: {
      length: 89,
      crew_capacity: 35,
      tonnage: 4500,
      year_built: 2020,
      deck_space: 800
    },
    availability_status: "Limited",
    rating: 4.9,
    total_reviews: 38,
    tags: ["DP3", "Heavy Lifting", "Gulf of Mexico"],
    features: ["Advanced DP System", "Heavy Anchor Handling", "Towing Capability"],
    description: "High-spec AHTS vessel perfect for demanding offshore operations."
  },
  {
    id: "3",
    vessel_name: "Nordic Crew Boat",
    vessel_type: "Crew Transfer Vessel",
    location: "Stavanger, Norway",
    daily_rate: 8500,
    weekly_rate: 52000,
    monthly_rate: 220000,
    images: ["/images/crew-1.jpg"],
    specifications: {
      length: 42,
      crew_capacity: 60,
      tonnage: 450,
      year_built: 2019
    },
    availability_status: "Available",
    rating: 4.6,
    total_reviews: 29,
    tags: ["High Speed", "Passenger", "North Sea"],
    features: ["High Speed Transfer", "Weather Protection", "Helipad"],
    description: "Fast and efficient crew transfer vessel for North Sea operations."
  },
  {
    id: "4",
    vessel_name: "Deep Sea Constructor",
    vessel_type: "Construction Support Vessel",
    location: "Singapore",
    daily_rate: 35000,
    weekly_rate: 230000,
    monthly_rate: 980000,
    images: ["/images/csv-1.jpg"],
    specifications: {
      length: 145,
      crew_capacity: 120,
      tonnage: 12000,
      year_built: 2017,
      deck_space: 2400
    },
    availability_status: "Available",
    rating: 4.9,
    total_reviews: 56,
    tags: ["DP3", "Heavy Lift", "Construction"],
    is_featured: true,
    discount_percentage: 15,
    features: ["Heavy Lift Crane", "ROV Support", "Diving Support", "Large Deck"],
    description: "Specialized construction vessel for complex offshore projects."
  },
  {
    id: "5",
    vessel_name: "Wind Farm Support",
    vessel_type: "Wind Farm Support Vessel",
    location: "Amsterdam, Netherlands",
    daily_rate: 18000,
    weekly_rate: 115000,
    monthly_rate: 490000,
    images: ["/images/wfsv-1.jpg"],
    specifications: {
      length: 78,
      crew_capacity: 40,
      tonnage: 3800,
      year_built: 2021
    },
    availability_status: "Available",
    rating: 4.7,
    total_reviews: 23,
    tags: ["DP2", "Wind Farm", "Green Energy"],
    features: ["Offshore Wind Support", "Walk-to-Work", "DP System"],
    description: "Modern vessel designed specifically for offshore wind operations."
  },
  {
    id: "6",
    vessel_name: "Subsea Explorer",
    vessel_type: "Dive Support Vessel",
    location: "Rio de Janeiro, Brazil",
    daily_rate: 28000,
    weekly_rate: 180000,
    monthly_rate: 770000,
    images: ["/images/dsv-1.jpg"],
    specifications: {
      length: 95,
      crew_capacity: 80,
      tonnage: 5200,
      year_built: 2016
    },
    availability_status: "Available",
    rating: 4.8,
    total_reviews: 44,
    tags: ["DP3", "Saturation Diving", "ROV"],
    features: ["Saturation Diving", "ROV Operations", "Hyperbaric Chamber"],
    description: "Advanced dive support vessel for deep water operations."
  }
]

const vesselTypes = [
  "Platform Supply Vessel",
  "Anchor Handling Tug Supply", 
  "Crew Transfer Vessel",
  "Construction Support Vessel",
  "Wind Farm Support Vessel",
  "Dive Support Vessel"
]

const locations = [
  "Aberdeen, Scotland",
  "Houston, Texas", 
  "Stavanger, Norway",
  "Singapore",
  "Amsterdam, Netherlands",
  "Rio de Janeiro, Brazil"
]

const features = [
  "Dynamic Positioning",
  "ROV Support", 
  "Crane Capability",
  "Heavy Lifting",
  "High Speed",
  "Weather Protection",
  "Diving Support"
]

export function AsosMarketplace() {
  const [vessels, setVessels] = useState(mockVessels)
  const [filteredVessels, setFilteredVessels] = useState(mockVessels)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [yearRange, setYearRange] = useState([2010, 2024])
  const [availabilityFilter, setAvailabilityFilter] = useState("")

  // Apply filters
  useEffect(() => {
    let filtered = vessels

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(vessel =>
        vessel.vessel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vessel.vessel_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vessel.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vessel.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(vessel => selectedTypes.includes(vessel.vessel_type))
    }

    // Location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(vessel => selectedLocations.includes(vessel.location))
    }

    // Features filter
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter(vessel =>
        vessel.features?.some(feature => selectedFeatures.includes(feature))
      )
    }

    // Price filter
    if (priceRange[0] > 0 || priceRange[1] < 50000) {
      filtered = filtered.filter(vessel =>
        vessel.daily_rate &&
        vessel.daily_rate >= priceRange[0] &&
        vessel.daily_rate <= priceRange[1]
      )
    }

    // Year filter
    if (yearRange[0] > 2010 || yearRange[1] < 2024) {
      filtered = filtered.filter(vessel =>
        vessel.specifications?.year_built &&
        vessel.specifications.year_built >= yearRange[0] &&
        vessel.specifications.year_built <= yearRange[1]
      )
    }

    // Availability filter
    if (availabilityFilter) {
      filtered = filtered.filter(vessel => vessel.availability_status === availabilityFilter)
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.daily_rate || 0) - (b.daily_rate || 0))
        break
      case "price-high":
        filtered.sort((a, b) => (b.daily_rate || 0) - (a.daily_rate || 0))
        break
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "newest":
        filtered.sort((a, b) => (b.specifications?.year_built || 0) - (a.specifications?.year_built || 0))
        break
      default: // featured
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1
          if (!a.is_featured && b.is_featured) return 1
          return (b.rating || 0) - (a.rating || 0)
        })
    }

    setFilteredVessels(filtered)
  }, [vessels, searchQuery, selectedTypes, selectedLocations, selectedFeatures, priceRange, yearRange, availabilityFilter, sortBy])

  const clearAllFilters = () => {
    setSelectedTypes([])
    setSelectedLocations([])
    setSelectedFeatures([])
    setPriceRange([0, 50000])
    setYearRange([2010, 2024])
    setAvailabilityFilter("")
    setSearchQuery("")
  }

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vessels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      {/* Vessel Type */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left font-medium">
          Vessel Type
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {vesselTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTypes([...selectedTypes, type])
                  } else {
                    setSelectedTypes(selectedTypes.filter(t => t !== type))
                  }
                }}
              />
              <label htmlFor={type} className="text-sm text-gray-700">
                {type}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Location */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left font-medium">
          Location
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={location}
                checked={selectedLocations.includes(location)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedLocations([...selectedLocations, location])
                  } else {
                    setSelectedLocations(selectedLocations.filter(l => l !== location))
                  }
                }}
              />
              <label htmlFor={location} className="text-sm text-gray-700">
                {location}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left font-medium">
          Daily Rate
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={50000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Year Built */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left font-medium">
          Year Built
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <Slider
            value={yearRange}
            onValueChange={setYearRange}
            max={2024}
            min={2010}
            step={1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{yearRange[0]}</span>
            <span>{yearRange[1]}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Availability */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left font-medium">
          Availability
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All vessels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All vessels</SelectItem>
              <SelectItem value="Available">Available Now</SelectItem>
              <SelectItem value="Limited">Limited Availability</SelectItem>
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Features */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left font-medium">
          Features
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={selectedFeatures.includes(feature)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedFeatures([...selectedFeatures, feature])
                  } else {
                    setSelectedFeatures(selectedFeatures.filter(f => f !== feature))
                  }
                }}
              />
              <label htmlFor={feature} className="text-sm text-gray-700">
                {feature}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Offshore Support Vessels</h1>
          <p className="text-gray-600">Find the perfect vessel for your maritime operations</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Mobile Filter Button */}
            <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <FilterSection />
                </div>
              </SheetContent>
            </Sheet>

            <div className="text-sm text-gray-600">
              {filteredVessels.length} vessels found
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="hidden md:flex items-center space-x-1 border rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg border p-6">
              <FilterSection />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            {(selectedTypes.length > 0 || selectedLocations.length > 0 || selectedFeatures.length > 0 || searchQuery) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    Search: {searchQuery}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {selectedTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="flex items-center gap-2">
                    {type}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedTypes(selectedTypes.filter(t => t !== type))}
                    />
                  </Badge>
                ))}
                {selectedLocations.map((location) => (
                  <Badge key={location} variant="secondary" className="flex items-center gap-2">
                    {location}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedLocations(selectedLocations.filter(l => l !== location))}
                    />
                  </Badge>
                ))}
                {selectedFeatures.map((feature) => (
                  <Badge key={feature} variant="secondary" className="flex items-center gap-2">
                    {feature}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedFeatures(selectedFeatures.filter(f => f !== feature))}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Vessel Grid */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredVessels.map((vessel) => (
                <AsosVesselCard key={vessel.id} vessel={vessel} />
              ))}
            </div>

            {/* No Results */}
            {filteredVessels.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No vessels found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Section */}
        <div className="mt-12">
          <RecentlyViewedSection />
        </div>
      </div>
    </div>
  )
}