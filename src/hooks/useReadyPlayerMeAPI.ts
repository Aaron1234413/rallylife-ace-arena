
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface AvatarAsset {
  id: string;
  name: string;
  type: string;
  category: string;
  iconUrl: string;
  previewUrl: string;
}

interface AvatarData {
  bodyType?: string;
  gender?: string;
  assets?: Record<string, string>;
}

export function useReadyPlayerMeAPI() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<AvatarAsset[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const callAPI = async (action: string, data?: any) => {
    try {
      setLoading(true);
      const { data: response, error } = await supabase.functions.invoke('ready-player-me', {
        body: { action, ...data }
      });

      if (error) throw error;
      return response;
    } catch (error) {
      console.error('Ready Player Me API Error:', error);
      toast({
        title: "Error",
        description: "Failed to communicate with avatar service",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAvatar = async (avatarData: AvatarData) => {
    const response = await callAPI('create_avatar', avatarData);
    if (response.success) {
      setAvatarUrl(response.avatarUrl);
      toast({
        title: "Success",
        description: "Avatar created successfully!",
      });
    }
    return response;
  };

  const updateAvatar = async (avatarData: AvatarData) => {
    const response = await callAPI('update_avatar', avatarData);
    if (response.success) {
      setAvatarUrl(response.avatarUrl);
      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });
    }
    return response;
  };

  const getAvatar = async () => {
    const response = await callAPI('get_avatar');
    if (response.success) {
      setAvatarUrl(response.avatarUrl || '');
    }
    return response;
  };

  const getAssets = async () => {
    const response = await callAPI('get_assets');
    if (response.success) {
      setAssets(response.assets);
    }
    return response;
  };

  return {
    loading,
    avatarUrl,
    assets,
    createAvatar,
    updateAvatar,
    getAvatar,
    getAssets,
  };
}
