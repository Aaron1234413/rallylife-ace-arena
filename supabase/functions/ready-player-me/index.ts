
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
    console.log("Testing Ready Player Me API connection...");
    
    // Test the API connection with a simple request to get user info
    const response = await fetch(`${RPM_BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${RPM_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("API Response Status:", response.status);
    const responseText = await response.text();
    console.log("API Response Body:", responseText);

    if (!response.ok) {
      throw new Error(`Ready Player Me API error: ${response.status} - ${responseText}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Connection successful",
        status: response.status,
        data: responseText
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Connection test failed:", error);
    throw new Error(`Connection test failed: ${error.message}`);
  }
}

async function createAvatar(avatarData: any, userId: string, supabase: any) {
  try {
    console.log("Creating avatar with data:", avatarData);
    
    // Create avatar via Ready Player Me API
    const response = await fetch(`${RPM_BASE_URL}/avatars`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RPM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        partner: "default", // Changed from "rallylife" to default
        bodyType: avatarData.bodyType || "fullbody",
        gender: avatarData.gender || "male",
        assets: avatarData.assets || {},
      }),
    });

    console.log("Create Avatar Response Status:", response.status);
    const responseText = await response.text();
    console.log("Create Avatar Response:", responseText);

    if (!response.ok) {
      throw new Error(`Ready Player Me API error: ${response.status} - ${responseText}`);
    }

    const rpmAvatar = JSON.parse(responseText);
    
    // Save avatar URL to user profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ready_player_me_url: rpmAvatar.modelUrl || rpmAvatar.url })
      .eq("id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl: rpmAvatar.modelUrl || rpmAvatar.url,
        avatarId: rpmAvatar.id 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Create avatar error:", error);
    throw new Error(`Failed to create avatar: ${error.message}`);
  }
}

async function updateAvatar(avatarData: any, userId: string, supabase: any) {
  try {
    console.log("Updating avatar with data:", avatarData);
    
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

    console.log("Update Avatar Response Status:", response.status);
    const responseText = await response.text();
    console.log("Update Avatar Response:", responseText);

    if (!response.ok) {
      throw new Error(`Ready Player Me API error: ${response.status} - ${responseText}`);
    }

    const updatedAvatar = JSON.parse(responseText);
    
    // Update avatar URL in profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ready_player_me_url: updatedAvatar.modelUrl || updatedAvatar.url })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl: updatedAvatar.modelUrl || updatedAvatar.url
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Update avatar error:", error);
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
    console.log("Fetching assets from Ready Player Me API...");
    
    // Get available assets from Ready Player Me
    const response = await fetch(`${RPM_BASE_URL}/assets`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${RPM_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Get Assets Response Status:", response.status);
    const responseText = await response.text();
    console.log("Get Assets Response:", responseText);

    if (!response.ok) {
      console.error("Assets API failed, providing fallback tennis assets");
      // Provide fallback tennis-themed assets
      const fallbackAssets = [
        {
          id: "tennis_shirt_1",
          name: "Tennis Polo Shirt",
          type: "shirt",
          category: "clothing",
          iconUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop",
          previewUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop"
        },
        {
          id: "tennis_shorts_1",
          name: "Tennis Shorts",
          type: "shorts",
          category: "clothing", 
          iconUrl: "https://images.unsplash.com/photo-1506629905972-b19b22ad8beb?w=100&h=100&fit=crop",
          previewUrl: "https://images.unsplash.com/photo-1506629905972-b19b22ad8beb?w=300&h=300&fit=crop"
        },
        {
          id: "tennis_racket_1",
          name: "Professional Tennis Racket",
          type: "racket",
          category: "equipment",
          iconUrl: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=100&h=100&fit=crop",
          previewUrl: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=300&fit=crop"
        }
      ];

      return new Response(
        JSON.stringify({ 
          success: true, 
          assets: fallbackAssets,
          note: "Using fallback tennis assets"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    const assets = JSON.parse(responseText);

    return new Response(
      JSON.stringify({ 
        success: true, 
        assets: assets.data || assets || []
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Get assets error:", error);
    throw new Error(`Failed to get assets: ${error.message}`);
  }
}
