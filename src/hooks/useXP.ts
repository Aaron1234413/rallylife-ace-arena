import { usePlayerXP } from './usePlayerXP';

export function useXP() {
  const { xpData } = usePlayerXP();
  
  return {
    value: xpData?.total_xp_earned || 0
  };
}