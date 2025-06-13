
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoachTokens {
  id: string;
  coach_id: string;
  current_tokens: number;
  lifetime_earned: number;
  created_at: string;
  updated_at: string;
}

export interface CoachTokenTransaction {
  id: string;
  coach_id: string;
  transaction_type: string;
  amount: number;
  source: string;
  description: string | null;
  balance_before: number;
  balance_after: number;
  metadata: any;
  created_at: string;
}

interface TokenResult {
  tokens_added?: number;
  tokens_spent?: number;
  new_balance: number;
  lifetime_earned?: number;
  success?: boolean;
  error?: string;
}

export function useCoachTokens() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['coach-tokens'],
    queryFn: async () => {
      console.log('Fetching coach token data...');
      const { data, error } = await supabase
        .from('coach_tokens')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching coach tokens:', error);
        
        // If no record found, that's expected for new coaches
        if (error.code === 'PGRST116') {
          console.log('No token record found, will need to initialize');
          return null;
        }
        
        throw error;
      }

      console.log('Coach token data loaded:', data);
      return data as CoachTokens;
    },
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['coach-token-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_token_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching token transactions:', error);
        throw error;
      }

      return data as CoachTokenTransaction[];
    },
  });

  const addTokensMutation = useMutation({
    mutationFn: async ({
      amount,
      source,
      description
    }: {
      amount: number;
      source: string;
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc('add_coach_tokens', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        amount,
        source,
        description
      });

      if (error) {
        console.error('Error adding tokens:', error);
        throw error;
      }

      return data as TokenResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['coach-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['coach-token-transactions'] });
      
      toast({
        title: "Tokens Earned",
        description: `+${result.tokens_added} CTK earned!`,
      });
    },
    onError: (error) => {
      console.error('Failed to add tokens:', error);
      toast({
        title: "Error",
        description: "Failed to add tokens. Please try again.",
        variant: "destructive",
      });
    },
  });

  const spendTokensMutation = useMutation({
    mutationFn: async ({
      amount,
      source,
      description
    }: {
      amount: number;
      source: string;
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc('spend_coach_tokens', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        amount,
        source,
        description
      });

      if (error) {
        console.error('Error spending tokens:', error);
        throw error;
      }

      return data as TokenResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['coach-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['coach-token-transactions'] });
      
      if (result.success) {
        toast({
          title: "Purchase Successful",
          description: `${result.tokens_spent} CTK spent!`,
        });
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Insufficient tokens",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Failed to spend tokens:', error);
      toast({
        title: "Error",
        description: "Failed to spend tokens. Please try again.",
        variant: "destructive",
      });
    },
  });

  const initializeTokensMutation = useMutation({
    mutationFn: async () => {
      console.log('Initializing coach tokens...');
      const { data, error } = await supabase.rpc('initialize_coach_tokens', {
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) {
        console.error('Error initializing coach tokens:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      console.log('Coach tokens initialized successfully');
      queryClient.invalidateQueries({ queryKey: ['coach-tokens'] });
      toast({
        title: "Tokens Initialized",
        description: "Your coaching token system is now active!",
      });
    },
    onError: (error) => {
      console.error('Failed to initialize tokens:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize token system. Please try again.",
        variant: "destructive",
      });
    },
  });

  const initializeTokens = () => {
    initializeTokensMutation.mutate();
  };

  // Auto-initialize tokens if no data exists and not currently loading
  useEffect(() => {
    if (!tokenLoading && !tokenData && !tokenError && !initializeTokensMutation.isPending) {
      console.log('Auto-initializing tokens for coach...');
      initializeTokens();
    }
  }, [tokenLoading, tokenData, tokenError, initializeTokensMutation.isPending]);

  return {
    tokenData,
    transactions,
    loading: tokenLoading || transactionsLoading,
    addTokens: addTokensMutation.mutate,
    addTokensLoading: addTokensMutation.isPending,
    spendTokens: spendTokensMutation.mutate,
    spendTokensLoading: spendTokensMutation.isPending,
    initializeTokens,
    initializingTokens: initializeTokensMutation.isPending,
    error: tokenError
  };
}
