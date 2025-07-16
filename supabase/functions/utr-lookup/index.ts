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
    
    // Validate required parameters
    if (!firstName || !lastName || !userId) {
      console.error('Missing required parameters:', { firstName, lastName, userId });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: firstName, lastName, and userId are required',
          fallback_required: true
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize and normalize names
    const sanitizedFirstName = firstName.trim();
    const sanitizedLastName = lastName.trim();
    
    console.log(`UTR lookup request for: ${sanitizedFirstName} ${sanitizedLastName}, email: ${email}, userId: ${userId}`);

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

    // Search for player in UTR database with various name formats
    const searchUrl = `https://api.universaltennis.com/v2/search/players`;
    
    // Try multiple search variations for better matching
    const searchQueries = [
      `${sanitizedFirstName} ${sanitizedLastName}`, // Full name
      `${sanitizedLastName}, ${sanitizedFirstName}`, // Last, First format
      `${sanitizedFirstName.charAt(0)}. ${sanitizedLastName}`, // Initial format
      `${sanitizedFirstName} ${sanitizedLastName.charAt(0)}.` // First name + last initial
    ];
    
    let bestMatch = null;
    let searchResults = [];

    // Try each search query until we find a good match
    for (const query of searchQueries) {
      const searchParams = new URLSearchParams({
        query: query,
        top: '10'
      });

      console.log(`Searching UTR API: ${searchUrl}?${searchParams}`);

      try {
        const searchResponse = await fetch(`${searchUrl}?${searchParams}`, {
          headers: {
            'Authorization': `Bearer ${utrApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!searchResponse.ok) {
          console.warn(`UTR API search failed for query "${query}": ${searchResponse.status} ${searchResponse.statusText}`);
          continue; // Try next query
        }

        const searchData: UTRSearchResponse = await searchResponse.json();
        console.log(`UTR search for "${query}" returned ${searchData.hits?.length || 0} results`);

        if (searchData.hits && searchData.hits.length > 0) {
          searchResults = [...searchResults, ...searchData.hits];
          
          // Find exact match for this query
          const exactMatch = searchData.hits.find(hit => {
            if (!hit.firstName || !hit.lastName) {
              console.warn('UTR result missing name data:', hit);
              return false;
            }
            
            const firstNameMatch = hit.firstName.toLowerCase().trim() === sanitizedFirstName.toLowerCase();
            const lastNameMatch = hit.lastName.toLowerCase().trim() === sanitizedLastName.toLowerCase();
            return firstNameMatch && lastNameMatch;
          });

          if (exactMatch) {
            bestMatch = exactMatch;
            console.log(`Found exact match with query "${query}": ${exactMatch.displayName || `${exactMatch.firstName} ${exactMatch.lastName}`}`);
            break; // Stop searching if we found an exact match
          }
        }
      } catch (searchError) {
        console.warn(`Error searching with query "${query}":`, searchError);
        continue; // Try next query
      }
    }

    // If no exact match found, use fuzzy matching from all results
    if (!bestMatch && searchResults.length > 0) {
      // Remove duplicates and find the best fuzzy match
      const uniqueResults = searchResults.filter((result, index, self) => 
        index === self.findIndex(r => r.id === result.id)
      );

      // Score matches based on name similarity
      const scoredMatches = uniqueResults.map(hit => {
        if (!hit.firstName || !hit.lastName) {
          return { hit, score: 0 };
        }

        let score = 0;
        const hitFirstName = hit.firstName.toLowerCase().trim();
        const hitLastName = hit.lastName.toLowerCase().trim();
        const targetFirstName = sanitizedFirstName.toLowerCase();
        const targetLastName = sanitizedLastName.toLowerCase();

        // Exact name matches get highest score
        if (hitFirstName === targetFirstName) score += 50;
        if (hitLastName === targetLastName) score += 50;

        // Partial matches get lower scores
        if (hitFirstName.includes(targetFirstName) || targetFirstName.includes(hitFirstName)) score += 25;
        if (hitLastName.includes(targetLastName) || targetLastName.includes(hitLastName)) score += 25;

        // Name initials matching
        if (hitFirstName.charAt(0) === targetFirstName.charAt(0)) score += 10;
        if (hitLastName.charAt(0) === targetLastName.charAt(0)) score += 10;

        return { hit, score };
      });

      // Sort by score and take the best match if score is reasonable
      scoredMatches.sort((a, b) => b.score - a.score);
      
      if (scoredMatches[0] && scoredMatches[0].score >= 50) {
        bestMatch = scoredMatches[0].hit;
        console.log(`Using fuzzy match: ${bestMatch.displayName || `${bestMatch.firstName} ${bestMatch.lastName}`} (score: ${scoredMatches[0].score})`);
      }
    }

    let utrRating = null;
    let utrVerified = false;

    if (bestMatch) {
      // Safely extract UTR rating with null checks
      utrRating = bestMatch.singlesUtr || bestMatch.doublesUtr || null;
      
      // Only consider it verified if we have a high confidence rating
      utrVerified = !!(bestMatch.utrConfidence === 'HIGH' && utrRating);
      
      console.log(`Found UTR match: ${bestMatch.displayName || `${bestMatch.firstName} ${bestMatch.lastName}`}, UTR: ${utrRating}, Verified: ${utrVerified}`);
    }

    // Update user profile with UTR data
    if (utrRating && utrRating > 0) {
      try {
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
      } catch (updateError) {
        console.error('Failed to update user profile:', updateError);
        // Don't fail the whole request if database update fails
      }

      console.log(`Successfully updated profile ${userId} with UTR: ${utrRating}`);

        return new Response(
          JSON.stringify({
            success: true,
            utr_rating: utrRating,
            utr_verified: utrVerified,
            player_name: bestMatch?.displayName || `${bestMatch?.firstName || ''} ${bestMatch?.lastName || ''}`.trim(),
            source: 'utr_api',
            search_confidence: utrVerified ? 'high' : 'medium'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log(`No valid UTR rating found for ${sanitizedFirstName} ${sanitizedLastName}. Searched ${searchQueries.length} name variations.`);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No UTR rating found',
            fallback_required: true,
            searched_name: `${sanitizedFirstName} ${sanitizedLastName}`,
            search_attempts: searchQueries.length,
            suggestions: bestMatch ? [`Found player "${bestMatch.displayName || `${bestMatch.firstName} ${bestMatch.lastName}`}" but no valid UTR rating`] : ['Try different name variations or check spelling']
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

  } catch (error) {
    console.error('Error in utr-lookup function:', error);
    
    // Provide more specific error information
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;
    
    if (error instanceof TypeError) {
      errorMessage = 'Invalid request format or network error';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
      
      // Determine appropriate status code based on error type
      if (error.message.includes('UTR API error: 401')) {
        errorMessage = 'UTR API authentication failed';
        statusCode = 401;
      } else if (error.message.includes('UTR API error: 403')) {
        errorMessage = 'UTR API access forbidden';
        statusCode = 403;
      } else if (error.message.includes('UTR API error: 429')) {
        errorMessage = 'UTR API rate limit exceeded';
        statusCode = 429;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        fallback_required: true,
        error_type: error.constructor.name,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});