import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🕒 Starting session expiration job...');

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Expire open_sessions
    console.log('🔍 Checking for expired open sessions...');
    const { data: openSessionResult, error: openSessionError } = await supabaseClient
      .rpc('expire_open_sessions');

    if (openSessionError) {
      console.error('❌ Error expiring open sessions:', openSessionError);
    } else {
      const result = openSessionResult as any;
      console.log(`✅ Open sessions expired: ${result?.sessions_expired || 0}`);
      console.log(`💰 Total tokens refunded: ${result?.total_tokens_refunded || 0}`);
      console.log(`💵 Total money to refund: ${result?.total_money_refunded || 0}`);
    }

    // Clean up old cancelled/expired sessions (older than 30 days)
    console.log('🧹 Cleaning up old sessions...');
    const { data: cleanupResult, error: cleanupError } = await supabaseClient
      .rpc('cleanup_old_open_sessions');

    if (cleanupError) {
      console.error('❌ Error cleaning up old sessions:', cleanupError);
    } else {
      const result = cleanupResult as any;
      console.log(`🗑️ Old sessions cleaned up: ${result?.sessions_cleaned || 0}`);
    }

    // Summary response
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      open_sessions: {
        expired: openSessionResult?.sessions_expired || 0,
        tokens_refunded: openSessionResult?.total_tokens_refunded || 0,
        money_refunded: openSessionResult?.total_money_refunded || 0
      },
      cleanup: {
        sessions_cleaned: cleanupResult?.sessions_cleaned || 0
      },
      errors: []
    };

    if (openSessionError) {
      summary.errors.push(`Open sessions: ${openSessionError.message}`);
    }
    if (cleanupError) {
      summary.errors.push(`Cleanup: ${cleanupError.message}`);
    }

    console.log('✅ Session expiration job completed:', summary);

    return new Response(
      JSON.stringify(summary),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('❌ Fatal error in session expiration job:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});