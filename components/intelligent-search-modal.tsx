"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { X, Search, Brain, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { IntelligentSearch } from "@/components/intelligent-search"

interface IntelligentSearchModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuery: string
  onQueryChange: (query: string) => void
}

export function IntelligentSearchModal({
  isOpen,
  onClose,
  initialQuery,
  onQueryChange
}: IntelligentSearchModalProps) {
  const [localQuery, setLocalQuery] = useState("")

  useEffect(() => {
    if (isOpen && initialQuery) {
      setLocalQuery(initialQuery)
    }
  }, [isOpen, initialQuery])

  const handleClose = () => {
    onQueryChange("")
    setLocalQuery("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Intelligent Vessel Search</h2>
                <p className="text-sm text-gray-600">Describe your needs in plain English</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <IntelligentSearch initialQuery={localQuery} />
        </div>
      </DialogContent>
    </Dialog>
  )
}