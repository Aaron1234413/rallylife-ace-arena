-- Create cron job to expire sessions every hour
-- First, ensure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the session expiration job to run every hour
SELECT cron.schedule(
  'expire-sessions-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://fxpzmbgslbquzdsutxhv.supabase.co/functions/v1/expire-sessions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cHptYmdzbGJxdXpkc3V0eGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NjI3NzcsImV4cCI6MjA2NTMzODc3N30.HG5Y-nyqnf_gDZ1vu1y5vFcJQEiNPSQxyBJE6yJiaOM"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);