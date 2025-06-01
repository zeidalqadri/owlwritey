"use client"

import { useState, useEffect } from "react"
import { FileText, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getVesselComplianceDocuments } from "@/app/actions/compliance-actions"

interface VesselComplianceDocumentsProps {
  vesselId: string
}

interface ComplianceDocument {
  id: string
  document_name: string
  document_type: string
  issue_date: string
  expiry_date: string
  issuing_authority: string
  document_url: string | null
  status: string
}

export function VesselComplianceDocuments({ vesselId }: VesselComplianceDocumentsProps) {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true)
        const docs = await getVesselComplianceDocuments(vesselId)
        setDocuments(docs)
        setError(null)
      } catch (err) {
        console.error("Error fetching compliance documents:", err)
        setError("Failed to load compliance documents")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [vesselId])

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Function to check if a document is expiring soon (within 30 days)
  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    return expiry > today && expiry <= thirtyDaysFromNow
  }

  // Function to get status badge
  const getStatusBadge = (status: string, expiryDate: string) => {
    if (status === "Valid") {
      if (isExpiringSoon(expiryDate)) {
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Expiring Soon
          </Badge>
        )
      }
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Valid
        </Badge>
      )
    } else if (status === "Expired") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Expired
        </Badge>
      )
    } else if (status === "Pending") {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Pending
        </Badge>
      )
    } else {
      return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium">No Compliance Documents</h3>
        <p className="text-sm text-gray-500 mt-1">
          Compliance documentation for this vessel is not available in the system.
        </p>
      </div>
    )
  }

  // Group documents by type
  const documentsByType: Record<string, ComplianceDocument[]> = {}
  documents.forEach((doc) => {
    if (!documentsByType[doc.document_type]) {
      documentsByType[doc.document_type] = []
    }
    documentsByType[doc.document_type].push(doc)
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Vessel Compliance Documents</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            Valid
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
            Expiring Soon
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            Expired
          </span>
        </div>
      </div>

      {Object.entries(documentsByType).map(([type, docs]) => (
        <div key={type} className="space-y-2">
          <h4 className="font-medium text-gray-700">{type}</h4>
          <div className="grid grid-cols-1 gap-3">
            {docs.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-gray-500">Issued by: {doc.issuing_authority}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span>
                            {formatDate(doc.issue_date)} - {formatDate(doc.expiry_date)}
                          </span>
                        </div>
                      </div>

                      {getStatusBadge(doc.status, doc.expiry_date)}

                      {doc.document_url && (
                        <Button variant="outline" size="sm" asChild className="ml-auto">
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
