export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Define OSV-specific enums
export type DynamicPositioningRating = "DP-1" | "DP-2" | "DP-3" | "No DP" | null
export type VesselTypeOSV =
  | "AHTS"
  | "AHTS/OSV"
  | "PSV"
  | "PSV/OSV"
  | "Crew Boat"
  | "AWB/OSV"
  | "OSV"
  | "Offshore Support Vessel"
  | string

export interface Database {
  public: {
    Tables: {
      vessels: {
        Row: {
          id: string
          vessel_name: string
          imo_number: string | null
          mmsi_number: string | null
          vessel_type: VesselTypeOSV
          year_built: number
          flag: string | null
          gross_tonnage: number | null
          deadweight: number | null
          length_overall: number
          beam: number
          bhp: number | null
          bollard_pull: number | null
          deck_area: number | null
          passenger_capacity: number
          dynamic_positioning: DynamicPositioningRating
          classification_society: string | null
          shipyard: string | null
          status: "Active" | "Maintenance" | "Unavailable" | "Expired" | "Valid" | "Unknown"
          marketplace_visible: boolean
          main_image_url: string | null
          images: string[] | null
          owner_id: string
          created_at: string
          updated_at: string | null
          location: string
          description: string | null
          features: string[] | null
          daily_rate: number | null
          weekly_rate: number | null
          monthly_rate: number | null
          // AIS-related fields
          latitude: number | null
          longitude: number | null
          sog: number | null
          cog: number | null
          ais_timestamp: string | null
        }
        Insert: {
          id?: string
          vessel_name: string
          imo_number?: string | null
          mmsi_number?: string | null
          vessel_type: VesselTypeOSV
          year_built: number
          flag?: string | null
          gross_tonnage?: number | null
          deadweight?: number | null
          length_overall: number
          beam: number
          bhp?: number | null
          bollard_pull?: number | null
          deck_area?: number | null
          passenger_capacity: number
          dynamic_positioning: DynamicPositioningRating
          classification_society?: string | null
          shipyard?: string | null
          status: "Active" | "Maintenance" | "Unavailable" | "Expired" | "Valid" | "Unknown"
          marketplace_visible: boolean
          main_image_url?: string | null
          images?: string[] | null
          owner_id: string
          created_at?: string
          updated_at?: string | null
          location: string
          description?: string | null
          features?: string[] | null
          daily_rate?: number | null
          weekly_rate?: number | null
          monthly_rate?: number | null
          // AIS-related fields
          latitude?: number | null
          longitude?: number | null
          sog?: number | null
          cog?: number | null
          ais_timestamp?: string | null
        }
        Update: {
          id?: string
          vessel_name?: string
          imo_number?: string | null
          mmsi_number?: string | null
          vessel_type?: VesselTypeOSV
          year_built?: number
          flag?: string | null
          gross_tonnage?: number | null
          deadweight?: number | null
          length_overall?: number
          beam?: number
          bhp?: number | null
          bollard_pull?: number | null
          deck_area?: number | null
          passenger_capacity?: number
          dynamic_positioning?: DynamicPositioningRating
          classification_society?: string | null
          shipyard?: string | null
          status?: "Active" | "Maintenance" | "Unavailable" | "Expired" | "Valid" | "Unknown"
          marketplace_visible?: boolean
          main_image_url?: string | null
          images?: string[] | null
          owner_id?: string
          created_at?: string
          updated_at?: string | null
          location?: string
          description?: string | null
          features?: string[] | null
          daily_rate?: number | null
          weekly_rate?: number | null
          monthly_rate?: number | null
          // AIS-related fields
          latitude?: number | null
          longitude?: number | null
          sog?: number | null
          cog?: number | null
          ais_timestamp?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          vessel_id: string
          charterer_id: string
          operator_id: string | null
          start_date: string
          end_date: string
          personnel_onboard: number
          scope_of_work: string
          project_ref: string | null
          status: "PENDING_CONFIRMATION" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "REJECTED" | "CANCELLED"
          base_charter_cost: number | null
          estimated_total_cost: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          vessel_id: string
          charterer_id: string
          operator_id?: string | null
          start_date: string
          end_date: string
          personnel_onboard: number
          scope_of_work: string
          project_ref?: string | null
          status?: "PENDING_CONFIRMATION" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "REJECTED" | "CANCELLED"
          base_charter_cost?: number | null
          estimated_total_cost: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          vessel_id?: string
          charterer_id?: string
          operator_id?: string | null
          start_date?: string
          end_date?: string
          personnel_onboard?: number
          scope_of_work?: string
          project_ref?: string | null
          status?: "PENDING_CONFIRMATION" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "REJECTED" | "CANCELLED"
          base_charter_cost?: number | null
          estimated_total_cost?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: "Admin" | "Vessel Owner" | "Vessel Operator" | "Charterer"
          company: string | null
          phone: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: "Admin" | "Vessel Owner" | "Vessel Operator" | "Charterer"
          company?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: "Admin" | "Vessel Owner" | "Vessel Operator" | "Charterer"
          company?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      vessel_operators: {
        Row: {
          id: string
          vessel_id: string
          operator_id: string
          assigned_at: string
        }
        Insert: {
          id?: string
          vessel_id: string
          operator_id: string
          assigned_at?: string
        }
        Update: {
          id?: string
          vessel_id?: string
          operator_id?: string
          assigned_at?: string
        }
      }
      compliance_documents: {
        Row: {
          id: string
          vessel_id: string
          document_name: string
          document_type: "Certificate" | "Inspection" | "Approval" | "License" | "Other"
          issue_date: string
          expiry_date: string
          issuing_authority: string
          document_url: string | null
          status: "Valid" | "Expired" | "Pending" | "Revoked"
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          vessel_id: string
          document_name: string
          document_type: "Certificate" | "Inspection" | "Approval" | "License" | "Other"
          issue_date: string
          expiry_date: string
          issuing_authority: string
          document_url?: string | null
          status: "Valid" | "Expired" | "Pending" | "Revoked"
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          vessel_id?: string
          document_name?: string
          document_type?: "Certificate" | "Inspection" | "Approval" | "License" | "Other"
          issue_date?: string
          expiry_date?: string
          issuing_authority?: string
          document_url?: string | null
          status?: "Valid" | "Expired" | "Pending" | "Revoked"
          created_at?: string
          updated_at?: string | null
        }
      }
      ais_positions: {
        Row: {
          id: string
          vessel_id: string
          latitude: number
          longitude: number
          sog: number | null
          cog: number | null
          ais_timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          vessel_id: string
          latitude: number
          longitude: number
          sog?: number | null
          cog?: number | null
          ais_timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          vessel_id?: string
          latitude?: number
          longitude?: number
          sog?: number | null
          cog?: number | null
          ais_timestamp?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
