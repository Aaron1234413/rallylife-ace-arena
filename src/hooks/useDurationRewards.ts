
import { useToast } from '@/hooks/use-toast';

interface DurationRewards {
  xp: number;
  hp: number;
  description: string;
}

export function useDurationRewards() {
  const { toast } = useToast();

  const calculateRewards = (durationMinutes: number): DurationRewards => {
    // Base rewards for every 15 minutes of play
    const baseXP = 25;
    const baseHP = 10;
    
    // Calculate reward multiplier based on duration
    const quarterHours = Math.floor(durationMinutes / 15);
    
    // Bonus multiplier for longer sessions
    let bonusMultiplier = 1;
    if (durationMinutes >= 60) bonusMultiplier = 1.5; // 1+ hour bonus
    if (durationMinutes >= 120) bonusMultiplier = 2.0; // 2+ hour bonus
    
    const totalXP = Math.floor(quarterHours * baseXP * bonusMultiplier);
    const totalHP = Math.floor(quarterHours * baseHP * bonusMultiplier);
    
    let description = `${durationMinutes} minutes of tennis`;
    if (bonusMultiplier > 1) {
      description += ` (${bonusMultiplier}x bonus for extended play!)`;
    }
    
    return {
      xp: totalXP,
      hp: totalHP,
      description
    };
  };

  const applyRewards = async (
    durationMinutes: number,
    onAddXP: (amount: number, type: string, desc?: string) => Promise<void>,
    onRestoreHP: (amount: number, type: string, desc?: string) => Promise<void>
  ) => {
    const rewards = calculateRewards(durationMinutes);
    
    if (rewards.xp > 0) {
      await onAddXP(rewards.xp, 'social_play', rewards.description);
    }
    
    if (rewards.hp > 0) {
      await onRestoreHP(rewards.hp, 'social_play', rewards.description);
    }

    // Show summary toast
    if (rewards.xp > 0 || rewards.hp > 0) {
      toast({
        title: 'Session Rewards Earned!',
        description: `+${rewards.xp} XP, +${rewards.hp} HP for ${durationMinutes} minutes of play`,
      });
    }

    return rewards;
  };

  return {
    calculateRewards,
    applyRewards
  };
}
