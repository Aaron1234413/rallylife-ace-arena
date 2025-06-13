
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ready Player Me configuration - using their recommended approach
const RPM_SUBDOMAIN = "demo"; // This should be replaced with your actual subdomain
const RPM_BASE_URL = `https://${RPM_SUBDOMAIN}.readyplayer.me`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }

    const { action, ...body } = await req.json();
    
    switch (action) {
      case "get_avatar_url":
        return await getAvatarUrl(userData.user.id, supabaseClient);
      case "save_avatar_url":
        return await saveAvatarUrl(body.avatarUrl, userData.user.id, supabaseClient);
      case "validate_avatar":
        return await validateAvatar(body.avatarUrl);
      case "test_connection":
        return await testConnection();
      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    console.error("Ready Player Me API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});

async function testConnection() {
  try {
    console.log("Testing Ready Player Me connection...");
    console.log("Using subdomain:", RPM_SUBDOMAIN);
    console.log("Base URL:", RPM_BASE_URL);
    
    // Test the Ready Player Me iframe URL
    const testUrl = `${RPM_BASE_URL}/avatar?frameApi`;
    
    const response = await fetch(testUrl, {
      method: "HEAD",
    });

    console.log("Connection test response status:", response.status);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Ready Player Me connection successful",
        baseUrl: RPM_BASE_URL,
        status: response.status
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Connection test failed:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Connection test failed: ${error.message}`,
        baseUrl: RPM_BASE_URL
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  }
}

async function getAvatarUrl(userId: string, supabase: any) {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("ready_player_me_url")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl: profile?.ready_player_me_url || null 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    throw new Error(`Failed to get avatar: ${error.message}`);
  }
}

async function saveAvatarUrl(avatarUrl: string, userId: string, supabase: any) {
  try {
    console.log("Saving avatar URL:", avatarUrl, "for user:", userId);
    
    // Validate the avatar URL format
    if (!avatarUrl || !avatarUrl.includes('readyplayer.me')) {
      throw new Error("Invalid Ready Player Me avatar URL");
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ready_player_me_url: avatarUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Avatar URL saved successfully",
        avatarUrl: avatarUrl
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Save avatar error:", error);
    throw new Error(`Failed to save avatar: ${error.message}`);
  }
}

async function validateAvatar(avatarUrl: string) {
  try {
    console.log("Validating avatar URL:", avatarUrl);
    
    if (!avatarUrl || !avatarUrl.includes('readyplayer.me')) {
      throw new Error("Invalid Ready Player Me avatar URL");
    }

    // Try to fetch the avatar to verify it exists
    const response = await fetch(avatarUrl, {
      method: "HEAD",
    });

    const isValid = response.ok;

    return new Response(
      JSON.stringify({ 
        success: true, 
        valid: isValid,
        avatarUrl: avatarUrl,
        status: response.status
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Validate avatar error:", error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        valid: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  }
}
