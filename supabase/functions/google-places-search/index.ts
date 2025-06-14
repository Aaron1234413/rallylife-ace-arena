
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, location, radius = 5000, type = 'establishment' } = await req.json()
    
    // Get the Google Places API key from Supabase secrets
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!apiKey) {
      throw new Error('Google Places API key not configured')
    }

    // Build the search URL
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=${type}&key=${apiKey}`
    
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=${radius}`
    }

    console.log('Making Google Places API request:', { query, location, radius, type })

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data)
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    return new Response(
      JSON.stringify({
        results: data.results || [],
        status: data.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in google-places-search function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while searching for places' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
