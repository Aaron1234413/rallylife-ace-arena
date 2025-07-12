import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { UnifiedSession } from './useUnifiedSessions';
import { validateSessionEdit, type EditSessionForm } from './useSessionValidation';

interface UseSessionEditOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useSessionEdit = (options: UseSessionEditOptions = {}) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const updateSession = useCallback(async (
    sessionId: string,
    updates: Partial<EditSessionForm>,
    optimisticUpdate?: (session: UnifiedSession) => UnifiedSession
  ): Promise<{ success: boolean; session?: UnifiedSession }> => {
    if (!user) {
      toast.error('You must be logged in to edit sessions');
      return { success: false };
    }

    setUpdating(true);
    setValidationErrors([]);

    try {
      // Client-side validation
      const validation = await validateSessionEdit(sessionId, updates);
      
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        validation.errors.forEach(error => toast.error(error));
        return { success: false };
      }

      // Prepare update data
      const updateData = {
        session_type: updates.sessionType,
        format: updates.sessionType === 'match' ? updates.format : null,
        max_players: updates.maxPlayers,
        stakes_amount: updates.stakesAmount,
        location: updates.location?.trim(),
        notes: updates.notes?.trim() || null,
        is_private: updates.isPrivate,
        invitation_code: updates.isPrivate ? updates.invitationCode : null,
        updated_at: new Date().toISOString()
      };

      // Execute server update with conflict detection
      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('creator_id', user.id) // Ensure only creator can edit
        .select(`
          *,
          creator:profiles!sessions_creator_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Session not found or you do not have permission to edit it');
        }
        throw error;
      }

      // Transform response to UnifiedSession format
      const updatedSession: UnifiedSession = {
        ...data,
        // Ensure arrays are properly typed
        winning_team: Array.isArray(data.winning_team) ? 
                     (data.winning_team as string[]) : 
                     data.winning_team ? [String(data.winning_team)] : undefined
      };

      toast.success('Session updated successfully!');
      options.onSuccess?.();
      
      return { success: true, session: updatedSession };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update session';
      console.error('Error updating session:', error);
      toast.error(errorMessage);
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
      
      return { success: false };
    } finally {
      setUpdating(false);
    }
  }, [user, options]);

  const validateField = useCallback(async (
    sessionId: string,
    field: keyof EditSessionForm,
    value: any
  ): Promise<boolean> => {
    try {
      const validation = await validateSessionEdit(sessionId, { [field]: value });
      const fieldErrors = validation.errors.filter(error => 
        error.toLowerCase().includes(field.toLowerCase())
      );
      
      if (fieldErrors.length > 0) {
        setValidationErrors(prev => [...prev.filter(e => 
          !e.toLowerCase().includes(field.toLowerCase())
        ), ...fieldErrors]);
        return false;
      }
      
      // Clear field-specific errors
      setValidationErrors(prev => prev.filter(e => 
        !e.toLowerCase().includes(field.toLowerCase())
      ));
      
      return true;
    } catch (error) {
      console.error('Error validating field:', error);
      return false;
    }
  }, []);

  const checkSessionConflicts = useCallback(async (
    sessionId: string,
    updates: Partial<EditSessionForm>
  ): Promise<boolean> => {
    try {
      // Simple validation - check if session exists and can be edited
      const { data, error } = await supabase
        .from('sessions')
        .select('id, creator_id, status, participant_count:session_participants(count)')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      // Basic conflict checks
      if (data.creator_id !== user?.id) {
        toast.error('You can only edit sessions you created');
        return false;
      }

      if (data.status === 'active' || data.status === 'completed') {
        toast.error('Cannot edit a session that has started or completed');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      // Don't block the update if conflict check fails
      return true;
    }
  }, [user]);

  return {
    updateSession,
    validateField,
    checkSessionConflicts,
    updating,
    validationErrors,
    clearValidationErrors: () => setValidationErrors([])
  };
};