-- Phase 1.1: Connect Challenges to Invitations
-- Add challenge stakes fields to match_invitations table

ALTER TABLE public.match_invitations 
ADD COLUMN stakes_tokens integer DEFAULT 0,
ADD COLUMN stakes_premium_tokens integer DEFAULT 0,
ADD COLUMN challenge_id uuid REFERENCES public.challenges(id),
ADD COLUMN is_challenge boolean DEFAULT false;

-- Create index for challenge lookups
CREATE INDEX idx_match_invitations_challenge_id ON public.match_invitations(challenge_id);

-- Phase 1.2: Create enhanced invitation function that handles challenge stakes
CREATE OR REPLACE FUNCTION public.create_match_invitation_with_stakes(
  invitee_user_id uuid,
  invitee_user_name text,
  invitee_user_email text DEFAULT NULL,
  invitation_type_param text DEFAULT 'singles',
  message_param text DEFAULT NULL,
  session_data_param jsonb DEFAULT '{}'::jsonb,
  stakes_tokens_param integer DEFAULT 0,
  stakes_premium_tokens_param integer DEFAULT 0,
  challenge_id_param uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_id uuid;
  inviter_balance_record RECORD;
  result json;
BEGIN
  -- Verify inviter has sufficient tokens for stakes
  IF stakes_tokens_param > 0 OR stakes_premium_tokens_param > 0 THEN
    SELECT * INTO inviter_balance_record
    FROM public.token_balances
    WHERE player_id = auth.uid();
    
    IF inviter_balance_record IS NULL THEN
      RETURN json_build_object(
        'success', false, 
        'error', 'Token balance not found'
      );
    END IF;
    
    IF stakes_tokens_param > inviter_balance_record.regular_tokens THEN
      RETURN json_build_object(
        'success', false, 
        'error', 'Insufficient regular tokens for stakes'
      );
    END IF;
    
    IF stakes_premium_tokens_param > inviter_balance_record.premium_tokens THEN
      RETURN json_build_object(
        'success', false, 
        'error', 'Insufficient premium tokens for stakes'
      );
    END IF;
  END IF;

  -- Create the invitation with stakes
  INSERT INTO public.match_invitations (
    inviter_id, invitee_id, invitee_name, invitee_email,
    invitation_type, message, session_data, 
    stakes_tokens, stakes_premium_tokens, challenge_id,
    is_challenge
  )
  VALUES (
    auth.uid(), invitee_user_id, invitee_user_name, invitee_user_email,
    invitation_type_param, message_param, session_data_param,
    stakes_tokens_param, stakes_premium_tokens_param, challenge_id_param,
    CASE WHEN challenge_id_param IS NOT NULL THEN true ELSE false END
  )
  RETURNING id INTO invitation_id;

  -- Reserve/escrow the stakes tokens (deduct from inviter's balance)
  IF stakes_tokens_param > 0 THEN
    PERFORM public.spend_tokens(
      auth.uid(), 
      stakes_tokens_param, 
      'regular', 
      'challenge_stakes', 
      'Stakes reserved for challenge invitation'
    );
  END IF;

  IF stakes_premium_tokens_param > 0 THEN
    PERFORM public.spend_tokens(
      auth.uid(), 
      stakes_premium_tokens_param, 
      'premium', 
      'challenge_stakes', 
      'Premium stakes reserved for challenge invitation'
    );
  END IF;

  result := json_build_object(
    'success', true,
    'invitation_id', invitation_id,
    'stakes_tokens', stakes_tokens_param,
    'stakes_premium_tokens', stakes_premium_tokens_param,
    'message', 'Challenge invitation created successfully'
  );

  RETURN result;
END;
$$;

-- Update existing unified invitation view to include stakes
CREATE OR REPLACE VIEW public.unified_invitations AS
SELECT 
  mi.id,
  mi.inviter_id,
  mi.invitee_id,
  mi.invitee_name,
  mi.invitee_email,
  mi.invitation_type,
  mi.invitation_category,
  mi.status,
  mi.message,
  mi.created_at,
  mi.expires_at,
  mi.responded_at,
  mi.session_data,
  mi.stakes_tokens,
  mi.stakes_premium_tokens,
  mi.challenge_id,
  mi.is_challenge,
  'match' as source_table
FROM public.match_invitations mi

UNION ALL

SELECT 
  spi.id,
  spi.host_id as inviter_id,
  spi.participant_id as invitee_id,
  spi.participant_name as invitee_name,
  spi.participant_email as invitee_email,
  'social_play' as invitation_type,
  'social_play' as invitation_category,
  spi.status,
  spi.message,
  spi.created_at,
  spi.expires_at,
  spi.responded_at,
  spi.session_data,
  0 as stakes_tokens, -- Social play doesn't have stakes (for now)
  0 as stakes_premium_tokens,
  NULL as challenge_id,
  false as is_challenge,
  'social_play' as source_table
FROM public.social_play_invitations spi;

-- Grant necessary permissions
GRANT SELECT ON public.unified_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_match_invitation_with_stakes TO authenticated;