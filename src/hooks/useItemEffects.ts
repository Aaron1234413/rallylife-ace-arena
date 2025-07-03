import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { toast } from 'sonner';

export type ItemEffectType = 'hp_restore' | 'xp_gain' | 'token_bonus' | 'level_boost';

interface ItemEffectResult {
  success: boolean;
  message: string;
  error?: string;
}

export function useItemEffects() {
  const { restoreHP } = usePlayerHP();
  const { addXP, xpData } = usePlayerXP();
  const { addTokens } = usePlayerTokens();

  const applyItemEffect = async (
    effectType: ItemEffectType,
    effectValue: number,
    itemName: string
  ): Promise<ItemEffectResult> => {
    try {
      switch (effectType) {
        case 'hp_restore':
          return await handleHPRestore(effectValue, itemName);
        
        case 'xp_gain':
          return await handleXPGain(effectValue, itemName);
        
        case 'token_bonus':
          return await handleTokenBonus(effectValue, itemName);
        
        case 'level_boost':
          return await handleLevelBoost(itemName);
        
        default:
          return {
            success: false,
            message: '',
            error: 'Unknown item effect type'
          };
      }
    } catch (error) {
      console.error('Error applying item effect:', error);
      return {
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const handleHPRestore = async (amount: number, itemName: string): Promise<ItemEffectResult> => {
    try {
      if (amount === 100) {
        // Full restore - restore to max HP
        await restoreHP(1000, 'full_restore', `Used ${itemName} - Full HP restore`);
        return {
          success: true,
          message: `${itemName} used! HP fully restored!`
        };
      } else {
        // Partial restore
        await restoreHP(amount, 'energy_pack', `Used ${itemName}`);
        return {
          success: true,
          message: `${itemName} used! +${amount} HP restored!`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '',
        error: 'Failed to restore HP'
      };
    }
  };

  const handleXPGain = async (amount: number, itemName: string): Promise<ItemEffectResult> => {
    try {
      await addXP(amount, 'xp_injection', `Used ${itemName}`);
      return {
        success: true,
        message: `${itemName} used! +${amount} XP gained!`
      };
    } catch (error) {
      return {
        success: false,
        message: '',
        error: 'Failed to add XP'
      };
    }
  };

  const handleTokenBonus = async (amount: number, itemName: string): Promise<ItemEffectResult> => {
    try {
      await addTokens(amount, 'regular', 'token_bonus', `Used ${itemName}`);
      return {
        success: true,
        message: `${itemName} used! +${amount} tokens gained!`
      };
    } catch (error) {
      return {
        success: false,
        message: '',
        error: 'Failed to add tokens'
      };
    }
  };

  const handleLevelBoost = async (itemName: string): Promise<ItemEffectResult> => {
    try {
      if (!xpData) {
        return {
          success: false,
          message: '',
          error: 'XP data not available'
        };
      }

      // Calculate exact XP needed to reach next level
      const xpNeeded = xpData.xp_to_next_level;
      
      if (xpNeeded <= 0) {
        return {
          success: false,
          message: '',
          error: 'Already at maximum level or XP data invalid'
        };
      }

      // Add the exact XP needed to level up
      await addXP(xpNeeded, 'level_boost', `Used ${itemName} - Level boost`);
      
      return {
        success: true,
        message: `${itemName} used! Level increased to ${xpData.current_level + 1}!`
      };
    } catch (error) {
      return {
        success: false,
        message: '',
        error: 'Failed to boost level'
      };
    }
  };

  return {
    applyItemEffect
  };
}