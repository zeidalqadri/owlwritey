import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ship, Anchor, Users, MapPin, Ruler, Star, Calendar, Shield } from "lucide-react"
import type { Vessel } from "@/app/actions/vessel-actions"

interface VesselGridProps {
  vessels: Vessel[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-50 text-green-700 border-green-200"
    case "Maintenance":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const vesselImages = [
  "https://images.pexels.com/photos/14828204/pexels-photo-14828204.jpeg",
  "https://images.pexels.com/photos/3197704/pexels-photo-3197704.jpeg",
  "https://images.pexels.com/photos/16169311/pexels-photo-16169311.jpeg",
  "https://images.pexels.com/photos/32300738/pexels-photo-32300738.jpeg",
  "https://images.pexels.com/photos/20285580/pexels-photo-20285580.jpeg",
  "https://images.pexels.com/photos/32253344/pexels-photo-32253344.jpeg",
  "https://images.pexels.com/photos/3808621/pexels-photo-3808621.jpeg",
  "https://images.unsplash.com/photo-1609337231803-2adad48ea1d1",
  "https://images.unsplash.com/photo-1694396130851-ea9554695b62"
]

// Update the VesselGrid component to display OSV-specific information in Airbnb style
export function VesselGrid({ vessels }: VesselGridProps) {
  if (!vessels || vessels.length === 0) {
    return (
      <div className="text-center py-20">
        <Ship className="mx-auto h-16 w-16 text-gray-300 mb-6" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No vessels found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Try adjusting your filters or check back later for new listings. We're adding new vessels every day.
        </p>
        <Button asChild className="mt-6">
          <Link href="/marketplace">Clear Filters</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {vessels.map((vessel, index) => {
        const imageUrl = vesselImages[index % vesselImages.length]
        const rating = (4.5 + Math.random() * 0.4).toFixed(1) // Generate realistic ratings
        const reviews = Math.floor(Math.random() * 50) + 15 // Generate review counts
        
        return (
          <Link key={vessel.id} href={`/marketplace/${vessel.id}`} className="group block">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={vessel.vessel_name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Top overlay badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <Badge variant="secondary" className="bg-white/90 text-gray-800 font-semibold">
                    {vessel.vessel_type}
                  </Badge>
                  <div className="flex items-center space-x-1 bg-white/90 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-800">{rating}</span>
                    <span className="text-sm text-gray-600">({reviews})</span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute bottom-4 left-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vessel.status)}`}>
                    {vessel.status === 'Active' ? 'Available Now' : vessel.status}
                  </div>
                </div>

                {/* Instant Book badge */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Instant Book
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {vessel.vessel_name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{vessel.location}</span>
                    </div>
                  </div>

                  {/* Key specifications */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{vessel.length_overall}m LOA</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{vessel.passenger_capacity} crew</span>
                    </div>
                    {vessel.bollard_pull && (
                      <div className="flex items-center text-gray-600">
                        <Anchor className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{vessel.bollard_pull}T pull</span>
                      </div>
                    )}
                    {vessel.dynamic_positioning && vessel.dynamic_positioning !== 'No DP' && (
                      <div className="flex items-center text-gray-600">
                        <Shield className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{vessel.dynamic_positioning}</span>
                      </div>
                    )}
                  </div>

                  {/* Features tags */}
                  {vessel.features && vessel.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {vessel.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {vessel.features.length > 3 && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          +{vessel.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Pricing and CTA */}
                  <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900">
                          ${vessel.daily_rate?.toLocaleString() || 'POA'}
                        </span>
                        {vessel.daily_rate && (
                          <span className="text-gray-600 ml-1"> / day</span>
                        )}
                      </div>
                      {vessel.weekly_rate && (
                        <div className="text-sm text-gray-500">
                          ${vessel.weekly_rate.toLocaleString()} / week
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
