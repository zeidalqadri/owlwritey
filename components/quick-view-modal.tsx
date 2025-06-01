"use client"

import Image from "next/image"
import { X, Heart, ShoppingBag, MapPin, Calendar, Users, Anchor, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useState } from "react"

interface QuickViewModalProps {
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
      deck_space?: number
      fuel_capacity?: number
    }
    availability_status?: string
    rating?: number
    total_reviews?: number
    tags?: string[]
    description?: string
    features?: string[]
  }
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ vessel, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart()
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist()
  const [selectedImage, setSelectedImage] = useState(0)

  const isWishlisted = isInWishlist(vessel.id)
  const images = vessel.images || ["/images/vessel-placeholder.jpg"]

  const handleWishlistToggle = () => {
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

  const handleAddToCart = () => {
    addToCart({
      id: vessel.id,
      vessel_name: vessel.vessel_name,
      vessel_type: vessel.vessel_type,
      daily_rate: vessel.daily_rate,
      weekly_rate: vessel.weekly_rate,
      monthly_rate: vessel.monthly_rate,
      location: vessel.location
    })
    onClose()
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-square relative bg-gray-100">
              <Image
                src={images[selectedImage]}
                alt={vessel.vessel_name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === selectedImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="p-4 flex space-x-2 overflow-x-auto">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                      index === selectedImage ? 'border-accent' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${vessel.vessel_name} view ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{vessel.vessel_name}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <Badge variant="secondary">{vessel.vessel_type}</Badge>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {vessel.location}
                    </div>
                    {vessel.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {vessel.rating.toFixed(1)} ({vessel.total_reviews} reviews)
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6">
              {/* Availability */}
              {vessel.availability_status && (
                <div className="mb-4">
                  <Badge 
                    variant="outline" 
                    className={getAvailabilityColor(vessel.availability_status)}
                  >
                    {vessel.availability_status}
                  </Badge>
                </div>
              )}

              {/* Pricing */}
              <div className="mb-6">
                <div className="space-y-1">
                  {vessel.daily_rate && (
                    <div className="text-2xl font-bold text-gray-900">
                      ${vessel.daily_rate.toLocaleString()}
                      <span className="text-lg font-normal text-gray-600">/day</span>
                    </div>
                  )}
                  <div className="flex space-x-4 text-sm text-gray-600">
                    {vessel.weekly_rate && (
                      <span>${vessel.weekly_rate.toLocaleString()}/week</span>
                    )}
                    {vessel.monthly_rate && (
                      <span>${vessel.monthly_rate.toLocaleString()}/month</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              {vessel.specifications && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {vessel.specifications.length && (
                      <div className="flex items-center">
                        <Anchor className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Length:</span>
                        <span className="ml-1 font-medium">{vessel.specifications.length}m</span>
                      </div>
                    )}
                    {vessel.specifications.crew_capacity && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Crew:</span>
                        <span className="ml-1 font-medium">{vessel.specifications.crew_capacity}</span>
                      </div>
                    )}
                    {vessel.specifications.tonnage && (
                      <div className="flex items-center">
                        <span className="text-gray-600">Tonnage:</span>
                        <span className="ml-1 font-medium">{vessel.specifications.tonnage}t</span>
                      </div>
                    )}
                    {vessel.specifications.year_built && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Built:</span>
                        <span className="ml-1 font-medium">{vessel.specifications.year_built}</span>
                      </div>
                    )}
                    {vessel.specifications.deck_space && (
                      <div className="flex items-center">
                        <span className="text-gray-600">Deck:</span>
                        <span className="ml-1 font-medium">{vessel.specifications.deck_space}m²</span>
                      </div>
                    )}
                    {vessel.specifications.fuel_capacity && (
                      <div className="flex items-center">
                        <span className="text-gray-600">Fuel:</span>
                        <span className="ml-1 font-medium">{vessel.specifications.fuel_capacity}L</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Features */}
              {vessel.features && vessel.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {vessel.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {vessel.tags && vessel.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {vessel.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {vessel.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {vessel.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t bg-gray-50">
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <Button
                    onClick={handleWishlistToggle}
                    variant="outline"
                    className="flex-1"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    {isWishlisted ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-accent hover:bg-accent-dark text-white"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    window.location.href = `/marketplace/${vessel.id}`
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}