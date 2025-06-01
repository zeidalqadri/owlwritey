import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getVesselById } from "@/app/actions/vessel-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Users, 
  Anchor, 
  Ruler, 
  Shield, 
  Calendar,
  Heart,
  Share,
  Flag,
  CheckCircle,
  Wifi,
  Zap,
  Ship,
  Phone,
  MessageCircle,
  Award
} from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const vessel = await getVesselById(id)
    
    if (!vessel) {
      return {
        title: "OSV Not Found | marimar",
      }
    }

    return {
      title: `${vessel.vessel_name} | OSV Marketplace | marimar`,
      description: `Charter the ${vessel.vessel_name}, a ${vessel.vessel_type} offshore support vessel located in ${vessel.location}`,
    }
  } catch (error) {
    return {
      title: "OSV Details | marimar",
    }
  }
}

export default async function VesselDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const vessel = await getVesselById(id)

    if (!vessel) {
      notFound()
    }

    // Mock data for Airbnb-style features
    const vesselImages = [
      "https://images.pexels.com/photos/14828204/pexels-photo-14828204.jpeg",
      "https://images.pexels.com/photos/3197704/pexels-photo-3197704.jpeg",
      "https://images.pexels.com/photos/16169311/pexels-photo-16169311.jpeg",
      "https://images.pexels.com/photos/32300738/pexels-photo-32300738.jpeg",
      "https://images.pexels.com/photos/20285580/pexels-photo-20285580.jpeg"
    ]

    const hostInfo = {
      name: "Maritime Ventures Inc.",
      memberSince: "2019",
      vesselCount: 12,
      rating: 4.9,
      responseRate: 98,
      responseTime: "within an hour"
    }

    const reviews = [
      {
        id: 1,
        author: "John Smith",
        company: "Offshore Solutions Ltd",
        rating: 5,
        date: "December 2024",
        text: "Outstanding vessel and crew. Professional operation throughout our 2-week charter. Highly recommend for AHTS operations.",
        avatar: "JS"
      },
      {
        id: 2,
        author: "Sarah Johnson",
        company: "Deep Sea Operations",
        rating: 5,
        date: "November 2024", 
        text: "Excellent DP capabilities and very responsive crew. Perfect for our subsea installation project.",
        avatar: "SJ"
      }
    ]

    const amenities = [
      { icon: Shield, label: "DP-2 Classification", available: true },
      { icon: Zap, label: "Fire Fighting System", available: true },
      { icon: Anchor, label: "150T Bollard Pull", available: true },
      { icon: Ship, label: "ROV Support", available: true },
      { icon: Wifi, label: "Satellite Internet", available: true },
      { icon: Users, label: "24 POB Capacity", available: true }
    ]

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to marketplace
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vessel.vessel_name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mt-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">4.9</span>
                  <span className="text-gray-500 ml-1">(24 reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{vessel.location}</span>
                </div>
                <Badge variant="secondary">{vessel.vessel_type}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-4 mb-8 h-[400px]">
          <div className="col-span-2 relative rounded-xl overflow-hidden">
            <Image
              src={vesselImages[0]}
              alt={vessel.vessel_name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {vesselImages.slice(1, 5).map((image, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden">
                <Image
                  src={image}
                  alt={`${vessel.vessel_name} view ${index + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About this vessel */}
            <div>
              <h3 className="text-xl font-semibold mb-4">About this vessel</h3>
              <p className="text-gray-700 leading-relaxed">
                {vessel.description}
              </p>
            </div>

            <Separator />

            {/* Vessel specifications */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Vessel specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Ruler className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium">Length Overall</span>
                  </div>
                  <span className="text-2xl font-bold">{vessel.length_overall}m</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium">Personnel</span>
                  </div>
                  <span className="text-2xl font-bold">{vessel.passenger_capacity}</span>
                </div>
                {vessel.bollard_pull && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Anchor className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="font-medium">Bollard Pull</span>
                    </div>
                    <span className="text-2xl font-bold">{vessel.bollard_pull}T</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* What this vessel offers */}
            <div>
              <h3 className="text-xl font-semibold mb-4">What this vessel offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <amenity.icon className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="text-gray-900">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-xl font-semibold">Reviews</h3>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">4.9</span>
                  <span className="text-gray-500 ml-1">• 24 reviews</span>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4 mb-3">
                      <Avatar>
                        <AvatarFallback className="bg-gray-100">{review.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.author}</span>
                          <span className="text-gray-500 text-sm">• {review.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold">${vessel.daily_rate?.toLocaleString()}</span>
                    <span className="text-gray-600">/ day</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input type="date" className="w-full border-0 focus:ring-0 p-0" />
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input type="date" className="w-full border-0 focus:ring-0 p-0" />
                    </div>
                  </div>

                  <Button className="w-full mb-4 h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700">
                    Request to book
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    You won't be charged yet
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in VesselDetailPage:", error)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to marketplace
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Error loading OSV details</h3>
          <p className="mt-1 text-sm text-gray-500">
            There was a problem loading the vessel data. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
