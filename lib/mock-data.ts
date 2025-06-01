import { addDays, subDays, format } from "date-fns"

// Get current date
const today = new Date()

// Format dates for mock data
const formatDate = (date: Date) => format(date, "yyyy-MM-dd")

// Mock user IDs
export const mockUsers = {
  admin: "admin-user-id",
  vesselOwner: "vessel-owner-id",
  vesselOperator: "vessel-operator-id",
  charterer: "mock-user-id",
}

// Generate a random date within a range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Mock vessels
export const mockVessels = [
  {
    id: "vessel-1",
    name: "Ocean Explorer",
    vessel_type: "PSV",
    status: "Active",
    location: "Gulf of Mexico",
    owner_id: mockUsers.vesselOwner,
    latitude: 29.7604,
    longitude: -95.3698,
    main_image_url: "/offshore-vessel.png",
  },
  {
    id: "vessel-2",
    name: "Sea Surveyor",
    vessel_type: "AHTS",
    status: "Active",
    location: "North Sea",
    owner_id: mockUsers.vesselOwner,
    latitude: 57.1482,
    longitude: 2.0978,
    main_image_url: "/placeholder.svg?key=34zfl",
  },
  {
    id: "vessel-3",
    name: "Gulf Supporter",
    vessel_type: "Crew Boat",
    status: "Maintenance",
    location: "Persian Gulf",
    owner_id: mockUsers.vesselOwner,
    latitude: 25.2048,
    longitude: 55.2708,
    main_image_url: "/placeholder.svg?key=5hv9m",
  },
]

// Mock bookings
export const mockBookings = [
  {
    id: "booking-1",
    vessel_id: "vessel-1",
    charterer_id: mockUsers.charterer,
    operator_id: mockUsers.vesselOperator,
    start_date: formatDate(subDays(today, 5)),
    end_date: formatDate(addDays(today, 5)),
    personnel_onboard: 12,
    scope_of_work: "Offshore platform support",
    project_ref: "PRJ-001",
    status: "ACTIVE",
    base_charter_cost: 15000,
    estimated_total_cost: 18500,
    created_at: formatDate(subDays(today, 10)),
    updated_at: formatDate(subDays(today, 8)),
    // Add vessel and charterer objects to match the expected structure
    vessel: {
      id: "vessel-1",
      name: "Ocean Explorer",
      vessel_type: "PSV",
      location: "Gulf of Mexico",
    },
    charterer: {
      id: mockUsers.charterer,
      full_name: "John Doe",
      email: "john.doe@example.com",
    },
    operator: {
      id: mockUsers.vesselOperator,
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
    },
  },
  {
    id: "booking-2",
    vessel_id: "vessel-2",
    charterer_id: mockUsers.charterer,
    operator_id: mockUsers.vesselOperator,
    start_date: formatDate(addDays(today, 10)),
    end_date: formatDate(addDays(today, 20)),
    personnel_onboard: 8,
    scope_of_work: "Anchor handling operations",
    project_ref: "PRJ-002",
    status: "CONFIRMED",
    base_charter_cost: 22000,
    estimated_total_cost: 25000,
    created_at: formatDate(subDays(today, 15)),
    updated_at: formatDate(subDays(today, 12)),
    // Add vessel and charterer objects to match the expected structure
    vessel: {
      id: "vessel-2",
      name: "Sea Surveyor",
      vessel_type: "AHTS",
      location: "North Sea",
    },
    charterer: {
      id: mockUsers.charterer,
      full_name: "John Doe",
      email: "john.doe@example.com",
    },
    operator: {
      id: mockUsers.vesselOperator,
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
    },
  },
  {
    id: "booking-3",
    vessel_id: "vessel-3",
    charterer_id: "other-charterer-id",
    operator_id: mockUsers.vesselOperator,
    start_date: formatDate(subDays(today, 15)),
    end_date: formatDate(subDays(today, 8)),
    personnel_onboard: 6,
    scope_of_work: "Crew transfer",
    project_ref: "PRJ-003",
    status: "COMPLETED",
    base_charter_cost: 8000,
    estimated_total_cost: 9500,
    created_at: formatDate(subDays(today, 20)),
    updated_at: formatDate(subDays(today, 7)),
    // Add vessel and charterer objects to match the expected structure
    vessel: {
      id: "vessel-3",
      name: "Gulf Supporter",
      vessel_type: "Crew Boat",
      location: "Persian Gulf",
    },
    charterer: {
      id: "other-charterer-id",
      full_name: "Alice Johnson",
      email: "alice.johnson@example.com",
    },
    operator: {
      id: mockUsers.vesselOperator,
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
    },
  },
  {
    id: "booking-4",
    vessel_id: "vessel-1",
    charterer_id: mockUsers.charterer,
    operator_id: null,
    start_date: formatDate(addDays(today, 25)),
    end_date: formatDate(addDays(today, 35)),
    personnel_onboard: 10,
    scope_of_work: "Offshore survey",
    project_ref: "PRJ-004",
    status: "PENDING_CONFIRMATION",
    base_charter_cost: 18000,
    estimated_total_cost: 21000,
    created_at: formatDate(subDays(today, 5)),
    updated_at: null,
    // Add vessel and charterer objects to match the expected structure
    vessel: {
      id: "vessel-1",
      name: "Ocean Explorer",
      vessel_type: "PSV",
      location: "Gulf of Mexico",
    },
    charterer: {
      id: mockUsers.charterer,
      full_name: "John Doe",
      email: "john.doe@example.com",
    },
    operator: null,
  },
]

// Mock compliance documents
export const mockComplianceDocuments = [
  {
    id: "doc-1",
    vessel_id: "vessel-1",
    document_name: "Safety Management Certificate",
    document_type: "Certificate",
    issue_date: formatDate(subDays(today, 180)),
    expiry_date: formatDate(addDays(today, 180)),
    issuing_authority: "Maritime Safety Authority",
    document_url: null,
    status: "Valid",
  },
  {
    id: "doc-2",
    vessel_id: "vessel-1",
    document_name: "International Oil Pollution Prevention Certificate",
    document_type: "Certificate",
    issue_date: formatDate(subDays(today, 240)),
    expiry_date: formatDate(addDays(today, 120)),
    issuing_authority: "International Maritime Organization",
    document_url: null,
    status: "Valid",
  },
  {
    id: "doc-3",
    vessel_id: "vessel-2",
    document_name: "Load Line Certificate",
    document_type: "Certificate",
    issue_date: formatDate(subDays(today, 300)),
    expiry_date: formatDate(addDays(today, 60)),
    issuing_authority: "Classification Society",
    document_url: null,
    status: "Valid",
  },
  {
    id: "doc-4",
    vessel_id: "vessel-3",
    document_name: "Annual Safety Inspection",
    document_type: "Inspection",
    issue_date: formatDate(subDays(today, 30)),
    expiry_date: formatDate(addDays(today, 335)),
    issuing_authority: "Flag State Control",
    document_url: null,
    status: "Valid",
  },
]
