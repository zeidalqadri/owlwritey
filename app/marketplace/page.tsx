import { IntelligentSearch } from "@/components/intelligent-search"

export default async function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            OSV Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find the perfect offshore support vessel using our intelligent AI search. 
            Simply describe your needs in plain English and let our AI do the rest.
          </p>
        </div>

        {/* AI Search Interface */}
        <IntelligentSearch />
      </div>
    </div>
  )
}
