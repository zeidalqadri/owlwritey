import { Mail, Phone, MapPin, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full py-6 md:py-8 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About marimar</h1>
            <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed">
              The leading marketplace for offshore support vessels, connecting vessel owners, operators, and charterers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg">
                <Link href="/marketplace">Browse Marketplace</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="w-full py-6 md:py-8">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Our Mission</h2>
              <p className="text-gray-500">
                At marimar, we're dedicated to revolutionizing the maritime industry by providing a comprehensive
                platform that connects vessel owners, operators, and charterers. Our mission is to streamline vessel
                management, charter operations, and compliance tracking to make offshore operations more efficient and
                transparent.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Our Vision</h2>
              <p className="text-gray-500">
                We envision a future where the maritime industry operates with unprecedented efficiency, transparency,
                and collaboration. By leveraging technology, we aim to create a global network that simplifies vessel
                operations, reduces downtime, and optimizes resource allocation across the offshore support vessel
                sector.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="w-full py-6 md:py-8 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold">Our Services</h2>
            <p className="text-gray-500 max-w-[700px]">
              We offer a comprehensive suite of tools and services designed to meet the needs of the maritime industry.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Vessel Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Browse and charter offshore support vessels from a wide selection of options, with detailed
                  specifications and availability information.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Fleet Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Comprehensive tools for OSV owners to manage their fleet, track maintenance, and ensure compliance
                  with industry regulations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Charter System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Efficient booking and scheduling system for offshore vessel charters, with real-time availability and
                  automated contract generation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="w-full py-6 md:py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold">Our Team</h2>
            <p className="text-gray-500 max-w-[700px]">
              Our team of maritime experts and technology professionals is dedicated to transforming the offshore vessel
              industry.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Kapten Mooze</CardTitle>
                <CardDescription>CEO & Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  With over 20 years of experience in the maritime industry, John founded marimar to address the
                  challenges he witnessed firsthand.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Zeid Alqadri</CardTitle>
                <CardDescription>CTO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Zeid leads our technology team, bringing his expertise in solution and system development
                  to create innovative solutions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Saiful Tenang</CardTitle>
                <CardDescription>COO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Saiful oversees our day-to-day operations, ensuring that our platform delivers exceptional value to
                  all users.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-6 md:py-8 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold">Contact Us</h2>
            <p className="text-gray-500 max-w-[700px]">
              Have questions or need assistance? Our team is here to help. Reach out to us using any of the methods
              below.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <p>info@marimar.com</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <p>+60 123 4567</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <p>123 Selat Melaka, Malaysia</p>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <p>www.marimarOSV.com</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your message"
                  ></textarea>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
