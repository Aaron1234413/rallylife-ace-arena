
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ready Player Me API configuration
const RPM_API_KEY = "sk_live_QJzvaO1CtP0_BygC1aKZtpIjV7_WdBKU_vvd";
const RPM_BASE_URL = "https://api.readyplayer.me/v1";

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
      case "create_avatar":
        return await createAvatar(body, userData.user.id, supabaseClient);
      case "update_avatar":
        return await updateAvatar(body, userData.user.id, supabaseClient);
      case "get_avatar":
        return await getAvatar(userData.user.id, supabaseClient);
      case "get_assets":
        return await getAssets();
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

async function createAvatar(avatarData: any, userId: string, supabase: any) {
  try {
    // Create avatar via Ready Player Me API
    const response = await fetch(`${RPM_BASE_URL}/avatars`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RPM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        partner: "rallylife",
        bodyType: avatarData.bodyType || "fullbody",
        gender: avatarData.gender || "male",
        assets: avatarData.assets || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Ready Player Me API error: ${response.statusText}`);
    }

    const rpmAvatar = await response.json();
    
    // Save avatar URL to user profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ready_player_me_url: rpmAvatar.modelUrl })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl: rpmAvatar.modelUrl,
        avatarId: rpmAvatar.id 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    throw new Error(`Failed to create avatar: ${error.message}`);
  }
}

async function updateAvatar(avatarData: any, userId: string, supabase: any) {
  try {
    // Get current avatar from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("ready_player_me_url")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.ready_player_me_url) {
      throw new Error("No existing avatar found");
    }

    // Extract avatar ID from URL
    const avatarId = profile.ready_player_me_url.split('/').pop()?.split('.')[0];
    if (!avatarId) {
      throw new Error("Invalid avatar URL");
    }

    // Update avatar via Ready Player Me API
    const response = await fetch(`${RPM_BASE_URL}/avatars/${avatarId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${RPM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assets: avatarData.assets || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Ready Player Me API error: ${response.statusText}`);
    }

    const updatedAvatar = await response.json();
    
    // Update avatar URL in profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ready_player_me_url: updatedAvatar.modelUrl })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl: updatedAvatar.modelUrl 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    throw new Error(`Failed to update avatar: ${error.message}`);
  }
}

async function getAvatar(userId: string, supabase: any) {
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

async function getAssets() {
  try {
    // Get available assets from Ready Player Me
    const response = await fetch(`${RPM_BASE_URL}/assets`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${RPM_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Ready Player Me API error: ${response.statusText}`);
    }

    const assets = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        assets: assets.data || [] 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    throw new Error(`Failed to get assets: ${error.message}`);
  }
}
