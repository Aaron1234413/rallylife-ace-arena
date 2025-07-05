import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Set the user context from the JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }

    // Parse request body
    const { message }: FeedbackRequest = await req.json();

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 2000 characters)' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }

    // Insert feedback into database
    const { data, error } = await supabase
      .from('user_feedback')
      .insert([
        {
          user_id: user.id,
          message: message.trim(),
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }

    console.log('Feedback submitted successfully:', {
      feedbackId: data.id,
      userId: user.id,
      messageLength: message.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        feedback: {
          id: data.id,
          message: data.message,
          status: data.status,
          created_at: data.created_at
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-feedback function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);