import { usePlayerHP } from './usePlayerHP';

export function useHP() {
  const { hpData } = usePlayerHP();
  
  return {
    value: hpData?.current_hp || 0
  };
}