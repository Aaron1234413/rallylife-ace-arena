import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UTRProfile {
  utr: number;
  verified: boolean;
  playerId?: string;
  firstName?: string;
  lastName?: string;
}

interface UTRSearchResponse {
  hits: Array<{
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    singlesUtr: number;
    doublesUtr: number;
    utrConfidence: string;
    city?: string;
    state?: string;
    country?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { firstName, lastName, email, userId } = await req.json();
    
    console.log(`UTR lookup request for: ${firstName} ${lastName}, email: ${email}, userId: ${userId}`);

    // Check if we already have verified UTR data for this user
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('utr_rating, utr_verified')
      .eq('id', userId)
      .single();

    if (existingProfile?.utr_verified && existingProfile.utr_rating) {
      console.log(`User ${userId} already has verified UTR: ${existingProfile.utr_rating}`);
      return new Response(
        JSON.stringify({
          success: true,
          utr_rating: existingProfile.utr_rating,
          utr_verified: true,
          source: 'cached'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const utrApiKey = Deno.env.get('UTR_API_KEY');
    
    if (!utrApiKey) {
      console.warn('UTR_API_KEY not configured, skipping UTR lookup');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'UTR API not configured',
          fallback_required: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for player in UTR database
    const searchUrl = `https://api.universaltennis.com/v2/search/players`;
    const searchParams = new URLSearchParams({
      query: `${firstName} ${lastName}`,
      top: '10'
    });

    console.log(`Searching UTR API: ${searchUrl}?${searchParams}`);

    const searchResponse = await fetch(`${searchUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${utrApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      console.error(`UTR API search failed: ${searchResponse.status} ${searchResponse.statusText}`);
      throw new Error(`UTR API error: ${searchResponse.status}`);
    }

    const searchData: UTRSearchResponse = await searchResponse.json();
    console.log(`UTR search returned ${searchData.hits?.length || 0} results`);

    let bestMatch = null;
    let utrRating = null;
    let utrVerified = false;

    // Find the best match based on name similarity and location if available
    if (searchData.hits && searchData.hits.length > 0) {
      // Simple name matching - in production, you might want more sophisticated matching
      bestMatch = searchData.hits.find(hit => {
        const nameMatch = hit.firstName.toLowerCase() === firstName.toLowerCase() && 
                         hit.lastName.toLowerCase() === lastName.toLowerCase();
        return nameMatch;
      });

      // If no exact match, take the first result (could be enhanced with fuzzy matching)
      if (!bestMatch && searchData.hits.length > 0) {
        bestMatch = searchData.hits[0];
        console.log(`No exact name match found, using first result: ${bestMatch.displayName}`);
      }

      if (bestMatch) {
        // Use singles UTR as primary rating
        utrRating = bestMatch.singlesUtr || bestMatch.doublesUtr;
        utrVerified = bestMatch.utrConfidence === 'HIGH';
        
        console.log(`Found UTR match: ${bestMatch.displayName}, UTR: ${utrRating}, Verified: ${utrVerified}`);
      }
    }

    // Update user profile with UTR data
    if (utrRating) {
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          utr_rating: utrRating,
          utr_verified: utrVerified,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile with UTR data:', updateError);
        throw updateError;
      }

      console.log(`Successfully updated profile ${userId} with UTR: ${utrRating}`);

      return new Response(
        JSON.stringify({
          success: true,
          utr_rating: utrRating,
          utr_verified: utrVerified,
          player_name: bestMatch?.displayName,
          source: 'utr_api'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log(`No UTR rating found for ${firstName} ${lastName}`);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No UTR rating found',
          fallback_required: true,
          searched_name: `${firstName} ${lastName}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in utr-lookup function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fallback_required: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});