"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Vessel } from "@/app/actions/vessel-actions"

interface VesselStatsProps {
  vessels: Vessel[]
}

export function VesselStats({ vessels }: VesselStatsProps) {
  // Count vessels by type
  const typeCounts = vessels.reduce(
    (acc, vessel) => {
      const type = vessel.vessel_type
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Format data for chart
  const data = Object.entries(typeCounts).map(([type, count]) => ({
    name: type,
    count,
  }))

  // Count vessels by status
  const statusCounts = vessels.reduce(
    (acc, vessel) => {
      const status = vessel.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Format status data for chart
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    count,
  }))

  // Count vessels by DP rating
  const dpCounts = vessels.reduce(
    (acc, vessel) => {
      const dp = vessel.dynamic_positioning || "No DP"
      acc[dp] = (acc[dp] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Format DP data for chart
  const dpData = Object.entries(dpCounts).map(([dp, count]) => ({
    name: dp,
    count,
  }))

  // If no vessels, show empty state
  if (vessels.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No vessel data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">OSVs by Type</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">OSVs by Status</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">OSVs by DP Rating</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dpData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
