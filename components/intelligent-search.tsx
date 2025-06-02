"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Search, 
  Star, 
  MapPin, 
  Users, 
  Anchor, 
  Ruler, 
  Brain,
  AlertCircle,
  CheckCircle,
  Ship,
  MessageCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Import our AI search engine
import MarimarIntelligentSearch from "@/lib/intelligent-search.js"

interface SearchResult {
  id: string
  vessel_name: string
  vessel_type: string
  location: string
  daily_rate?: number
  weekly_rate?: number
  length_overall: number
  passenger_capacity: number
  bollard_pull?: number
  dynamic_positioning?: string
  matchExplanation?: string
  matchScore?: number
}

interface SearchResponse {
  type: 'search_results' | 'clarification_needed' | 'error'
  results?: SearchResult[]
  questions?: string[]
  partialParams?: any
  suggestions?: string[]
  queryUnderstood?: string
  appliedFilters?: any
  totalFound?: number
  message?: string
  fallbackSuggestion?: string
}

export function IntelligentSearch() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [clarificationAnswers, setClarificationAnswers] = useState<string[]>([])
  const [searchEngine] = useState(() => new MarimarIntelligentSearch())

  const vesselImages = [
    "https://images.pexels.com/photos/14828204/pexels-photo-14828204.jpeg",
    "https://images.pexels.com/photos/3197704/pexels-photo-3197704.jpeg",
    "https://images.pexels.com/photos/16169311/pexels-photo-16169311.jpeg",
    "https://images.pexels.com/photos/32300738/pexels-photo-32300738.jpeg",
    "https://images.pexels.com/photos/20285580/pexels-photo-20285580.jpeg",
    "https://images.pexels.com/photos/32253344/pexels-photo-32253344.jpeg"
  ]

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const result = await searchEngine.performIntelligentSearch(query)
      setSearchResponse(result)
      if (result.type === 'clarification_needed') {
        setClarificationAnswers(new Array(result.questions?.length || 0).fill(''))
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResponse({
        type: 'error',
        message: 'Search failed. Please try again.',
        fallbackSuggestion: 'Try using specific terms like "PSV North Sea DP2"'
      })
    }
    setIsSearching(false)
  }

  const handleClarification = async () => {
    if (!searchResponse || searchResponse.type !== 'clarification_needed') return

    const combinedAnswers = clarificationAnswers.filter(a => a.trim()).join('. ')
    if (!combinedAnswers) return

    setIsSearching(true)
    try {
      const result = await searchEngine.handleClarificationResponse(query, combinedAnswers, {})
      setSearchResponse(result)
    } catch (error) {
      console.error('Clarification error:', error)
    }
    setIsSearching(false)
  }

  const exampleQueries = [
    "PSV DP2 North Sea immediate",
    "AHTS 120T bollard pull Gulf of Mexico", 
    "Crew boat Malaysia 30 passengers",
    "Dive support vessel with crane Brazil"
  ]

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">AI-Powered OSV Search</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Describe what you need in plain English - our AI will find the perfect offshore support vessel for your operation.
        </p>
      </div>

      {/* Search Input */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., 'Need a PSV DP2 for North Sea, 30 days' or 'AHTS with 100T bollard pull for towing job'"
                className="h-12 text-base"
                disabled={isSearching}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              size="lg"
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Example Queries */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-gray-600 mr-2">Try:</span>
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(example)}
                className="text-xs"
                disabled={isSearching}
              >
                "{example}"
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Status */}
      {isSearching && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              <span className="text-blue-800 font-medium">
                AI is analyzing your request and searching through 96+ vessels...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clarification Questions */}
      {searchResponse?.type === 'clarification_needed' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-800">Help us find the perfect vessel</h3>
              </div>
              
              <p className="text-orange-700">
                We understood: <strong>{JSON.stringify(searchResponse.partialParams)}</strong>
              </p>

              <div className="space-y-3">
                {searchResponse.questions?.map((question, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-orange-800 mb-1">
                      {question}
                    </label>
                    <Input
                      value={clarificationAnswers[index] || ''}
                      onChange={(e) => {
                        const newAnswers = [...clarificationAnswers]
                        newAnswers[index] = e.target.value
                        setClarificationAnswers(newAnswers)
                      }}
                      placeholder="Your answer..."
                      className="border-orange-200"
                    />
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleClarification}
                disabled={isSearching || !clarificationAnswers.some(a => a.trim())}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Search with Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResponse?.type === 'search_results' && (
        <div className="space-y-6">
          {/* Results Header */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Found {searchResponse.totalFound} vessel{searchResponse.totalFound !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  <strong>AI understood:</strong> {searchResponse.queryUnderstood}
                </div>
                {searchResponse.appliedFilters && Object.keys(searchResponse.appliedFilters).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(searchResponse.appliedFilters).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="bg-green-100 text-green-800">
                        {key}: {String(value)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Grid */}
          {searchResponse.results && searchResponse.results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResponse.results.map((vessel, index) => {
                const imageUrl = vesselImages[index % vesselImages.length]
                
                return (
                  <Link key={vessel.id} href={`/marketplace/${vessel.id}`}>
                    <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={vessel.vessel_name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-white/90 text-gray-800">
                            {vessel.vessel_type}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs font-semibold">{Math.round((vessel.matchScore || 0.7) * 5 * 10) / 10}</span>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {vessel.vessel_name}
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{vessel.location}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{vessel.length_overall}m LOA</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{vessel.passenger_capacity} crew</span>
                            </div>
                            {vessel.bollard_pull && (
                              <div className="flex items-center text-gray-600">
                                <Anchor className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{vessel.bollard_pull}T pull</span>
                              </div>
                            )}
                            {vessel.dynamic_positioning && (
                              <div className="flex items-center text-gray-600">
                                <Ship className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{vessel.dynamic_positioning}</span>
                              </div>
                            )}
                          </div>

                          {vessel.matchExplanation && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>AI Match:</strong> {vessel.matchExplanation}
                              </p>
                              <div className="text-xs text-blue-600 mt-1">
                                Match Score: {Math.round((vessel.matchScore || 0.7) * 100)}%
                              </div>
                            </div>
                          )}

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div>
                              {vessel.daily_rate && (
                                <span className="text-xl font-bold text-gray-900">
                                  ${vessel.daily_rate.toLocaleString()}
                                </span>
                              )}
                              <span className="text-gray-600 ml-1">/ day</span>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <Ship className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No vessels found</h3>
                <p className="text-gray-600 mb-4">
                  Try broadening your search criteria or use different terms.
                </p>
                <div className="space-y-2">
                  {searchResponse.suggestions?.map((suggestion, index) => (
                    <Button key={index} variant="outline" size="sm" onClick={() => setQuery(suggestion)}>
                      Try: {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Error State */}
      {searchResponse?.type === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">{searchResponse.message}</h3>
                {searchResponse.fallbackSuggestion && (
                  <p className="text-sm text-red-700 mt-1">{searchResponse.fallbackSuggestion}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
