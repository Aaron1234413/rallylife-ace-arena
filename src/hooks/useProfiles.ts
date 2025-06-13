
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useProfiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('role', 'player');

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}
