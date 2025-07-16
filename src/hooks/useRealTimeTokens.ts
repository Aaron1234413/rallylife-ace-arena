import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TokenNotification {
  type: 'earning' | 'spending' | 'subscription' | 'redemption' | 'pool_update' | 'overdraft_warning';
  message: string;
  amount?: number;
  clubName?: string;
  serviceType?: string;
}

export function useRealTimeTokens() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<TokenNotification[]>([]);
  const channelRef = useRef<any>(null);
  const initialized = useRef(false);

  const addNotification = (notification: TokenNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    
    // Show toast based on type
    switch (notification.type) {
      case 'earning':
        toast.success(`🪙 ${notification.message}`, { duration: 3000 });
        break;
      case 'spending':
        toast.info(`💸 ${notification.message}`, { duration: 3000 });
        break;
      case 'subscription':
        toast.success(`⭐ ${notification.message}`, { duration: 5000 });
        break;
      case 'redemption':
        toast.success(`🎯 ${notification.message}`, { duration: 4000 });
        break;
      case 'overdraft_warning':
        toast.warning(`⚠️ ${notification.message}`, { duration: 6000 });
        break;
      case 'pool_update':
        toast.info(`🏛️ ${notification.message}`, { duration: 3000 });
        break;
    }
  };

  useEffect(() => {
    if (!user) return;

    // Only initialize channel once
    if (!channelRef.current) {
      const channel = supabase.channel(`user-tokens-${user.id}-${Date.now()}`);

      // Personal token balance changes
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_balances',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Token balance changed:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const oldBalance = payload.old?.regular_tokens || 0;
            const newBalance = payload.new?.regular_tokens || 0;
            const difference = newBalance - oldBalance;
            
            if (difference > 0) {
              addNotification({
                type: 'earning',
                message: `Earned ${difference} tokens`,
                amount: difference
              });
            } else if (difference < 0) {
              addNotification({
                type: 'spending',
                message: `Spent ${Math.abs(difference)} tokens`,
                amount: Math.abs(difference)
              });
            }
          }
        }
      );

      // Token transactions for detailed tracking
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_transactions',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New token transaction:', payload);
          
          const transaction = payload.new;
          if (transaction) {
            let message = '';
            let type: TokenNotification['type'] = 'earning';
            
            switch (transaction.source) {
              case 'subscription':
                message = `Monthly subscription tokens added: ${transaction.amount}`;
                type = 'subscription';
                break;
              case 'match_win':
                message = `Match victory reward: ${transaction.amount} tokens`;
                type = 'earning';
                break;
              case 'training_completion':
                message = `Training completed: ${transaction.amount} tokens`;
                type = 'earning';
                break;
              case 'store_purchase':
                message = `Store purchase: ${transaction.amount} tokens`;
                type = 'spending';
                break;
              default:
                message = `${transaction.description || 'Token transaction'}: ${transaction.amount}`;
                type = transaction.transaction_type === 'earn' ? 'earning' : 'spending';
            }
            
            addNotification({ type, message, amount: transaction.amount });
          }
        }
      );

      // Token redemptions
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_redemptions',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New token redemption:', payload);
          
          const redemption = payload.new;
          if (redemption) {
            addNotification({
              type: 'redemption',
              message: `Redeemed ${redemption.tokens_used} tokens for ${redemption.service_type}`,
              amount: redemption.tokens_used,
              serviceType: redemption.service_type
            });
          }
        }
      );

      // Club token pool updates (for clubs user is member of)
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'club_token_pools'
        },
        async (payload) => {
          console.log('Club token pool updated:', payload);
          
          // Check if user is member of this club
          const clubId = (payload.new as any)?.club_id || (payload.old as any)?.club_id;
          if (!clubId) return;
          
          const { data: membership } = await supabase
            .from('club_memberships')
            .select('clubs:club_id(name)')
            .eq('user_id', user.id)
            .eq('club_id', clubId)
            .eq('status', 'active')
            .single();
            
          if (membership) {
            const clubName = (membership.clubs as any)?.name || 'Your club';
            
            if (payload.eventType === 'UPDATE') {
              const oldData = payload.old as any;
              const newData = payload.new as any;
              
              const oldTokens = (oldData?.allocated_tokens || 0) + (oldData?.rollover_tokens || 0) + (oldData?.purchased_tokens || 0) - (oldData?.used_tokens || 0);
              const newTokens = (newData?.allocated_tokens || 0) + (newData?.rollover_tokens || 0) + (newData?.purchased_tokens || 0) - (newData?.used_tokens || 0);
              
              // Check for low balance warning
              const totalAllocated = (newData?.allocated_tokens || 0) + (newData?.rollover_tokens || 0) + (newData?.purchased_tokens || 0);
              const usagePercentage = totalAllocated > 0 ? ((newData?.used_tokens || 0) / totalAllocated) * 100 : 0;
              
              if (usagePercentage > 80) {
                addNotification({
                  type: 'overdraft_warning',
                  message: `${clubName} token pool is running low (${Math.round(100 - usagePercentage)}% remaining)`,
                  clubName
                });
              }
              
              if ((newData?.purchased_tokens || 0) > (oldData?.purchased_tokens || 0)) {
                const tokensAdded = (newData?.purchased_tokens || 0) - (oldData?.purchased_tokens || 0);
                addNotification({
                  type: 'pool_update',
                  message: `${clubName} purchased ${tokensAdded} additional tokens`,
                  clubName,
                  amount: tokensAdded
                });
              }
            }
          }
        }
      );

      channelRef.current = channel;
    }

    // Subscribe exactly once
    channelRef.current.subscribe();

    return () => {
      // Clean up on unmount or before next effect run
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return {
    notifications,
    clearNotifications,
    removeNotification,
    addNotification // For manual notifications
  };
}