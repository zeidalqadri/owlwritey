"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Ship, Filter, X, MapPin, Calendar, Anchor, Users, Ruler, Gauge } from "lucide-react"

interface VesselFiltersProps {
  vesselTypes: string[]
  locations: string[]
  selectedType?: string
  selectedLocation?: string
  selectedMinCapacity?: number
  selectedMaxRate?: number
  selectedDPRating?: string
  selectedMinBollardPull?: number
  selectedMinDeckArea?: number
}

export function VesselFilters({
  vesselTypes,
  locations,
  selectedType,
  selectedLocation,
  selectedMinCapacity,
  selectedMaxRate,
  selectedDPRating,
  selectedMinBollardPull,
  selectedMinDeckArea,
}: VesselFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [type, setType] = useState<string | undefined>(selectedType)
  const [location, setLocation] = useState<string | undefined>(selectedLocation)
  const [minCapacity, setMinCapacity] = useState<number | undefined>(selectedMinCapacity)
  const [maxRate, setMaxRate] = useState<number | undefined>(selectedMaxRate)
  const [dpRating, setDPRating] = useState<string | undefined>(selectedDPRating)
  const [minBollardPull, setMinBollardPull] = useState<number | undefined>(selectedMinBollardPull)
  const [minDeckArea, setMinDeckArea] = useState<number | undefined>(selectedMinDeckArea)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<number[]>([0, maxRate || 50000])

  // Count active filters
  const activeFiltersCount = [type, location, minCapacity, maxRate, dpRating, minBollardPull, minDeckArea]
    .filter(Boolean).length

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)

    if (type) {
      params.set("type", type)
    } else {
      params.delete("type")
    }

    if (location) {
      params.set("location", location)
    } else {
      params.delete("location")
    }

    if (minCapacity) {
      params.set("minCapacity", minCapacity.toString())
    } else {
      params.delete("minCapacity")
    }

    if (maxRate) {
      params.set("maxRate", maxRate.toString())
    } else {
      params.delete("maxRate")
    }

    // Add OSV-specific filters
    if (dpRating) {
      params.set("dpRating", dpRating)
    } else {
      params.delete("dpRating")
    }

    if (minBollardPull) {
      params.set("minBollardPull", minBollardPull.toString())
    } else {
      params.delete("minBollardPull")
    }

    if (minDeckArea) {
      params.set("minDeckArea", minDeckArea.toString())
    } else {
      params.delete("minDeckArea")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Reset filters
  const resetFilters = () => {
    setType(undefined)
    setLocation(undefined)
    setMinCapacity(undefined)
    setMaxRate(undefined)
    setDPRating(undefined)
    setMinBollardPull(undefined)
    setMinDeckArea(undefined)
    setPriceRange([0, 50000])
    router.push(pathname)
  }

  // Vessel type options with icons
  const vesselTypeOptions = [
    { value: "AHTS", label: "AHTS Vessels", icon: Anchor, description: "Anchor handling & towing" },
    { value: "PSV", label: "Platform Supply", icon: Ship, description: "Supply & logistics" },
    { value: "Crew Boat", label: "Crew Boats", icon: Users, description: "Personnel transfer" },
    { value: "ROV Support", label: "ROV Support", icon: Gauge, description: "Subsea operations" },
    { value: "Construction", label: "Construction", icon: Ruler, description: "Heavy lifting & construction" },
  ]

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-blue-600 hover:text-blue-700">
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vessel Type - Visual Grid */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center">
              <Ship className="w-4 h-4 mr-2" />
              Vessel Type
            </Label>
            <div className="grid grid-cols-1 gap-2">
              <div 
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  !type || type === 'all' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setType(undefined)}
              >
                <div className="font-medium text-sm">All Types</div>
                <div className="text-xs text-gray-600">Browse all vessels</div>
              </div>
              {vesselTypeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      type === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setType(option.value)}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2 text-gray-600" />
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </Label>
            <Select value={location || ""} onValueChange={(value) => setLocation(value || undefined)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">
              Daily Rate Range
            </Label>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={50000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>${priceRange[0].toLocaleString()}</span>
                <span>${priceRange[1].toLocaleString()}</span>
              </div>
            </div>
            <Input
              type="number"
              placeholder="Max daily rate"
              value={maxRate || ""}
              onChange={(e) => setMaxRate(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
              className="h-11"
            />
          </div>

          <Separator />

          {/* Basic Specifications */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700">
              Basic Requirements
            </Label>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="min-capacity" className="text-sm text-gray-600 flex items-center mb-1">
                  <Users className="w-4 h-4 mr-1" />
                  Minimum Crew Capacity
                </Label>
                <Input
                  id="min-capacity"
                  type="number"
                  min="0"
                  value={minCapacity || ""}
                  onChange={(e) => setMinCapacity(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                  placeholder="Any capacity"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="advanced-filters"
              checked={showAdvancedFilters}
              onCheckedChange={(checked) => setShowAdvancedFilters(!!checked)}
            />
            <label htmlFor="advanced-filters" className="text-sm font-medium cursor-pointer">
              Show advanced OSV specifications
            </label>
          </div>

          {showAdvancedFilters && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Advanced Specifications
                </Label>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="dp-rating" className="text-sm text-gray-600 mb-1 block">
                      Dynamic Positioning Rating
                    </Label>
                    <Select value={dpRating || ""} onValueChange={(value) => setDPRating(value || undefined)}>
                      <SelectTrigger id="dp-rating" className="h-11">
                        <SelectValue placeholder="Any DP Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any DP Rating</SelectItem>
                        <SelectItem value="DP-1">DP-1</SelectItem>
                        <SelectItem value="DP-2">DP-2</SelectItem>
                        <SelectItem value="DP-3">DP-3</SelectItem>
                        <SelectItem value="No DP">No DP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="min-bollard-pull" className="text-sm text-gray-600 flex items-center mb-1">
                      <Anchor className="w-4 h-4 mr-1" />
                      Minimum Bollard Pull (Tonnes)
                    </Label>
                    <Input
                      id="min-bollard-pull"
                      type="number"
                      min="0"
                      value={minBollardPull || ""}
                      onChange={(e) => setMinBollardPull(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      placeholder="Any bollard pull"
                      className="h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="min-deck-area" className="text-sm text-gray-600 flex items-center mb-1">
                      <Ruler className="w-4 h-4 mr-1" />
                      Minimum Deck Area (m²)
                    </Label>
                    <Input
                      id="min-deck-area"
                      type="number"
                      min="0"
                      value={minDeckArea || ""}
                      onChange={(e) => setMinDeckArea(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      placeholder="Any deck area"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-4">
            <Button onClick={applyFilters} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              Apply Filters
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={resetFilters} size="lg" className="w-full">
                Clear All Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Popular Searches */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Popular Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              AHTS in Gulf of Mexico
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              PSV North Sea
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              DP-2 Vessels
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
              Crew Boats
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
