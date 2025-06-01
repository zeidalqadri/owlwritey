"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'

export interface WishlistItem {
  id: string
  vessel_name: string
  vessel_type: string
  daily_rate?: number
  weekly_rate?: number
  monthly_rate?: number
  location: string
  saved_at: string
  expires_at: string
  when_needed?: string
  operation_type?: string
  notes?: string
  priority?: 'low' | 'medium' | 'high'
}

interface WishlistState {
  items: WishlistItem[]
  isOpen: boolean
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<WishlistItem> } }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_WISHLIST_OPEN'; payload: boolean }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] }
  | { type: 'REMOVE_EXPIRED' }

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        return state // Don't add duplicate items
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      }
    
    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: []
      }
    
    case 'SET_WISHLIST_OPEN':
      return {
        ...state,
        isOpen: action.payload
      }
    
    case 'LOAD_WISHLIST':
      return {
        ...state,
        items: action.payload
      }
    
    case 'REMOVE_EXPIRED':
      const now = new Date()
      return {
        ...state,
        items: state.items.filter(item => new Date(item.expires_at) > now)
      }
    
    default:
      return state
  }
}

const WishlistContext = createContext<{
  state: WishlistState
  dispatch: React.Dispatch<WishlistAction>
  addToWishlist: (item: Omit<WishlistItem, 'saved_at' | 'expires_at'>) => void
  removeFromWishlist: (id: string) => void
  updateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void
  clearWishlist: () => void
  toggleWishlist: () => void
  getWishlistItemCount: () => number
  isInWishlist: (id: string) => boolean
  removeExpiredItems: () => void
} | null>(null)

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    isOpen: false
  })

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('marimar-wishlist')
    if (savedWishlist) {
      try {
        const wishlistData = JSON.parse(savedWishlist)
        dispatch({ type: 'LOAD_WISHLIST', payload: wishlistData })
        dispatch({ type: 'REMOVE_EXPIRED' })
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('marimar-wishlist', JSON.stringify(state.items))
  }, [state.items])

  // Clean up expired items periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'REMOVE_EXPIRED' })
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const addToWishlist = (item: Omit<WishlistItem, 'saved_at' | 'expires_at'>) => {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days from now
    
    const wishlistItem: WishlistItem = {
      ...item,
      saved_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    }
    
    dispatch({ type: 'ADD_ITEM', payload: wishlistItem })
  }

  const removeFromWishlist = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateWishlistItem = (id: string, updates: Partial<WishlistItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } })
  }

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' })
  }

  const toggleWishlist = () => {
    dispatch({ type: 'SET_WISHLIST_OPEN', payload: !state.isOpen })
  }

  const getWishlistItemCount = () => state.items.length

  const isInWishlist = (id: string) => state.items.some(item => item.id === id)

  const removeExpiredItems = () => {
    dispatch({ type: 'REMOVE_EXPIRED' })
  }

  return (
    <WishlistContext.Provider
      value={{
        state,
        dispatch,
        addToWishlist,
        removeFromWishlist,
        updateWishlistItem,
        clearWishlist,
        toggleWishlist,
        getWishlistItemCount,
        isInWishlist,
        removeExpiredItems
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}