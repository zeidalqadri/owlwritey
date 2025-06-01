"use server"

import { revalidatePath } from "next/cache"
import { getServerSideSupabase } from "@/lib/supabase"
import { getServerSession } from "@/lib/session"
import { getUserRole } from "@/lib/hooks/use-user-role"

// Mock data for development
const mockComplianceDocuments = [
  {
    id: "doc1",
    vessel_id: "v1",
    document_name: "International Safety Management (ISM) Certificate",
    document_type: "Certificate",
    issue_date: "2023-01-15",
    expiry_date: "2028-01-14",
    issuing_authority: "Maritime Safety Authority",
    document_url: null,
    status: "Valid",
    created_at: "2023-01-15T00:00:00.000Z",
    updated_at: null,
  },
  {
    id: "doc2",
    vessel_id: "v1",
    document_name: "International Ship Security Certificate (ISSC)",
    document_type: "Certificate",
    issue_date: "2022-06-10",
    expiry_date: "2027-06-09",
    issuing_authority: "Maritime Safety Authority",
    document_url: null,
    status: "Valid",
    created_at: "2022-06-10T00:00:00.000Z",
    updated_at: null,
  },
  {
    id: "doc3",
    vessel_id: "v1",
    document_name: "Maritime Labour Convention (MLC) Certificate",
    document_type: "Certificate",
    issue_date: "2023-03-20",
    expiry_date: "2023-09-19",
    issuing_authority: "Maritime Labour Authority",
    document_url: null,
    status: "Expired",
    created_at: "2023-03-20T00:00:00.000Z",
    updated_at: null,
  },
  {
    id: "doc4",
    vessel_id: "v1",
    document_name: "Annual DP Trial Certificate",
    document_type: "Inspection",
    issue_date: "2023-05-15",
    expiry_date: "2024-05-14",
    issuing_authority: "DP Certification Body",
    document_url: null,
    status: "Valid",
    created_at: "2023-05-15T00:00:00.000Z",
    updated_at: null,
  },
  {
    id: "doc5",
    vessel_id: "v1",
    document_name: "Load Line Certificate",
    document_type: "Certificate",
    issue_date: "2022-11-30",
    expiry_date: "2023-11-29",
    issuing_authority: "Classification Society",
    document_url: null,
    status: "Valid",
    created_at: "2022-11-30T00:00:00.000Z",
    updated_at: null,
  },
]

export async function getVesselComplianceDocuments(vesselId: string) {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === "development" || vesselId.startsWith("mock-")) {
      return mockComplianceDocuments.filter((doc) => doc.vessel_id === vesselId)
    }

    const supabase = getServerSideSupabase()

    const { data, error } = await supabase
      .from("compliance_documents")
      .select("*")
      .eq("vessel_id", vesselId)
      .order("document_type", { ascending: true })
      .order("expiry_date", { ascending: true })

    if (error) {
      console.error("Error fetching compliance documents:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Exception fetching compliance documents:", error)
    return []
  }
}

export async function addComplianceDocument(
  vesselId: string,
  documentData: {
    document_name: string
    document_type: string
    issue_date: string
    expiry_date: string
    issuing_authority: string
    document_url?: string | null
    status: string
  },
) {
  try {
    // Connect to Supabase
    const supabase = getServerSideSupabase()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to add compliance documents",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Check if user has permission to add compliance documents
    if (userRole !== "Admin" && userRole !== "Vessel Owner") {
      return {
        success: false,
        error: "You don't have permission to add compliance documents",
      }
    }

    // Check if the user owns this vessel (if they're a Vessel Owner)
    if (userRole === "Vessel Owner") {
      const { data: vessel, error: vesselError } = await supabase
        .from("vessels")
        .select("owner_id")
        .eq("id", vesselId)
        .single()

      if (vesselError) {
        console.error("Error fetching vessel:", vesselError)
        return { success: false, error: "Failed to verify vessel ownership" }
      }

      if (vessel.owner_id !== session.user.id) {
        return {
          success: false,
          error: "You can only add compliance documents to vessels you own",
        }
      }
    }

    // Insert the new compliance document
    const { data: newDocument, error: insertError } = await supabase
      .from("compliance_documents")
      .insert({
        vessel_id: vesselId,
        document_name: documentData.document_name,
        document_type: documentData.document_type,
        issue_date: documentData.issue_date,
        expiry_date: documentData.expiry_date,
        issuing_authority: documentData.issuing_authority,
        document_url: documentData.document_url,
        status: documentData.status,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error adding compliance document:", insertError)
      throw new Error("Failed to add compliance document")
    }

    // Revalidate relevant paths
    revalidatePath(`/marketplace/${vesselId}`)
    revalidatePath(`/dashboard/vessels/${vesselId}`)

    return {
      success: true,
      documentId: newDocument.id,
    }
  } catch (error) {
    console.error("Error adding compliance document:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function updateComplianceDocument(
  documentId: string,
  documentData: {
    document_name?: string
    document_type?: string
    issue_date?: string
    expiry_date?: string
    issuing_authority?: string
    document_url?: string | null
    status?: string
  },
) {
  try {
    // Connect to Supabase
    const supabase = getServerSideSupabase()

    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to update compliance documents",
      }
    }

    // Get user role
    const userRole = await getUserRole(session.user.id)

    // Check if user has permission to update compliance documents
    if (userRole !== "Admin" && userRole !== "Vessel Owner") {
      return {
        success: false,
        error: "You don't have permission to update compliance documents",
      }
    }

    // Get the document to check vessel ownership
    const { data: document, error: documentError } = await supabase
      .from("compliance_documents")
      .select("vessel_id")
      .eq("id", documentId)
      .single()

    if (documentError) {
      console.error("Error fetching compliance document:", documentError)
      return { success: false, error: "Document not found" }
    }

    // If user is a Vessel Owner, verify they own the vessel
    if (userRole === "Vessel Owner") {
      const { data: vessel, error: vesselError } = await supabase
        .from("vessels")
        .select("owner_id")
        .eq("id", document.vessel_id)
        .single()

      if (vesselError) {
        console.error("Error fetching vessel:", vesselError)
        return { success: false, error: "Failed to verify vessel ownership" }
      }

      if (vessel.owner_id !== session.user.id) {
        return {
          success: false,
          error: "You can only update compliance documents for vessels you own",
        }
      }
    }

    // Update the compliance document
    const { error: updateError } = await supabase
      .from("compliance_documents")
      .update({
        ...documentData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    if (updateError) {
      console.error("Error updating compliance document:", updateError)
      throw new Error("Failed to update compliance document")
    }

    // Get the vessel ID for path revalidation
    const vesselId = document.vessel_id

    // Revalidate relevant paths
    revalidatePath(`/marketplace/${vesselId}`)
    revalidatePath(`/dashboard/vessels/${vesselId}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating compliance document:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
