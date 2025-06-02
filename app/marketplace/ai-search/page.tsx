import { IntelligentSearch } from "@/components/intelligent-search"

export default function AISearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧠 AI-Powered Vessel Search
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Describe your maritime operation needs in plain English. Our AI will understand your requirements 
            and find the perfect offshore support vessel for your project.
          </p>
        </div>

        {/* AI Search Interface */}
        <IntelligentSearch />
      </div>
    </div>
  )
}