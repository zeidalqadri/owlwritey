// Define color schemes for different user roles
export const roleColorSchemes = {
  Admin: {
    primary: "bg-purple-600 hover:bg-purple-700",
    secondary: "bg-purple-100 text-purple-800",
    accent: "bg-purple-50 border-purple-200",
    highlight: "text-purple-600",
    sidebar: "bg-purple-900",
    sidebarText: "text-white",
    badge: {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmed: "bg-green-50 text-green-700 border-green-200",
      active: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-purple-50 text-purple-700 border-purple-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      cancelled: "bg-gray-50 text-gray-700 border-gray-200",
    },
  },
  "Vessel Owner": {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-blue-100 text-blue-800",
    accent: "bg-blue-50 border-blue-200",
    highlight: "text-blue-600",
    sidebar: "bg-blue-900",
    sidebarText: "text-white",
    badge: {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmed: "bg-green-50 text-green-700 border-green-200",
      active: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-purple-50 text-purple-700 border-purple-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      cancelled: "bg-gray-50 text-gray-700 border-gray-200",
    },
  },
  "Vessel Operator": {
    primary: "bg-green-600 hover:bg-green-700",
    secondary: "bg-green-100 text-green-800",
    accent: "bg-green-50 border-green-200",
    highlight: "text-green-600",
    sidebar: "bg-green-900",
    sidebarText: "text-white",
    badge: {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmed: "bg-green-50 text-green-700 border-green-200",
      active: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-purple-50 text-purple-700 border-purple-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      cancelled: "bg-gray-50 text-gray-700 border-gray-200",
    },
  },
  Charterer: {
    primary: "bg-amber-600 hover:bg-amber-700",
    secondary: "bg-amber-100 text-amber-800",
    accent: "bg-amber-50 border-amber-200",
    highlight: "text-amber-600",
    sidebar: "bg-amber-900",
    sidebarText: "text-white",
    badge: {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmed: "bg-green-50 text-green-700 border-green-200",
      active: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-purple-50 text-purple-700 border-purple-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      cancelled: "bg-gray-50 text-gray-700 border-gray-200",
    },
  },
}

// Helper function to get color scheme based on user role
export function getColorScheme(role: string) {
  return roleColorSchemes[role as keyof typeof roleColorSchemes] || roleColorSchemes.Charterer
}

// Helper function to get status badge classes
export function getStatusBadgeClasses(status: string, role: string) {
  const colorScheme = getColorScheme(role)

  switch (status) {
    case "PENDING_CONFIRMATION":
      return colorScheme.badge.pending
    case "CONFIRMED":
      return colorScheme.badge.confirmed
    case "ACTIVE":
      return colorScheme.badge.active
    case "COMPLETED":
      return colorScheme.badge.completed
    case "REJECTED":
      return colorScheme.badge.rejected
    case "CANCELLED":
      return colorScheme.badge.cancelled
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}
