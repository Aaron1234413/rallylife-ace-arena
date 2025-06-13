
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
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const callAPI = async (action: string, data?: any) => {
    try {
      setLoading(true);
      console.log(`Calling Ready Player Me API: ${action}`, data);
      
      const { data: response, error } = await supabase.functions.invoke('ready-player-me', {
        body: { action, ...data }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Ready Player Me API Error:', error);
      toast({
        title: "Error",
        description: `Failed to ${action.replace('_', ' ')}: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await callAPI('test_connection');
      if (response.success) {
        setConnectionStatus('connected');
        toast({
          title: "Success",
          description: "Connected to Ready Player Me API successfully!",
        });
      }
      return response;
    } catch (error) {
      setConnectionStatus('error');
      return { success: false, error: error.message };
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
      if (response.note) {
        toast({
          title: "Info",
          description: response.note,
        });
      }
    }
    return response;
  };

  return {
    loading,
    avatarUrl,
    assets,
    connectionStatus,
    testConnection,
    createAvatar,
    updateAvatar,
    getAvatar,
    getAssets,
  };
}
