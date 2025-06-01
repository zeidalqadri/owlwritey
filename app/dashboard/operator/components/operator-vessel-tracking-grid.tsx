"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AISMapWidget } from "@/components/ais-map-widget"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Ship, AlertTriangle } from "lucide-react"

interface VesselForTracking {
  id: string
  vessel_name: string
  vessel_type: string
  status: string
  latitude: number | null
  longitude: number | null
  sog?: number | null
  cog?: number | null
  ais_timestamp?: string | null
}

interface OperatorVesselTrackingGridProps {
  vessels: VesselForTracking[]
}

export function OperatorVesselTrackingGrid({ vessels }: OperatorVesselTrackingGridProps) {
  const [expandedVesselId, setExpandedVesselId] = useState<string | null>(null)

  // Toggle expanded view for a vessel
  const toggleExpand = (vesselId: string) => {
    setExpandedVesselId(expandedVesselId === vesselId ? null : vesselId)
  }

  // Get AIS status based on timestamp
  const getAisStatus = (timestamp: string | null | undefined) => {
    if (!timestamp) return "unavailable"

    const minutesAgo = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)

    if (minutesAgo < 10) return "live"
    if (minutesAgo < 60) return "recent"
    return "stale"
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vessels.map((vessel) => (
          <Card key={vessel.id} className={expandedVesselId === vessel.id ? "col-span-full" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{vessel.vessel_name}</CardTitle>
                {vessel.ais_timestamp && (
                  <Badge
                    variant="outline"
                    className={`
                      ${getAisStatus(vessel.ais_timestamp) === "live" ? "bg-green-50 text-green-700" : ""}
                      ${getAisStatus(vessel.ais_timestamp) === "recent" ? "bg-yellow-50 text-yellow-700" : ""}
                      ${getAisStatus(vessel.ais_timestamp) === "stale" ? "bg-red-50 text-red-700" : ""}
                      ${getAisStatus(vessel.ais_timestamp) === "unavailable" ? "bg-gray-50 text-gray-700" : ""}
                    `}
                  >
                    {getAisStatus(vessel.ais_timestamp) === "live" && (
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                    {getAisStatus(vessel.ais_timestamp) === "live" && "Live AIS"}
                    {getAisStatus(vessel.ais_timestamp) === "recent" &&
                      `AIS ${Math.floor((Date.now() - new Date(vessel.ais_timestamp).getTime()) / 60000)}m ago`}
                    {getAisStatus(vessel.ais_timestamp) === "stale" &&
                      `AIS ${Math.floor((Date.now() - new Date(vessel.ais_timestamp).getTime()) / 3600000)}h ago`}
                    {getAisStatus(vessel.ais_timestamp) === "unavailable" && "No AIS Data"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{vessel.vessel_type}</p>
            </CardHeader>
            <CardContent>
              {vessel.latitude && vessel.longitude ? (
                <AISMapWidget
                  vesselId={vessel.id}
                  vesselName={vessel.vessel_name}
                  initialLatitude={vessel.latitude}
                  initialLongitude={vessel.longitude}
                  initialTimestamp={vessel.ais_timestamp}
                  enableRealtime={true}
                  mapHeight={expandedVesselId === vessel.id ? "400px" : "200px"}
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] bg-gray-100 rounded-md">
                  <div className="text-center">
                    <AlertTriangle className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No position data</p>
                  </div>
                </div>
              )}

              {expandedVesselId === vessel.id && vessel.latitude && vessel.longitude && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Position Details</h4>
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">Latitude:</span> {vessel.latitude.toFixed(6)}°
                      </p>
                      <p>
                        <span className="font-medium">Longitude:</span> {vessel.longitude.toFixed(6)}°
                      </p>
                      {vessel.ais_timestamp && (
                        <p>
                          <span className="font-medium">Last Update:</span>{" "}
                          {formatDistanceToNow(new Date(vessel.ais_timestamp), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Navigation Data</h4>
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">Speed:</span>{" "}
                        {vessel.sog !== null && vessel.sog !== undefined
                          ? `${vessel.sog.toFixed(1)} knots`
                          : "Not available"}
                      </p>
                      <p>
                        <span className="font-medium">Course:</span>{" "}
                        {vessel.cog !== null && vessel.cog !== undefined
                          ? `${vessel.cog.toFixed(0)}°`
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button variant="outline" size="sm" onClick={() => toggleExpand(vessel.id)}>
                {expandedVesselId === vessel.id ? "Collapse" : "Expand"}
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href={`/dashboard/operator/vessel/${vessel.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {vessels.length === 0 && (
        <div className="text-center py-12 border rounded-md">
          <Ship className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium">No vessels assigned</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any vessels assigned for operation yet.</p>
        </div>
      )}
    </div>
  )
}
