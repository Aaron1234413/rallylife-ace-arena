
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useReadyPlayerMeAPI() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
          description: "Connected to Ready Player Me successfully!",
        });
      }
      return response;
    } catch (error) {
      setConnectionStatus('error');
      return { success: false, error: error.message };
    }
  };

  const getAvatarUrl = async () => {
    const response = await callAPI('get_avatar_url');
    if (response.success) {
      setAvatarUrl(response.avatarUrl || '');
    }
    return response;
  };

  const saveAvatarUrl = async (newAvatarUrl: string) => {
    const response = await callAPI('save_avatar_url', { avatarUrl: newAvatarUrl });
    if (response.success) {
      setAvatarUrl(newAvatarUrl);
      toast({
        title: "Success",
        description: "Avatar saved successfully!",
      });
    }
    return response;
  };

  const validateAvatar = async (avatarUrl: string) => {
    const response = await callAPI('validate_avatar', { avatarUrl });
    return response;
  };

  return {
    loading,
    avatarUrl,
    connectionStatus,
    testConnection,
    getAvatarUrl,
    saveAvatarUrl,
    validateAvatar,
  };
}
