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
    const { lat, lng } = await req.json()
    
    if (!lat || !lng) {
      throw new Error('Latitude and longitude are required')
    }
    
    // Get the Google Places API key from Supabase secrets
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!apiKey) {
      throw new Error('Google Places API key not configured')
    }

    // Build the reverse geocoding URL
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`

    console.log('Making Google Reverse Geocoding API request:', { lat, lng })

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Reverse Geocoding API error:', data)
      throw new Error(`Google Reverse Geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
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
    console.error('Error in google-reverse-geocode function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while reverse geocoding' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})