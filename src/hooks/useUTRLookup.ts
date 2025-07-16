import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UTRLookupResult {
  success: boolean;
  utr_rating?: number;
  utr_verified?: boolean;
  player_name?: string;
  source?: string;
  error?: string;
  fallback_required?: boolean;
  searched_name?: string;
}

export const useUTRLookup = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const lookupUTR = async (
    firstName: string,
    lastName: string,
    email: string,
    userId: string
  ): Promise<UTRLookupResult> => {
    setLoading(true);
    
    try {
      console.log(`Starting UTR lookup for: ${firstName} ${lastName}`);
      
      const { data, error } = await supabase.functions.invoke('utr-lookup', {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          userId
        }
      });

      if (error) {
        console.error('UTR lookup error:', error);
        throw error;
      }

      console.log('UTR lookup result:', data);

      if (data.success && data.utr_rating) {
        toast({
          title: "UTR Rating Found!",
          description: `Found UTR rating: ${data.utr_rating}${data.utr_verified ? ' (Verified)' : ' (Unverified)'}`,
          duration: 5000,
        });
      } else if (data.fallback_required) {
        toast({
          title: "UTR Not Found",
          description: "Please set your skill level manually for now.",
          variant: "default",
          duration: 5000,
        });
      }

      return data;
    } catch (error) {
      console.error('Error in UTR lookup:', error);
      
      toast({
        title: "UTR Lookup Failed",
        description: "Unable to fetch UTR rating. Please set your skill level manually.",
        variant: "destructive",
        duration: 5000,
      });

      return {
        success: false,
        error: error.message || 'Unknown error',
        fallback_required: true
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    lookupUTR,
    loading
  };
};