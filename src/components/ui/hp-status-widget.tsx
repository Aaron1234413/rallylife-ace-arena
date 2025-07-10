import React, { useState, useEffect } from 'react';
import { HPIndicator, HPWarning } from './hp-indicator';
import { HPRestoreDialog } from '../sessions/HPRestoreDialog';
import { Button } from './button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Heart, Plus } from 'lucide-react';

interface PlayerHP {
  current_hp: number;
  max_hp: number;
  last_activity: string;
}

export function HPStatusWidget() {
  const { user } = useAuth();
  const [hpData, setHpData] = useState<PlayerHP>({ current_hp: 100, max_hp: 100, last_activity: new Date().toISOString() });
  const [loading, setLoading] = useState(true);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fetchHPData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('player_hp')
        .select('current_hp, max_hp, last_activity')
        .eq('player_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching HP data:', error);
        return;
      }

      if (data) {
        setHpData(data);
      }
    } catch (error) {
      console.error('Error fetching HP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreHP = async (method: string) => {
    if (!user) return;

    setRestoring(true);
    try {
      let hpRestore = 0;
      let description = '';

      switch (method) {
        case 'rest':
          hpRestore = 20;
          description = 'Rested for 8 hours';
          break;
        case 'coffee':
          hpRestore = 15;
          description = 'Energy drink consumed';
          break;
        case 'workout':
          hpRestore = 25;
          description = 'Light workout completed';
          break;
      }

      const { data, error } = await supabase
        .rpc('restore_hp', {
          user_id: user.id,
          restoration_amount: hpRestore,
          activity_type: method,
          description: description
        });

      if (error) throw error;

      toast.success(`HP restored! +${hpRestore} HP`);
      setShowRestoreDialog(false);
      await fetchHPData();
    } catch (error) {
      console.error('Error restoring HP:', error);
      toast.error('Failed to restore HP');
    } finally {
      setRestoring(false);
    }
  };

  useEffect(() => {
    fetchHPData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
        <Heart className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading HP...</span>
      </div>
    );
  }

  const hpPercentage = (hpData.current_hp / hpData.max_hp) * 100;
  const isLowHP = hpPercentage < 30;

  return (
    <>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isLowHP ? 'bg-red-50 border border-red-200' : 'bg-muted/30'
      }`}>
        <HPIndicator 
          currentHP={hpData.current_hp} 
          maxHP={hpData.max_hp}
          size="sm"
        />
        
        {isLowHP && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRestoreDialog(true)}
            className="h-auto p-1 text-red-600 hover:text-red-700"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      <HPRestoreDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        currentHP={hpData.current_hp}
        maxHP={hpData.max_hp}
        onRestoreHP={handleRestoreHP}
        isLoading={restoring}
      />
    </>
  );
}