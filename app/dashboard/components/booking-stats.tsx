"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Booking } from "@/app/actions/booking-actions"

interface BookingStatsProps {
  bookings: Booking[]
}

export function BookingStats({ bookings }: BookingStatsProps) {
  // Count bookings by status
  const statusCounts = bookings.reduce(
    (acc, booking) => {
      const status = booking.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Format data for chart
  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: formatStatus(status),
    value: count,
  }))

  // Colors for different statuses
  const COLORS = {
    Pending: "#f59e0b",
    Confirmed: "#10b981",
    Active: "#3b82f6",
    Completed: "#8b5cf6",
    Rejected: "#ef4444",
    Cancelled: "#6b7280",
  }

  // If no bookings, show empty state
  if (bookings.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No booking data available</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#6b7280"} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} bookings`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatStatus(status: string): string {
  switch (status) {
    case "PENDING_CONFIRMATION":
      return "Pending"
    case "CONFIRMED":
      return "Confirmed"
    case "ACTIVE":
      return "Active"
    case "COMPLETED":
      return "Completed"
    case "REJECTED":
      return "Rejected"
    case "CANCELLED":
      return "Cancelled"
    default:
      return status
  }
}
