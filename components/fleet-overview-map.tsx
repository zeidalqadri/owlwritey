"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { formatDistanceToNow } from "date-fns"
import { Ship } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Custom vessel icon with color based on status
const createVesselIcon = (status: string, cog: number | null) => {
  let color = "#3b82f6" // Default blue

  switch (status.toLowerCase()) {
    case "active":
      color = "#10b981" // Green
      break
    case "maintenance":
      color = "#f59e0b" // Amber
      break
    case "unavailable":
      color = "#ef4444" // Red
      break
  }

  return L.divIcon({
    className: "vessel-icon",
    html: `<div style="transform: rotate(${cog || 0}deg);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8c0 5.5-6 10-6 10s-6-4.5-6-10a6 6 0 0 1 12 0"/>
              <circle cx="12" cy="8" r="2"/>
            </svg>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Helper component to fit bounds when vessels change
function MapBoundsUpdater({ vessels }: { vessels: VesselPosition[] }) {
  const map = useMap()

  useEffect(() => {
    if (vessels.length === 0) return

    // Create bounds from all vessel positions
    const bounds = L.latLngBounds(vessels.map((v) => [v.latitude, v.longitude]))

    // Fit the map to these bounds with some padding
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [map, vessels])

  return null
}

// Define the vessel position type
interface VesselPosition {
  id: string
  vessel_name: string
  vessel_type: string
  status: string
  latitude: number
  longitude: number
  sog?: number | null
  cog?: number | null
  ais_timestamp?: string | null
}

interface FleetOverviewMapProps {
  initialVessels: VesselPosition[]
  enableRealtime?: boolean
  mapHeight?: string
  className?: string
  userRole?: string
}

export function FleetOverviewMap({
  initialVessels,
  enableRealtime = true,
  mapHeight = "500px",
  className,
  userRole,
}: FleetOverviewMapProps) {
  const [vessels, setVessels] = useState<VesselPosition[]>(initialVessels)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("Idle")

  // Create Supabase client
  const supabase = createClientComponentClient<Database>()

  // Set up Supabase Realtime subscription for all vessels
  useEffect(() => {
    if (!enableRealtime) return

    setSubscriptionStatus("Connecting")

    // Get vessel IDs to subscribe to
    const vesselIds = initialVessels.map((v) => v.id)
    if (vesselIds.length === 0) return

    // Create a Supabase Realtime channel
    const channel = supabase
      .channel(`fleet-positions`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vessels",
          filter: `id=in.(${vesselIds.join(",")})`,
        },
        (payload) => {
          console.log("Received fleet update:", payload)

          // Update the specific vessel in our state
          if (payload.new && payload.new.id) {
            setVessels((prev) =>
              prev.map((vessel) => (vessel.id === payload.new.id ? { ...vessel, ...payload.new } : vessel)),
            )
          }
        },
      )
      .subscribe((status, error) => {
        console.log(`Supabase Realtime status: ${status}`, error)

        if (error) {
          console.error("Supabase Realtime error:", error)
          setSubscriptionStatus("Error")
        } else {
          setSubscriptionStatus(status === "SUBSCRIBED" ? "Subscribed" : status)
        }
      })

    // Cleanup function
    return () => {
      console.log("Cleaning up Fleet Realtime subscription")
      supabase.removeChannel(channel)
    }
  }, [initialVessels, enableRealtime, supabase])

  // Format coordinates for display
  const formatCoordinate = (coord: number, isLat: boolean) => {
    const direction = isLat ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W"
    const abs = Math.abs(coord)
    const degrees = Math.floor(abs)
    const minutes = ((abs - degrees) * 60).toFixed(3)
    return `${degrees}° ${minutes}' ${direction}`
  }

  // Default center position if no vessels
  const defaultCenter: L.LatLngExpression = [0, 0]

  // Get center position from vessels or use default
  const mapCenter =
    vessels.length > 0 ? ([vessels[0].latitude, vessels[0].longitude] as L.LatLngExpression) : defaultCenter

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Fleet Overview</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Active
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
              Maintenance
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
              Unavailable
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md overflow-hidden border border-gray-200" style={{ height: mapHeight }}>
          {vessels.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-4">
                <Ship className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No vessels available to track</p>
              </div>
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {vessels.map((vessel) => (
                <Marker
                  key={vessel.id}
                  position={[vessel.latitude, vessel.longitude]}
                  icon={createVesselIcon(vessel.status, vessel.cog)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{vessel.vessel_name}</p>
                      <p className="text-xs text-gray-500">{vessel.vessel_type}</p>
                      <div className="mt-2 space-y-1">
                        <p>
                          <span className="font-medium">Position: </span>
                          {formatCoordinate(vessel.latitude, true)}, {formatCoordinate(vessel.longitude, false)}
                        </p>
                        {vessel.sog !== null && vessel.sog !== undefined && (
                          <p>
                            <span className="font-medium">Speed: </span>
                            {vessel.sog.toFixed(1)} knots
                          </p>
                        )}
                        {vessel.cog !== null && vessel.cog !== undefined && (
                          <p>
                            <span className="font-medium">Course: </span>
                            {vessel.cog.toFixed(0)}°
                          </p>
                        )}
                        {vessel.ais_timestamp && (
                          <p>
                            <span className="font-medium">Last Update: </span>
                            {formatDistanceToNow(new Date(vessel.ais_timestamp), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              <MapBoundsUpdater vessels={vessels} />
            </MapContainer>
          )}

          {subscriptionStatus === "Error" && (
            <div className="absolute bottom-2 right-2 bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
              Realtime connection error
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
