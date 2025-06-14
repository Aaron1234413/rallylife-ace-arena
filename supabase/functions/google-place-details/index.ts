
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
    const { place_id } = await req.json()
    
    if (!place_id) {
      throw new Error('place_id is required')
    }

    // Get the Google Places API key from Supabase secrets
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!apiKey) {
      throw new Error('Google Places API key not configured')
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,formatted_phone_number,formatted_address,opening_hours,website,photos,price_level,geometry&key=${apiKey}`

    console.log('Making Google Place Details API request for:', place_id)

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Place Details API error:', data)
      throw new Error(`Google Place Details API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    return new Response(
      JSON.stringify({
        result: data.result,
        status: data.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in google-place-details function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while getting place details' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
