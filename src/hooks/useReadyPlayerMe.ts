
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useReadyPlayerMe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current avatar URL
  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('ready_player_me_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching Ready Player Me avatar:', error);
        } else {
          setAvatarUrl(profile?.ready_player_me_url || '');
        }
      } catch (error) {
        console.error('Error fetching Ready Player Me avatar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarUrl();
  }, [user?.id]);

  // Save new avatar URL
  const saveAvatarUrl = async (newAvatarUrl: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ready_player_me_url: newAvatarUrl })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving Ready Player Me avatar:', error);
        toast({
          title: "Error",
          description: "Failed to save avatar",
          variant: "destructive",
        });
        return false;
      }

      setAvatarUrl(newAvatarUrl);
      toast({
        title: "Success",
        description: "Avatar saved successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error saving Ready Player Me avatar:', error);
      toast({
        title: "Error",
        description: "Failed to save avatar",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    avatarUrl,
    loading,
    saving,
    saveAvatarUrl,
  };
}
