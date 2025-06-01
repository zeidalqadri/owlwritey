"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { formatDistanceToNow } from "date-fns"
import { Compass, Navigation, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Custom vessel icon with rotation based on COG
const createVesselIcon = (cog: number | null) => {
  return L.divIcon({
    className: "vessel-icon",
    html: `<div style="transform: rotate(${cog || 0}deg);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8c0 5.5-6 10-6 10s-6-4.5-6-10a6 6 0 0 1 12 0"/>
              <circle cx="12" cy="8" r="2"/>
            </svg>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Helper component to update map view when position changes
function MapUpdater({ position }: { position: L.LatLngExpression | null }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom())
    }
  }, [map, position])

  return null
}

// AIS Status indicator component
function AISStatusIndicator({ lastUpdate }: { lastUpdate: Date | null }) {
  if (!lastUpdate) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-gray-100">
        <AlertTriangle className="h-3 w-3" />
        <span>No AIS Data</span>
      </Badge>
    )
  }

  const minutesAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 60000)

  if (minutesAgo < 10) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span>Live AIS</span>
      </Badge>
    )
  } else if (minutesAgo < 60) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
        </span>
        <span>AIS {minutesAgo}m ago</span>
      </Badge>
    )
  } else {
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700">
        <AlertTriangle className="h-3 w-3" />
        <span>AIS {Math.floor(minutesAgo / 60)}h ago</span>
      </Badge>
    )
  }
}

// Define the props for the AISMapWidget component
interface AISMapWidgetProps {
  vesselId: string
  vesselName: string
  initialLatitude?: number | null
  initialLongitude?: number | null
  initialTimestamp?: string | null
  enableRealtime?: boolean
  mapHeight?: string
  className?: string
}

// Define the type for AIS update payload from Supabase
type AISUpdatePayload = {
  id: string
  latitude: number
  longitude: number
  sog?: number | null
  cog?: number | null
  ais_timestamp?: string | null
  updated_at?: string
}

export function AISMapWidget({
  vesselId,
  vesselName,
  initialLatitude,
  initialLongitude,
  initialTimestamp,
  enableRealtime = true,
  mapHeight = "400px",
  className,
}: AISMapWidgetProps) {
  // Create Supabase client
  const supabase = createClientComponentClient<Database>()

  // State for vessel position and data
  const [currentPosition, setCurrentPosition] = useState<L.LatLngExpression | null>(
    initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : null,
  )
  const [currentSOG, setCurrentSOG] = useState<number | null>(null)
  const [currentCOG, setCurrentCOG] = useState<number | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(
    initialTimestamp ? new Date(initialTimestamp) : null,
  )
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("Idle")

  // Reference to the Supabase channel
  const channelRef = useRef<any>(null)

  // Initialize position from props when they become available
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setCurrentPosition([initialLatitude, initialLongitude])
    }

    if (initialTimestamp) {
      setLastUpdateTime(new Date(initialTimestamp))
    }
  }, [initialLatitude, initialLongitude, initialTimestamp])

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!vesselId || !enableRealtime) {
      return
    }

    setSubscriptionStatus("Connecting")

    // Create a Supabase Realtime channel
    const channel = supabase
      .channel(`vessel-position-${vesselId}`)
      .on<AISUpdatePayload>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vessels", // Change to 'ais_positions' if using a dedicated table
          filter: `id=eq.${vesselId}`, // Change to 'vessel_id=eq.${vesselId}' if using ais_positions table
        },
        (payload) => {
          console.log("Received AIS update:", payload)

          // Validate payload has necessary fields
          if (payload.new && typeof payload.new.latitude === "number" && typeof payload.new.longitude === "number") {
            // Update position
            setCurrentPosition([payload.new.latitude, payload.new.longitude])

            // Update SOG and COG if available
            if (typeof payload.new.sog === "number") {
              setCurrentSOG(payload.new.sog)
            }

            if (typeof payload.new.cog === "number") {
              setCurrentCOG(payload.new.cog)
            }

            // Update timestamp
            const timestamp = payload.new.ais_timestamp || payload.new.updated_at
            if (timestamp) {
              setLastUpdateTime(new Date(timestamp))
            }
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

    // Store the channel reference
    channelRef.current = channel

    // Cleanup function
    return () => {
      console.log("Cleaning up Supabase Realtime subscription")
      supabase.removeChannel(channel)
    }
  }, [vesselId, enableRealtime, supabase])

  // Format coordinates for display
  const formatCoordinate = (coord: number, isLat: boolean) => {
    const direction = isLat ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W"
    const abs = Math.abs(coord)
    const degrees = Math.floor(abs)
    const minutes = ((abs - degrees) * 60).toFixed(3)
    return `${degrees}° ${minutes}' ${direction}`
  }

  // Default position if none is available
  const defaultPosition: L.LatLngExpression = [0, 0]

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Vessel Position</h3>
        <AISStatusIndicator lastUpdate={lastUpdateTime} />
      </div>

      <div className="relative rounded-md overflow-hidden border border-gray-200" style={{ height: mapHeight }}>
        {!currentPosition ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <AlertTriangle className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No position data available</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={currentPosition}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={currentPosition} icon={createVesselIcon(currentCOG)}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{vesselName}</p>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Position: </span>
                      {currentPosition && (
                        <>
                          {formatCoordinate(currentPosition[0], true)}, {formatCoordinate(currentPosition[1], false)}
                        </>
                      )}
                    </p>
                    {currentSOG !== null && (
                      <p>
                        <span className="font-medium">Speed: </span>
                        {currentSOG.toFixed(1)} knots
                      </p>
                    )}
                    {currentCOG !== null && (
                      <p>
                        <span className="font-medium">Course: </span>
                        {currentCOG.toFixed(0)}°
                      </p>
                    )}
                    {lastUpdateTime && (
                      <p>
                        <span className="font-medium">Last Update: </span>
                        {formatDistanceToNow(lastUpdateTime, { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>

            <MapUpdater position={currentPosition} />
          </MapContainer>
        )}

        {subscriptionStatus === "Error" && (
          <div className="absolute bottom-2 right-2 bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
            Realtime connection error
          </div>
        )}
      </div>

      {currentPosition && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-gray-500">
            <Navigation className="h-3 w-3" />
            <span>{currentSOG !== null ? `${currentSOG.toFixed(1)} knots` : "Speed unavailable"}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Compass className="h-3 w-3" />
            <span>{currentCOG !== null ? `${currentCOG.toFixed(0)}°` : "Course unavailable"}</span>
          </div>
        </div>
      )}
    </div>
  )
}
