import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ship } from "lucide-react"

export default function MarketplaceNotFound() {
  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center text-center">
      <Ship className="h-24 w-24 text-gray-300 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Vessel Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The vessel you're looking for might have sailed away or doesn't exist.
      </p>
      <Button asChild>
        <Link href="/marketplace">Return to Marketplace</Link>
      </Button>
    </div>
  )
}
