import { usePlayerTokens } from './usePlayerTokens';

export function useTokens() {
  const { tokenData } = usePlayerTokens();
  
  return {
    value: tokenData?.regular_tokens || 0
  };
}