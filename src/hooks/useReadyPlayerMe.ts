
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useReadyPlayerMe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatarId, setAvatarId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current avatar ID from the stored URL
  useEffect(() => {
    const fetchAvatarId = async () => {
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
        } else if (profile?.ready_player_me_url) {
          // Extract avatar ID from full URL
          const url = profile.ready_player_me_url;
          const avatarId = url.split('/').pop()?.replace('.glb', '') || '';
          setAvatarId(avatarId);
        }
      } catch (error) {
        console.error('Error fetching Ready Player Me avatar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarId();
  }, [user?.id]);

  // Save new avatar ID (converts to full URL for storage)
  const saveAvatarId = async (newAvatarId: string) => {
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
      // Convert avatar ID to full URL for storage
      const fullUrl = `https://models.readyplayer.me/${newAvatarId}.glb`;
      
      const { error } = await supabase
        .from('profiles')
        .update({ ready_player_me_url: fullUrl })
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

      setAvatarId(newAvatarId);
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
    avatarId,
    loading,
    saving,
    saveAvatarId,
  };
}
