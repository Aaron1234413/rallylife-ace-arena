import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SessionNotificationRequest {
  type: 'cancellation' | 'reminder' | 'confirmation';
  session: {
    id: string;
    title: string;
    start_datetime: string;
    end_datetime: string;
    session_type: string;
    cost_tokens?: number;
    cost_money?: number;
  };
  reason?: string;
  recipients: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, session, reason, recipients }: SessionNotificationRequest = await req.json();

    // Get user profiles for recipients
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, email')
      .in('id', recipients);

    if (profileError) {
      throw new Error(`Failed to fetch user profiles: ${profileError.message}`);
    }

    const emailPromises = profiles?.map(async (profile) => {
      if (!profile.email) return null;

      let subject = '';
      let html = '';

      const sessionDate = new Date(session.start_datetime).toLocaleDateString();
      const sessionTime = new Date(session.start_datetime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      switch (type) {
        case 'cancellation':
          subject = `Session Cancelled: ${session.title}`;
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Session Cancelled</h2>
              <p>Hello ${profile.full_name},</p>
              <p>We wanted to inform you that the following session has been cancelled:</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${session.title}</h3>
                <p><strong>Date:</strong> ${sessionDate}</p>
                <p><strong>Time:</strong> ${sessionTime}</p>
                <p><strong>Type:</strong> ${session.session_type.replace('_', ' ')}</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>

              ${session.cost_tokens > 0 || session.cost_money > 0 ? `
                <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #059669; margin-top: 0;">Refund Information</h4>
                  <p>Your refund will be processed within 1-3 business days:</p>
                  ${session.cost_tokens > 0 ? `<p>• ${session.cost_tokens} tokens will be returned to your account</p>` : ''}
                  ${session.cost_money > 0 ? `<p>• $${session.cost_money} will be refunded to your payment method</p>` : ''}
                </div>
              ` : ''}

              <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
              <p>Best regards,<br>The RallyLife Team</p>
            </div>
          `;
          break;

        case 'reminder':
          subject = `Upcoming Session Reminder: ${session.title}`;
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Session Reminder</h2>
              <p>Hello ${profile.full_name},</p>
              <p>This is a friendly reminder about your upcoming session:</p>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${session.title}</h3>
                <p><strong>Date:</strong> ${sessionDate}</p>
                <p><strong>Time:</strong> ${sessionTime}</p>
                <p><strong>Type:</strong> ${session.session_type.replace('_', ' ')}</p>
              </div>

              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #d97706; margin-top: 0;">What to Bring</h4>
                <ul>
                  <li>Tennis racket and comfortable athletic wear</li>
                  <li>Water bottle to stay hydrated</li>
                  <li>Positive attitude and readiness to improve!</li>
                </ul>
              </div>

              <p>We look forward to seeing you on the court!</p>
              <p>Best regards,<br>The RallyLife Team</p>
            </div>
          `;
          break;

        case 'confirmation':
          subject = `Session Confirmed: ${session.title}`;
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Session Confirmed</h2>
              <p>Hello ${profile.full_name},</p>
              <p>Great news! Your session has been confirmed:</p>
              
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${session.title}</h3>
                <p><strong>Date:</strong> ${sessionDate}</p>
                <p><strong>Time:</strong> ${sessionTime}</p>
                <p><strong>Type:</strong> ${session.session_type.replace('_', ' ')}</p>
              </div>

              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #0369a1; margin-top: 0;">Next Steps</h4>
                <ul>
                  <li>Arrive 10 minutes early to warm up</li>
                  <li>Bring your tennis equipment and water</li>
                  <li>Check weather conditions before heading out</li>
                </ul>
              </div>

              <p>If you need to make any changes, please contact us at least 2 hours before your session.</p>
              <p>Best regards,<br>The RallyLife Team</p>
            </div>
          `;
          break;

        default:
          throw new Error(`Unknown notification type: ${type}`);
      }

      return resend.emails.send({
        from: "RallyLife <notifications@resend.dev>",
        to: [profile.email],
        subject,
        html
      });
    });

    const results = await Promise.allSettled(emailPromises.filter(Boolean));
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected');

    console.log(`Session notification sent: ${successful} successful, ${failed.length} failed`);

    if (failed.length > 0) {
      console.error('Failed notifications:', failed);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed: failed.length,
        message: `Notification sent to ${successful} recipients` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-session-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);