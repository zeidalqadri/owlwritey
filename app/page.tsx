import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Ship, Shield, Users, MapPin, Search, Star, CheckCircle, Anchor, Gauge } from "lucide-react"
import { getFeaturedVessels } from "@/app/actions/vessel-actions"

export default async function HomePage() {
  const featuredVessels = await getFeaturedVessels(6)

  return (
    <div className="flex-1">
      {/* Hero Section - Airbnb Style */}
      <section className="relative w-full h-[70vh] min-h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <Image
          src="https://images.pexels.com/photos/3808621/pexels-photo-3808621.jpeg"
          alt="Professional offshore support vessel"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="container text-center text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Charter Premium
              </h1>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-blue-300">
                Offshore Support Vessels
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Connect with certified vessel owners worldwide. Professional crew, modern equipment, 
                transparent pricing—everything you need for offshore operations.
              </p>
            </div>
            
            {/* Search Box - Airbnb Style */}
            <div className="bg-white rounded-full p-2 shadow-2xl max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="flex flex-col p-4">
                  <label className="text-xs font-semibold text-gray-600 mb-1">VESSEL TYPE</label>
                  <Select>
                    <SelectTrigger className="border-0 shadow-none text-gray-900 font-medium">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="AHTS">AHTS Vessels</SelectItem>
                      <SelectItem value="PSV">Platform Supply</SelectItem>
                      <SelectItem value="Crew Boat">Crew Boats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col p-4">
                  <label className="text-xs font-semibold text-gray-600 mb-1">LOCATION</label>
                  <Input 
                    placeholder="Where do you need a vessel?" 
                    className="border-0 shadow-none text-gray-900 font-medium"
                  />
                </div>
                <div className="flex flex-col p-4">
                  <label className="text-xs font-semibold text-gray-600 mb-1">DURATION</label>
                  <Input 
                    placeholder="How many days?" 
                    className="border-0 shadow-none text-gray-900 font-medium"
                  />
                </div>
                <div className="flex items-center justify-center p-2">
                  <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why 2000+ Companies Trust marimar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every vessel on our platform is verified, insured, and operated by certified professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Vessels</h3>
              <p className="text-gray-600">All vessels undergo rigorous safety and compliance checks</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certified Crews</h3>
              <p className="text-gray-600">Professional crews with international maritime certifications</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-gray-600">Book approved vessels instantly with transparent pricing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">5-Star Support</h3>
              <p className="text-gray-600">24/7 maritime operations support and emergency assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vessels - Airbnb Style Cards */}
      <section className="w-full py-16 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Vessels
              </h2>
              <p className="text-lg text-gray-600">
                Handpicked vessels from our most trusted operators
              </p>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href="/marketplace">View All Vessels</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVessels.map((vessel, index) => {
              const vesselImages = [
                "https://images.pexels.com/photos/14828204/pexels-photo-14828204.jpeg",
                "https://images.pexels.com/photos/3197704/pexels-photo-3197704.jpeg",
                "https://images.pexels.com/photos/16169311/pexels-photo-16169311.jpeg",
                "https://images.pexels.com/photos/32300738/pexels-photo-32300738.jpeg",
                "https://images.pexels.com/photos/20285580/pexels-photo-20285580.jpeg",
                "https://images.pexels.com/photos/32253344/pexels-photo-32253344.jpeg"
              ]
              
              return (
                <Card key={vessel.id} className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={vesselImages[index] || vesselImages[0]}
                      alt={vessel.vessel_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-md">
                        {vessel.vessel_type}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full shadow-md">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-semibold">4.9</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{vessel.vessel_name}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {vessel.location}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Anchor className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{vessel.length_overall}m LOA</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{vessel.passenger_capacity} crew</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            ${vessel.daily_rate?.toLocaleString() || 'POA'}
                          </span>
                          <span className="text-gray-600 ml-1">/ day</span>
                        </div>
                        <Button asChild>
                          <Link href={`/marketplace/${vessel.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vessel Types Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Vessel Type
            </h2>
            <p className="text-lg text-gray-600">
              From anchor handling to crew transfer, we have the right vessel for your operation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <Image
                  src="https://images.pexels.com/photos/32300738/pexels-photo-32300738.jpeg"
                  alt="AHTS Vessel"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center mb-2">
                    <Anchor className="w-6 h-6 mr-2" />
                    <h3 className="text-xl font-bold">AHTS Vessels</h3>
                  </div>
                  <p className="text-sm opacity-90">Anchor handling & towing operations</p>
                </div>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    High bollard pull capacity
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Advanced winch systems
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Dynamic positioning capabilities
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/marketplace?type=AHTS">Browse AHTS Vessels</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <Image
                  src="https://images.pexels.com/photos/14828204/pexels-photo-14828204.jpeg"
                  alt="Platform Supply Vessel"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center mb-2">
                    <Ship className="w-6 h-6 mr-2" />
                    <h3 className="text-xl font-bold">Platform Supply</h3>
                  </div>
                  <p className="text-sm opacity-90">Supply & logistics operations</p>
                </div>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Large deck space for cargo
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Multiple tanks for liquids
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Accommodation facilities
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/marketplace?type=PSV">Browse PSVs</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <Image
                  src="https://images.pexels.com/photos/32253344/pexels-photo-32253344.jpeg"
                  alt="Crew Boat"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center mb-2">
                    <Users className="w-6 h-6 mr-2" />
                    <h3 className="text-xl font-bold">Crew Boats</h3>
                  </div>
                  <p className="text-sm opacity-90">Fast crew transportation</p>
                </div>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    High speed capabilities
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Comfortable seating
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Fuel efficient design
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/marketplace?type=crew">Browse Crew Boats</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How marimar Works
            </h2>
            <p className="text-lg text-gray-600">
              Charter a vessel in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Search & Compare</h3>
              <p className="text-gray-600">
                Browse our verified fleet and compare vessels by location, specifications, and rates. 
                Use our advanced filters to find the perfect match.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Book Instantly</h3>
              <p className="text-gray-600">
                Submit your charter request with transparent pricing. Connect directly with vessel 
                owners and finalize your booking details.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Operate Safely</h3>
              <p className="text-gray-600">
                Enjoy professional service with certified crews, comprehensive insurance, 
                and 24/7 operational support throughout your charter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Charter Your Next Vessel?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies who trust marimar for their offshore operations. 
            Start browsing vessels in your region today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/marketplace">Browse Vessels</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/register">List Your Vessel</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
