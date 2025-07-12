import { z } from 'zod';
import { toast } from 'sonner';

// Validation schemas for different session operations
export const createSessionSchema = z.object({
  sessionType: z.string().min(1, 'Session type is required'),
  format: z.enum(['singles', 'doubles']).optional(),
  maxPlayers: z.number().min(2, 'At least 2 players required').max(20, 'Maximum 20 players'),
  stakesAmount: z.number().min(0, 'Stakes cannot be negative'),
  location: z.string().min(1, 'Location is required'),
  notes: z.string().optional(),
  isPrivate: z.boolean(),
  invitationCode: z.string().optional()
});

export const editSessionSchema = createSessionSchema.extend({
  // Additional validation for edits
  sessionId: z.string().uuid('Invalid session ID')
});

export const sessionConflictSchema = z.object({
  sessionId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  courtId: z.string().optional(),
  coachId: z.string().optional()
});

export type CreateSessionForm = z.infer<typeof createSessionSchema>;
export type EditSessionForm = z.infer<typeof editSessionSchema>;
export type SessionConflictCheck = z.infer<typeof sessionConflictSchema>;

// Validation utilities
export const validateSessionTiming = (startTime: string, endTime: string): boolean => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  
  if (start >= end) {
    toast.error('End time must be after start time');
    return false;
  }
  
  if (start < now) {
    toast.error('Session cannot start in the past');
    return false;
  }
  
  return true;
};

export const validateSessionCapacity = (currentParticipants: number, maxPlayers: number): boolean => {
  if (currentParticipants > maxPlayers) {
    toast.error('Cannot reduce max players below current participant count');
    return false;
  }
  
  return true;
};

export const validateStakesChange = (
  currentStakes: number, 
  newStakes: number, 
  hasParticipants: boolean
): boolean => {
  if (hasParticipants && currentStakes !== newStakes) {
    toast.error('Cannot change stakes amount when players have already joined');
    return false;
  }
  
  return true;
};

export const validatePrivacyChange = (
  currentPrivacy: boolean,
  newPrivacy: boolean,
  hasExternalParticipants: boolean
): boolean => {
  if (hasExternalParticipants && !currentPrivacy && newPrivacy) {
    toast.error('Cannot make session private when external players have joined');
    return false;
  }
  
  return true;
};

// Server-side validation helpers
export const validateSessionPermissions = async (
  sessionId: string,
  userId: string,
  action: 'edit' | 'start' | 'end' | 'cancel'
): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('sessions')
      .select('creator_id, status')
      .eq('id', sessionId)
      .single();

    if (error) return false;
    
    // Basic permission check - only creator can edit
    return data.creator_id === userId;
  } catch (error) {
    console.error('Error validating session permissions:', error);
    return false;
  }
};

export const validateSessionEdit = async (
  sessionId: string,
  formData: Partial<EditSessionForm>
): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  try {
    // Validate form data
    const validation = editSessionSchema.safeParse({ ...formData, sessionId });
    
    if (!validation.success) {
      errors.push(...validation.error.errors.map(e => e.message));
    }
    
    // Additional business logic validation would go here
    // e.g., checking for conflicts, participant limits, etc.
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    console.error('Error validating session edit:', error);
    return { valid: false, errors: ['Validation failed'] };
  }
};