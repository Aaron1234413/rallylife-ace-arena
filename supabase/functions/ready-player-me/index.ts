
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
    // For Ready Player Me, we'll create a simple avatar URL since full API integration requires webhook setup
    // This is a simplified version that generates a placeholder avatar URL
    const avatarUrl = `https://models.readyplayer.me/placeholder.glb?gender=${avatarData.gender || 'male'}&bodyType=${avatarData.bodyType || 'fullbody'}`;
    
    // Save avatar URL to user profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ready_player_me_url: avatarUrl })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl: avatarUrl,
        message: "Avatar created successfully"
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

    if (profileError) {
      throw new Error("Failed to get user profile");
    }

    // Create updated avatar URL
    const updatedAvatarUrl = `https://models.readyplayer.me/updated.glb?gender=${avatarData.gender || 'male'}&bodyType=${avatarData.bodyType || 'fullbody'}&timestamp=${Date.now()}`;
    
    // Update avatar URL in profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ready_player_me_url: updatedAvatarUrl })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl: updatedAvatarUrl,
        message: "Avatar updated successfully"
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
    // Return mock assets for now since the full Ready Player Me API requires additional setup
    const mockAssets = [
      {
        id: "tennis_shirt_1",
        name: "Tennis Polo Shirt",
        type: "clothing",
        category: "clothing",
        iconUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
        previewUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop"
      },
      {
        id: "tennis_shorts_1",
        name: "Tennis Shorts",
        type: "clothing",
        category: "clothing",
        iconUrl: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=100&h=100&fit=crop",
        previewUrl: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=300&h=300&fit=crop"
      },
      {
        id: "tennis_shoes_1",
        name: "Tennis Shoes",
        type: "footwear",
        category: "clothing",
        iconUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop",
        previewUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop"
      },
      {
        id: "tennis_racket_1",
        name: "Tennis Racket",
        type: "equipment",
        category: "equipment",
        iconUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop",
        previewUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop"
      }
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        assets: mockAssets
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
