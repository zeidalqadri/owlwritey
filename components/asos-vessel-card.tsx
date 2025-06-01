"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, Eye, Star, MapPin, Calendar, Users, Anchor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext"
import { useState } from "react"
import { QuickViewModal } from "@/components/quick-view-modal"

interface VesselCardProps {
  vessel: {
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
  }
  className?: string
}

export function AsosVesselCard({ vessel, className }: VesselCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist()
  const { addToRecentlyViewed } = useRecentlyViewed()
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isWishlisted = isInWishlist(vessel.id)
  const mainImage = vessel.images?.[0] || "/images/vessel-placeholder.jpg"
  const hasDiscount = vessel.discount_percentage && vessel.discount_percentage > 0

  const handleCardClick = () => {
    addToRecentlyViewed({
      id: vessel.id,
      vessel_name: vessel.vessel_name,
      vessel_type: vessel.vessel_type,
      daily_rate: vessel.daily_rate,
      location: vessel.location
    })
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isWishlisted) {
      removeFromWishlist(vessel.id)
    } else {
      addToWishlist({
        id: vessel.id,
        vessel_name: vessel.vessel_name,
        vessel_type: vessel.vessel_type,
        daily_rate: vessel.daily_rate,
        weekly_rate: vessel.weekly_rate,
        monthly_rate: vessel.monthly_rate,
        location: vessel.location
      })
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addToCart({
      id: vessel.id,
      vessel_name: vessel.vessel_name,
      vessel_type: vessel.vessel_type,
      daily_rate: vessel.daily_rate,
      weekly_rate: vessel.weekly_rate,
      monthly_rate: vessel.monthly_rate,
      location: vessel.location
    })
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsQuickViewOpen(true)
  }

  const getAvailabilityColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'limited':
        return 'bg-yellow-100 text-yellow-800'
      case 'unavailable':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Card 
        className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/marketplace/${vessel.id}`} onClick={handleCardClick}>
          <div className="relative">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <Image
                src={mainImage}
                alt={vessel.vessel_name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Overlay on hover */}
              <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                isHovered ? 'bg-opacity-20' : 'bg-opacity-0'
              }`} />
              
              {/* Featured Badge */}
              {vessel.is_featured && (
                <Badge className="absolute top-3 left-3 bg-accent text-white">
                  Featured
                </Badge>
              )}
              
              {/* Discount Badge */}
              {hasDiscount && (
                <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                  -{vessel.discount_percentage}%
                </Badge>
              )}
              
              {/* Action Buttons */}
              <div className={`absolute top-3 right-3 flex flex-col space-y-2 transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={handleQuickView}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick Add to Cart - Bottom */}
              <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${
                isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}>
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-accent hover:bg-accent-dark text-white"
                  size="sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                      {vessel.vessel_name}
                    </h3>
                    {vessel.rating && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        {vessel.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-600">
                    <Badge variant="secondary" className="mr-2 text-xs py-0">
                      {vessel.vessel_type}
                    </Badge>
                    <MapPin className="w-3 h-3 mr-1" />
                    {vessel.location}
                  </div>
                </div>

                {/* Specifications */}
                {vessel.specifications && (
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    {vessel.specifications.length && (
                      <div className="flex items-center">
                        <Anchor className="w-3 h-3 mr-1" />
                        {vessel.specifications.length}m
                      </div>
                    )}
                    {vessel.specifications.crew_capacity && (
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {vessel.specifications.crew_capacity}
                      </div>
                    )}
                    {vessel.specifications.year_built && (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {vessel.specifications.year_built}
                      </div>
                    )}
                  </div>
                )}

                {/* Availability */}
                {vessel.availability_status && (
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getAvailabilityColor(vessel.availability_status)}`}
                    >
                      {vessel.availability_status}
                    </Badge>
                    {vessel.total_reviews && (
                      <span className="text-xs text-gray-500">
                        ({vessel.total_reviews} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Tags */}
                {vessel.tags && vessel.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {vessel.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs py-0 px-1">
                        {tag}
                      </Badge>
                    ))}
                    {vessel.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{vessel.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Pricing */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      {vessel.daily_rate && (
                        <div className="text-lg font-bold text-gray-900">
                          ${vessel.daily_rate.toLocaleString()}
                          <span className="text-sm font-normal text-gray-600">/day</span>
                        </div>
                      )}
                      {vessel.weekly_rate && (
                        <div className="text-xs text-gray-600">
                          ${vessel.weekly_rate.toLocaleString()}/week
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden group-hover:inline-flex"
                      onClick={handleQuickView}
                    >
                      Quick View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>

      {/* Quick View Modal */}
      <QuickViewModal
        vessel={vessel}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  )
}