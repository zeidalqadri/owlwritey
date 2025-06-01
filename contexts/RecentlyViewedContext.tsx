"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'

export interface RecentlyViewedItem {
  id: string
  vessel_name: string
  vessel_type: string
  daily_rate?: number
  location: string
  viewed_at: string
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[]
}

type RecentlyViewedAction =
  | { type: 'ADD_ITEM'; payload: RecentlyViewedItem }
  | { type: 'LOAD_ITEMS'; payload: RecentlyViewedItem[] }
  | { type: 'CLEAR_ITEMS' }

const recentlyViewedReducer = (state: RecentlyViewedState, action: RecentlyViewedAction): RecentlyViewedState => {
  switch (action.type) {
    case 'ADD_ITEM':
      // Remove the item if it already exists, then add it to the front
      const filteredItems = state.items.filter(item => item.id !== action.payload.id)
      const newItems = [action.payload, ...filteredItems].slice(0, 10) // Keep only 10 most recent
      return {
        ...state,
        items: newItems
      }
    
    case 'LOAD_ITEMS':
      return {
        ...state,
        items: action.payload
      }
    
    case 'CLEAR_ITEMS':
      return {
        ...state,
        items: []
      }
    
    default:
      return state
  }
}

const RecentlyViewedContext = createContext<{
  state: RecentlyViewedState
  addToRecentlyViewed: (item: Omit<RecentlyViewedItem, 'viewed_at'>) => void
  clearRecentlyViewed: () => void
  getRecentlyViewed: () => RecentlyViewedItem[]
} | null>(null)

export const RecentlyViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(recentlyViewedReducer, {
    items: []
  })

  // Load recently viewed from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('marimar-recently-viewed')
    if (savedItems) {
      try {
        const itemsData = JSON.parse(savedItems)
        dispatch({ type: 'LOAD_ITEMS', payload: itemsData })
      } catch (error) {
        console.error('Error loading recently viewed from localStorage:', error)
      }
    }
  }, [])

  // Save recently viewed to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('marimar-recently-viewed', JSON.stringify(state.items))
  }, [state.items])

  const addToRecentlyViewed = (item: Omit<RecentlyViewedItem, 'viewed_at'>) => {
    const recentlyViewedItem: RecentlyViewedItem = {
      ...item,
      viewed_at: new Date().toISOString()
    }
    
    dispatch({ type: 'ADD_ITEM', payload: recentlyViewedItem })
  }

  const clearRecentlyViewed = () => {
    dispatch({ type: 'CLEAR_ITEMS' })
  }

  const getRecentlyViewed = () => state.items

  return (
    <RecentlyViewedContext.Provider
      value={{
        state,
        addToRecentlyViewed,
        clearRecentlyViewed,
        getRecentlyViewed
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext)
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider')
  }
  return context
}