"use client"

import { X, Calendar, MapPin, Clock, DollarSign, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/contexts/CartContext"
import { useState } from "react"

export function CartSidebar() {
  const { state, removeFromCart, updateCartItem, clearCart, toggleCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleDateChange = (itemId: string, field: 'start_date' | 'end_date', value: string) => {
    updateCartItem(itemId, { [field]: value })
    
    // Calculate duration if both dates are set
    const item = state.items.find(i => i.id === itemId)
    if (item && item.start_date && item.end_date) {
      const start = new Date(item.start_date)
      const end = new Date(item.end_date)
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      
      if (duration > 0) {
        const dailyRate = item.daily_rate || 0
        const estimatedCost = duration * dailyRate
        updateCartItem(itemId, { 
          duration_days: duration,
          estimated_cost: estimatedCost
        })
      }
    }
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Here you would typically send the cart data to your backend
    console.log('Submitting order:', state.items)
    
    // Clear cart and close sidebar
    clearCart()
    toggleCart()
    setIsCheckingOut(false)
    
    // Show success message (you could use a toast here)
    alert('Order submitted successfully! Our team will contact you shortly.')
  }

  return (
    <Sheet open={state.isOpen} onOpenChange={toggleCart}>
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">
                Your Cart ({state.items.length})
              </SheetTitle>
              <Button variant="ghost" size="sm" onClick={toggleCart}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-4">Add vessels to your cart to request quotes</p>
                <Button onClick={toggleCart} className="bg-accent hover:bg-accent-dark">
                  Browse Vessels
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {state.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.vessel_name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Badge variant="secondary" className="mr-2">
                            {item.vessel_type}
                          </Badge>
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.location}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`start-${item.id}`} className="text-xs">Start Date</Label>
                        <Input
                          id={`start-${item.id}`}
                          type="date"
                          value={item.start_date || ''}
                          onChange={(e) => handleDateChange(item.id, 'start_date', e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`end-${item.id}`} className="text-xs">End Date</Label>
                        <Input
                          id={`end-${item.id}`}
                          type="date"
                          value={item.end_date || ''}
                          onChange={(e) => handleDateChange(item.id, 'end_date', e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    {item.duration_days && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration: {item.duration_days} days</span>
                        {item.estimated_cost && (
                          <span className="font-semibold text-green-600">
                            ${item.estimated_cost.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    <div>
                      <Label htmlFor={`operation-${item.id}`} className="text-xs">Operation Type</Label>
                      <Input
                        id={`operation-${item.id}`}
                        placeholder="e.g., Drilling support, Pipeline installation"
                        value={item.operation_type || ''}
                        onChange={(e) => updateCartItem(item.id, { operation_type: e.target.value })}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`notes-${item.id}`} className="text-xs">Special Requirements</Label>
                      <Textarea
                        id={`notes-${item.id}`}
                        placeholder="Any special requirements or notes..."
                        value={item.notes || ''}
                        onChange={(e) => updateCartItem(item.id, { notes: e.target.value })}
                        className="text-xs resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-6 space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Estimated Total</span>
                  <span className="text-green-600">
                    ${state.total.toLocaleString()}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600">
                  * Final pricing subject to availability and contract terms
                </p>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-accent hover:bg-accent-dark text-white"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || state.items.some(item => !item.start_date || !item.end_date)}
                  >
                    {isCheckingOut ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting Order...
                      </div>
                    ) : (
                      'Submit Order'
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                    disabled={isCheckingOut}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}