import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AvatarItem {
  id: string;
  name: string;
  category: string;
  item_type: string;
  image_url: string;
  rarity: string;
  unlock_type: string;
  unlock_requirement: any;
  token_cost: number;
  description: string;
  is_default: boolean;
  created_at: string;
}

interface PlayerAvatarItem {
  id: string;
  avatar_item_id: string;
  unlocked_at: string;
  unlock_method: string;
  avatar_items: AvatarItem;
}

interface EquippedItem {
  id: string;
  category: string;
  avatar_item_id: string;
  equipped_at: string;
  avatar_items: AvatarItem;
}

interface DatabaseFunctionResponse {
  success: boolean;
  error?: string;
  item_name?: string;
  item_category?: string;
  unlock_method?: string;
  category?: string;
  tokens_spent?: number;
  premium_spent?: number;
}

export function usePlayerAvatar() {
  const { user } = useAuth();
  const [allItems, setAllItems] = useState<AvatarItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<PlayerAvatarItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAvatarData();
    }
  }, [user]);

  const fetchAvatarData = async () => {
    try {
      setLoading(true);

      // Fetch all available avatar items
      const { data: items, error: itemsError } = await supabase
        .from('avatar_items')
        .select('*')
        .order('category', { ascending: true });

      if (itemsError) {
        console.error('Error fetching avatar items:', itemsError);
        throw itemsError;
      }

      setAllItems(items || []);

      if (!user) return;

      // Fetch owned items
      const { data: owned, error: ownedError } = await supabase
        .from('player_avatar_items')
        .select(`
          *,
          avatar_items (*)
        `)
        .eq('player_id', user.id);

      if (ownedError) {
        console.error('Error fetching owned items:', ownedError);
        throw ownedError;
      }

      setOwnedItems(owned || []);

      // Fetch equipped items
      const { data: equipped, error: equippedError } = await supabase
        .from('player_avatar_equipped')
        .select(`
          *,
          avatar_items (*)
        `)
        .eq('player_id', user.id);

      if (equippedError) {
        console.error('Error fetching equipped items:', equippedError);
        throw equippedError;
      }

      setEquippedItems(equipped || []);

    } catch (error) {
      console.error('Error fetching avatar data:', error);
      toast.error('Failed to load avatar data');
    } finally {
      setLoading(false);
    }
  };

  const initializeAvatar = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('initialize_player_avatar', {
        user_id: user.id
      });

      if (error) {
        console.error('Error initializing avatar:', error);
        throw error;
      }

      await fetchAvatarData();
      toast.success('Avatar initialized successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to initialize avatar');
    }
  };

  const purchaseItem = async (itemId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('purchase_avatar_item', {
        user_id: user.id,
        item_id: itemId
      });

      if (error) {
        console.error('Error purchasing item:', error);
        throw error;
      }

      const result = data as unknown as DatabaseFunctionResponse;
      
      if (result.success) {
        await fetchAvatarData();
        toast.success(`Successfully purchased ${result.item_name}!`);
        return { success: true, data: result };
      } else {
        toast.error(result.error || 'Purchase failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to purchase item');
      return { success: false, error: 'Purchase failed' };
    }
  };

  const equipItem = async (itemId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('equip_avatar_item', {
        user_id: user.id,
        item_id: itemId
      });

      if (error) {
        console.error('Error equipping item:', error);
        throw error;
      }

      const result = data as unknown as DatabaseFunctionResponse;

      if (result.success) {
        await fetchAvatarData();
        toast.success(`Equipped ${result.item_name}!`);
        return { success: true, data: result };
      } else {
        toast.error(result.error || 'Failed to equip item');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to equip item');
      return { success: false, error: 'Equip failed' };
    }
  };

  const checkLevelUnlocks = async (currentLevel: number) => {
    if (!user) return;

    try {
      // Get items that should be unlocked at this level
      const itemsToUnlock = allItems.filter(item => 
        item.unlock_type === 'level' && 
        item.unlock_requirement?.level === currentLevel
      );

      for (const item of itemsToUnlock) {
        const { data, error } = await supabase.rpc('unlock_avatar_item', {
          user_id: user.id,
          item_id: item.id,
          unlock_method: 'level_up'
        });

        if (error) {
          console.error('Error unlocking item:', error);
        } else {
          const result = data as unknown as DatabaseFunctionResponse;
          if (result.success) {
            toast.success(`🎉 New avatar item unlocked: ${item.name}!`);
          }
        }
      }

      await fetchAvatarData();
    } catch (error) {
      console.error('Error checking level unlocks:', error);
    }
  };

  const getEquippedAvatar = () => {
    const avatar: Record<string, AvatarItem> = {};
    equippedItems.forEach(equipped => {
      avatar[equipped.category] = equipped.avatar_items;
    });
    return avatar;
  };

  const getItemsByCategory = (category: string) => {
    return allItems.filter(item => item.category === category);
  };

  const isItemOwned = (itemId: string) => {
    return ownedItems.some(owned => owned.avatar_item_id === itemId);
  };

  const isItemEquipped = (itemId: string) => {
    return equippedItems.some(equipped => equipped.avatar_item_id === itemId);
  };

  const canUnlockItem = (item: AvatarItem, currentLevel: number) => {
    if (item.unlock_type === 'free' || item.is_default) return true;
    if (item.unlock_type === 'level') {
      return currentLevel >= (item.unlock_requirement?.level || 1);
    }
    if (item.unlock_type === 'purchase') return true;
    return false;
  };

  return {
    allItems,
    ownedItems,
    equippedItems,
    loading,
    initializeAvatar,
    purchaseItem,
    equipItem,
    checkLevelUnlocks,
    getEquippedAvatar,
    getItemsByCategory,
    isItemOwned,
    isItemEquipped,
    canUnlockItem,
    refreshData: fetchAvatarData
  };
}
