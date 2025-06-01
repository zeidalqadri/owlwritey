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
    deck_space?: number
    fuel_capacity?: number
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
  async getVessels(filters: any = {}) {
    const params = new URLSearchParams()
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          params.append(key, filters[key].join(','))
        } else {
          params.append(key, filters[key].toString())
        }
      }
    })
    
    const response = await fetch(`${API_BASE_URL}/api/vessels?${params.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch vessels')
    }
    return await response.json()
  },

  async getVesselTypes() {
    const response = await fetch(`${API_BASE_URL}/api/vessels/types/list`)
    if (!response.ok) {
      throw new Error('Failed to fetch vessel types')
    }
    const data = await response.json()
    return data.vessel_types || []
  },

  async getLocations() {
    const response = await fetch(`${API_BASE_URL}/api/vessels/locations/list`)
    if (!response.ok) {
      throw new Error('Failed to fetch locations')
    }
    const data = await response.json()
    return data.locations || []
  },

  async getFeatures() {
    const response = await fetch(`${API_BASE_URL}/api/vessels/features/list`)
    if (!response.ok) {
      throw new Error('Failed to fetch features')
    }
    const data = await response.json()
    return data.features || []
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

export function AsosMarketplace() {
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  
  // Available options from API
  const [vesselTypes, setVesselTypes] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([])
  
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [yearRange, setYearRange] = useState([2010, 2024])
  const [availabilityFilter, setAvailabilityFilter] = useState("")

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        
        // Fetch vessel types, locations, and features in parallel
        const [vesselTypesData, locationsData, featuresData] = await Promise.all([
          apiClient.getVesselTypes(),
          apiClient.getLocations(),
          apiClient.getFeatures()
        ])
        
        setVesselTypes(vesselTypesData)
        setLocations(locationsData)
        setFeatures(featuresData)
        
        // If no data exists, seed the database
        if (vesselTypesData.length === 0) {
          console.log('No vessels found, seeding database...')
          await apiClient.seedVessels()
          
          // Refetch data after seeding
          const [newVesselTypesData, newLocationsData, newFeaturesData] = await Promise.all([
            apiClient.getVesselTypes(),
            apiClient.getLocations(),
            apiClient.getFeatures()
          ])
          
          setVesselTypes(newVesselTypesData)
          setLocations(newLocationsData)
          setFeatures(newFeaturesData)
        }
        
        // Load vessels
        await loadVessels()
        
      } catch (err) {
        console.error('Error loading initial data:', err)
        setError('Failed to load marketplace data')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  // Load vessels with current filters
  const loadVessels = async () => {
    try {
      const filters: any = {
        sort_by: sortBy
      }
      
      if (searchQuery) filters.search = searchQuery
      if (selectedTypes.length > 0) filters.vessel_type = selectedTypes[0] // API expects single type
      if (selectedLocations.length > 0) filters.location = selectedLocations[0] // API expects single location
      if (selectedFeatures.length > 0) filters.features = selectedFeatures
      if (priceRange[0] > 0) filters.min_daily_rate = priceRange[0]
      if (priceRange[1] < 50000) filters.max_daily_rate = priceRange[1]
      if (yearRange[0] > 2010) filters.min_year_built = yearRange[0]
      if (yearRange[1] < 2024) filters.max_year_built = yearRange[1]
      if (availabilityFilter) filters.availability_status = availabilityFilter
      
      const vesselsData = await apiClient.getVessels(filters)
      setVessels(vesselsData)
      setFilteredVessels(vesselsData)
      
    } catch (err) {
      console.error('Error loading vessels:', err)
      setError('Failed to load vessels')
    }
  }

  // Reload vessels when filters change
  useEffect(() => {
    if (!loading) {
      loadVessels()
    }
  }, [searchQuery, selectedTypes, selectedLocations, selectedFeatures, priceRange, yearRange, availabilityFilter, sortBy])

  const clearAllFilters = () => {
    setSelectedTypes([])
    setSelectedLocations([])
    setSelectedFeatures([])
    setPriceRange([0, 50000])
    setYearRange([2010, 2024])
    setAvailabilityFilter("")
    setSearchQuery("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vessels...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
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