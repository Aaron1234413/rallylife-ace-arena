import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CreateMatchData {
  opponent_id: string;
  scheduled_time?: string;
  court_location?: string;
  stake_amount?: number;
}

interface UpdateMatchData {
  status?: 'accepted' | 'declined' | 'completed';
  score?: string;
  winner_id?: string;
}

export function useMatchmaking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all matches for the current user
  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          challenger:challenger_id(id, full_name, avatar_url),
          opponent:opponent_id(id, full_name, avatar_url),
          winner:winner_id(id, full_name, avatar_url)
        `)
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Create a new match challenge
  const createMatch = useMutation({
    mutationFn: async (matchData: CreateMatchData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('matches')
        .insert({
          challenger_id: user.id,
          ...matchData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: 'Challenge sent!',
        description: 'Your match challenge has been sent to the player.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create match',
        variant: 'destructive',
      });
    }
  });

  // Update match status
  const updateMatch = useMutation({
    mutationFn: async ({ matchId, updates }: { matchId: string; updates: UpdateMatchData }) => {
      const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      
      if (variables.updates.status === 'accepted') {
        toast({
          title: 'Match accepted!',
          description: 'The match has been confirmed.',
        });
      } else if (variables.updates.status === 'declined') {
        toast({
          title: 'Match declined',
          description: 'The match challenge has been declined.',
        });
      } else if (variables.updates.status === 'completed') {
        toast({
          title: 'Match completed!',
          description: 'Match results have been recorded.',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update match',
        variant: 'destructive',
      });
    }
  });

  // Get matches by status
  const getMatchesByStatus = (status: string) => {
    return matches?.filter(match => match.status === status) || [];
  };

  // Get pending matches where user is the opponent
  const getPendingChallenges = () => {
    return matches?.filter(match => 
      match.status === 'pending' && match.opponent_id === user?.id
    ) || [];
  };

  // Get active matches (accepted but not completed)
  const getActiveMatches = () => {
    return matches?.filter(match => match.status === 'accepted') || [];
  };

  return {
    matches: matches || [],
    isLoading,
    createMatch,
    updateMatch,
    getMatchesByStatus,
    getPendingChallenges,
    getActiveMatches,
    isCreating: createMatch.isPending,
    isUpdating: updateMatch.isPending
  };
}