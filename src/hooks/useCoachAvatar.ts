
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoachAvatarItem {
  id: string;
  name: string;
  category: string;
  item_type: string;
  image_url: string;
  description: string;
  rarity: string;
  unlock_type: string;
  unlock_requirement: any;
  ctk_cost: number;
  is_default: boolean;
  is_professional: boolean;
  created_at: string;
}

export interface CoachAvatarOwned {
  id: string;
  coach_id: string;
  avatar_item_id: string;
  unlock_method: string;
  unlocked_at: string;
  avatar_item: CoachAvatarItem;
}

export interface CoachAvatarEquipped {
  id: string;
  coach_id: string;
  category: string;
  avatar_item_id: string;
  equipped_at: string;
  avatar_item: CoachAvatarItem;
}

type CoachAvatarResponse = {
  item_name: string;
  ctk_spent?: number;
  success: boolean;
  error?: string;
};

export function useCoachAvatar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available avatar items
  const { data: availableItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['coach-avatar-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_avatar_items')
        .select('*')
        .order('category', { ascending: true })
        .order('rarity', { ascending: true });

      if (error) {
        console.error('Error fetching coach avatar items:', error);
        throw error;
      }

      return data as CoachAvatarItem[];
    },
  });

  // Fetch owned items
  const { data: ownedItems = [], isLoading: ownedLoading } = useQuery({
    queryKey: ['coach-avatar-owned'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_avatar_owned')
        .select(`
          *,
          avatar_item:coach_avatar_items(*)
        `)
        .order('unlocked_at', { ascending: false });

      if (error) {
        console.error('Error fetching owned avatar items:', error);
        throw error;
      }

      return data as CoachAvatarOwned[];
    },
  });

  // Fetch equipped items
  const { data: equippedItems = [], isLoading: equippedLoading } = useQuery({
    queryKey: ['coach-avatar-equipped'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_avatar_equipped')
        .select(`
          *,
          avatar_item:coach_avatar_items(*)
        `)
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching equipped avatar items:', error);
        throw error;
      }

      return data as CoachAvatarEquipped[];
    },
  });

  // Equip avatar item mutation
  const equipItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.rpc('equip_coach_avatar_item', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        item_id: itemId
      });

      if (error) {
        console.error('Error equipping avatar item:', error);
        throw error;
      }

      // Safe casting for Supabase function response
      const raw = data as unknown;
      let result: CoachAvatarResponse | null = null;

      if (Array.isArray(raw) && raw.length > 0) {
        result = raw[0] as CoachAvatarResponse;
      } else if (raw && typeof raw === 'object') {
        result = raw as CoachAvatarResponse;
      } else {
        console.warn("Unexpected structure:", raw);
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['coach-avatar-equipped'] });
      toast({
        title: "Item Equipped",
        description: `${result?.item_name || 'Item'} has been equipped!`,
      });
    },
    onError: (error) => {
      console.error('Failed to equip item:', error);
      toast({
        title: "Error",
        description: "Failed to equip item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Purchase avatar item mutation
  const purchaseItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.rpc('purchase_coach_avatar_item', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        item_id: itemId
      });

      if (error) {
        console.error('Error purchasing avatar item:', error);
        throw error;
      }

      // Safe casting for Supabase function response
      const raw = data as unknown;
      let result: CoachAvatarResponse | null = null;

      if (Array.isArray(raw) && raw.length > 0) {
        result = raw[0] as CoachAvatarResponse;
      } else if (raw && typeof raw === 'object') {
        result = raw as CoachAvatarResponse;
      } else {
        console.warn("Unexpected structure:", raw);
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['coach-avatar-owned'] });
      queryClient.invalidateQueries({ queryKey: ['coach-tokens'] });
      
      if (result?.success) {
        toast({
          title: "Purchase Successful",
          description: `${result.item_name} purchased for ${result.ctk_spent || 0} CTK!`,
        });
      } else {
        toast({
          title: "Purchase Failed",
          description: result?.error || "Purchase failed",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Failed to purchase item:', error);
      toast({
        title: "Error",
        description: "Failed to purchase item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize avatar mutation
  const initializeAvatarMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('initialize_coach_avatar', {
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) {
        console.error('Error initializing coach avatar:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-avatar-owned'] });
      queryClient.invalidateQueries({ queryKey: ['coach-avatar-equipped'] });
      toast({
        title: "Avatar Initialized",
        description: "Your coaching avatar is now ready!",
      });
    },
    onError: (error) => {
      console.error('Failed to initialize avatar:', error);
      toast({
        title: "Error",
        description: "Failed to initialize avatar. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-initialize if no equipped items exist
  useEffect(() => {
    if (!equippedLoading && equippedItems.length === 0 && !initializeAvatarMutation.isPending) {
      console.log('Auto-initializing coach avatar...');
      initializeAvatarMutation.mutate();
    }
  }, [equippedLoading, equippedItems.length, initializeAvatarMutation.isPending]);

  // Check if an item is owned
  const isItemOwned = (itemId: string) => {
    return ownedItems.some(owned => owned.avatar_item_id === itemId);
  };

  // Check if an item can be unlocked based on level
  const canUnlockItem = (item: CoachAvatarItem, currentLevel: number = 1) => {
    if (item.unlock_type === 'level' && item.unlock_requirement?.level) {
      return currentLevel >= item.unlock_requirement.level;
    }
    return item.unlock_type === 'free' || item.unlock_type === 'purchase';
  };

  return {
    availableItems,
    ownedItems,
    equippedItems,
    loading: itemsLoading || ownedLoading || equippedLoading,
    equipItem: equipItemMutation.mutate,
    equipItemLoading: equipItemMutation.isPending,
    purchaseItem: purchaseItemMutation.mutate,
    purchaseItemLoading: purchaseItemMutation.isPending,
    initializeAvatar: initializeAvatarMutation.mutate,
    initializingAvatar: initializeAvatarMutation.isPending,
    isItemOwned,
    canUnlockItem,
  };
}
