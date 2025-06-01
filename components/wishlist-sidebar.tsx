"use client"

import { X, Calendar, MapPin, Clock, Star, AlertCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWishlist } from "@/contexts/WishlistContext"
import { useCart } from "@/contexts/CartContext"
import { useState } from "react"

export function WishlistSidebar() {
  const { state, removeFromWishlist, updateWishlistItem, clearWishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const moveToCart = (item: any) => {
    // Convert wishlist item to cart item
    const cartItem = {
      id: item.id,
      vessel_name: item.vessel_name,
      vessel_type: item.vessel_type,
      daily_rate: item.daily_rate,
      weekly_rate: item.weekly_rate,
      monthly_rate: item.monthly_rate,
      location: item.location,
      operation_type: item.operation_type,
      notes: item.notes
    }
    
    addToCart(cartItem)
    removeFromWishlist(item.id)
  }

  const getExpiryDays = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Sheet open={state.isOpen} onOpenChange={toggleWishlist}>
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">
                Saved Vessels ({state.items.length})
              </SheetTitle>
              <Button variant="ghost" size="sm" onClick={toggleWishlist}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved vessels</h3>
                <p className="text-gray-600 mb-4">Save vessels you're interested in for quick access</p>
                <Button onClick={toggleWishlist} className="bg-accent hover:bg-accent-dark">
                  Browse Vessels
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {state.items.map((item) => {
                  const expiryDays = getExpiryDays(item.expires_at)
                  const isExpiringSoon = expiryDays <= 3
                  const isExpanded = expandedItems.includes(item.id)

                  return (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.vessel_name}</h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Badge variant="secondary" className="mr-2">
                              {item.vessel_type}
                            </Badge>
                            <MapPin className="w-3 h-3 mr-1" />
                            {item.location}
                          </div>
                          
                          {item.daily_rate && (
                            <p className="text-sm font-medium text-green-600 mt-1">
                              ${item.daily_rate.toLocaleString()}/day
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {item.priority && (
                            <Badge variant="outline" className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expiry Warning */}
                      {isExpiringSoon && (
                        <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs text-yellow-800">
                            Expires in {expiryDays} day{expiryDays !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {/* Quick Info */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Saved: {new Date(item.saved_at).toLocaleDateString()}</span>
                          <span>Expires: {new Date(item.expires_at).toLocaleDateString()}</span>
                        </div>
                        {item.when_needed && (
                          <div>When needed: {item.when_needed}</div>
                        )}
                        {item.operation_type && (
                          <div>Operation: {item.operation_type}</div>
                        )}
                      </div>

                      {/* Expand/Collapse Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItemExpanded(item.id)}
                        className="w-full text-xs h-8"
                      >
                        {isExpanded ? 'Show Less' : 'Update Details'}
                      </Button>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="space-y-3 pt-3 border-t">
                          <div>
                            <Label htmlFor={`when-${item.id}`} className="text-xs">When do you need this vessel?</Label>
                            <Input
                              id={`when-${item.id}`}
                              placeholder="e.g., Q3 2024, ASAP, Next month"
                              value={item.when_needed || ''}
                              onChange={(e) => updateWishlistItem(item.id, { when_needed: e.target.value })}
                              className="text-xs"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`operation-${item.id}`} className="text-xs">Operation Type</Label>
                            <Input
                              id={`operation-${item.id}`}
                              placeholder="e.g., Drilling support, Pipeline installation"
                              value={item.operation_type || ''}
                              onChange={(e) => updateWishlistItem(item.id, { operation_type: e.target.value })}
                              className="text-xs"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`priority-${item.id}`} className="text-xs">Priority</Label>
                            <Select
                              value={item.priority || ''}
                              onValueChange={(value) => updateWishlistItem(item.id, { priority: value as 'low' | 'medium' | 'high' })}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Set priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low Priority</SelectItem>
                                <SelectItem value="medium">Medium Priority</SelectItem>
                                <SelectItem value="high">High Priority</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`notes-${item.id}`} className="text-xs">Notes</Label>
                            <Textarea
                              id={`notes-${item.id}`}
                              placeholder="Additional notes or requirements..."
                              value={item.notes || ''}
                              onChange={(e) => updateWishlistItem(item.id, { notes: e.target.value })}
                              className="text-xs resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => moveToCart(item)}
                          className="flex-1 bg-accent hover:bg-accent-dark text-white"
                        >
                          <ShoppingBag className="w-3 h-3 mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to vessel detail page
                            window.location.href = `/marketplace/${item.id}`
                          }}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t p-6 space-y-4">
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Saved vessels expire after 14 days</p>
                  <p>• You'll be notified if others inquire about your saved vessels</p>
                  <p>• High priority vessels get expedited support</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearWishlist}
                >
                  Clear All Saved
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}