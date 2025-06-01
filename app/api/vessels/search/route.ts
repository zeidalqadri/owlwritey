import { NextRequest, NextResponse } from 'next/server'
import { getServerSideSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract search parameters from AI analysis
    const vesselType = searchParams.get('type')
    const location = searchParams.get('location')
    const dpClass = searchParams.get('dp')
    const minBollardPull = searchParams.get('minBollardPull')
    const minLength = searchParams.get('minLength')
    const minCapacity = searchParams.get('minCapacity')
    const maxRate = searchParams.get('maxRate')
    
    // Also check for direct query parameter (for frontend search)
    const directQuery = searchParams.get('query')

    console.log('AI Search API Parameters:', {
      vesselType,
      location,
      dpClass,
      minBollardPull,
      minLength,
      minCapacity,
      maxRate,
      directQuery
    })

    // If we have a direct query, we need to return an appropriate response
    // For now, let's return all vessels and let the AI handle filtering
    if (directQuery) {
      console.log('Direct query detected:', directQuery)
      // This endpoint is called by the AI system, so return all vessels
      // The AI will handle the intelligent filtering
    }

    const supabase = getServerSideSupabase()

    // Start with base query for active, marketplace-visible vessels
    let query = supabase
      .from('vessels')
      .select('*')
      .eq('marketplace_visible', true)
      .eq('status', 'Active')

    // Apply filters only if we have extracted parameters (not for direct queries)
    if (!directQuery) {
      if (vesselType) {
        if (vesselType === 'PSV') {
          query = query.eq('vessel_type', 'PSV')
        } else if (vesselType === 'AHTS') {
          query = query.eq('vessel_type', 'AHTS')
        } else if (vesselType === 'Crew Boat') {
          query = query.eq('vessel_type', 'Crew Boat')
        } else if (vesselType === 'OSV') {
          query = query.in('vessel_type', ['OSV', 'PSV', 'AHTS'])
        } else {
          // Try exact match first, then contains
          query = query.or(`vessel_type.eq.${vesselType},vessel_type.ilike.%${vesselType}%`)
        }
      }

      if (location) {
        query = query.ilike('location', `%${location}%`)
      }

      if (dpClass) {
        const normalizedDP = dpClass.replace(/[-\s]/g, '-').replace('DP', 'DP-')
        query = query.eq('dynamic_positioning', normalizedDP)
      }

      if (minBollardPull) {
        const minPull = parseFloat(minBollardPull)
        if (!isNaN(minPull)) {
          query = query.gte('bollard_pull', minPull)
        }
      }

      if (minLength) {
        const minLen = parseFloat(minLength)
        if (!isNaN(minLen)) {
          query = query.gte('length_overall', minLen)
        }
      }

      if (minCapacity) {
        const minCap = parseInt(minCapacity)
        if (!isNaN(minCap)) {
          query = query.gte('passenger_capacity', minCap)
        }
      }

      if (maxRate) {
        const maxR = parseFloat(maxRate)
        if (!isNaN(maxR)) {
          query = query.lte('daily_rate', maxR)
        }
      }
    }

    // Execute query
    const { data: vessels, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Supabase search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    console.log(`AI Search API returning ${vessels?.length || 0} vessels`)

    // Return vessels with consistent field names for the AI
    const formattedVessels = (vessels || []).map(vessel => ({
      id: vessel.id,
      vessel_name: vessel.vessel_name,
      vessel_type: vessel.vessel_type,
      location: vessel.location,
      daily_rate: vessel.daily_rate,
      weekly_rate: vessel.weekly_rate,
      length_overall: vessel.length_overall,
      passenger_capacity: vessel.passenger_capacity,
      bollard_pull: vessel.bollard_pull,
      dynamic_positioning: vessel.dynamic_positioning,
      year_built: vessel.year_built,
      description: vessel.description
    }))

    return NextResponse.json(formattedVessels)

  } catch (error) {
    console.error('AI Search API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
