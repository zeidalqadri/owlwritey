"use client"

import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext"
import { AsosVesselCard } from "@/components/asos-vessel-card"
import { Clock } from "lucide-react"

export function RecentlyViewedSection() {
  const { getRecentlyViewed } = useRecentlyViewed()
  const recentlyViewed = getRecentlyViewed()

  if (recentlyViewed.length === 0) {
    return null
  }

  // Convert recently viewed items to vessel format for the card
  const recentVessels = recentlyViewed.map(item => ({
    id: item.id,
    vessel_name: item.vessel_name,
    vessel_type: item.vessel_type,
    location: item.location,
    daily_rate: item.daily_rate,
    images: ["/images/vessel-placeholder.jpg"],
    availability_status: "Available"
  }))

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center mb-6">
        <Clock className="w-5 h-5 text-gray-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Recently Viewed</h2>
        <span className="ml-2 text-sm text-gray-500">({recentlyViewed.length})</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recentVessels.slice(0, 4).map((vessel) => (
          <AsosVesselCard key={vessel.id} vessel={vessel} className="h-auto" />
        ))}
      </div>
    </div>
  )
}