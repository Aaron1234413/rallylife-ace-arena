import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Save, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StakePreferenceProps {
  userId: string;
  currentStakePreference?: string;
  onStakeUpdate?: (stakePreference: string) => void;
}

const stakePresets = [
  { value: 'any', label: 'Any Amount', description: 'Open to any stake level' },
  { value: 'none', label: 'No Stakes', description: 'Just for fun, no tokens' },
  { value: 'low', label: 'Low Stakes', description: '1-10 tokens' },
  { value: 'medium', label: 'Medium Stakes', description: '10-50 tokens' },
  { value: 'high', label: 'High Stakes', description: '50-200 tokens' },
  { value: 'custom', label: 'Custom Amount', description: 'Set your own range' }
];

export const StakePreference: React.FC<StakePreferenceProps> = ({
  userId,
  currentStakePreference = 'any',
  onStakeUpdate
}) => {
  const [stakePreference, setStakePreference] = useState(currentStakePreference);
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setStakePreference(currentStakePreference);
    
    // Parse custom values if current preference is a custom range
    if (currentStakePreference && currentStakePreference.includes('-')) {
      const [min, max] = currentStakePreference.split('-');
      if (min && max) {
        setCustomMin(min);
        setCustomMax(max);
      }
    }
  }, [currentStakePreference]);

  const handlePresetChange = (value: string) => {
    setStakePreference(value);
    if (value !== 'custom') {
      setCustomMin('');
      setCustomMax('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      let finalStakePreference = stakePreference;
      
      // If custom, create range string
      if (stakePreference === 'custom') {
        const min = parseInt(customMin) || 0;
        const max = parseInt(customMax) || 0;
        
        if (min < 0 || max < 0) {
          toast({
            title: "Invalid Range",
            description: "Token amounts must be positive numbers.",
            variant: "destructive",
          });
          return;
        }
        
        if (min > max) {
          toast({
            title: "Invalid Range",
            description: "Minimum amount cannot be greater than maximum.",
            variant: "destructive",
          });
          return;
        }
        
        finalStakePreference = `${min}-${max}`;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          stake_preference: finalStakePreference,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Stake Preference Updated",
        description: "Your preferred stake amount has been saved successfully.",
      });

      onStakeUpdate?.(finalStakePreference);
    } catch (error) {
      console.error('Error saving stake preference:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your stake preference. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPresetInfo = (value: string) => {
    return stakePresets.find(preset => preset.value === value);
  };

  const getCurrentStakeDisplay = () => {
    if (stakePreference === 'custom' && customMin && customMax) {
      return `${customMin}-${customMax} tokens`;
    }
    
    if (stakePreference.includes('-')) {
      return `${stakePreference} tokens`;
    }
    
    const preset = getPresetInfo(stakePreference);
    return preset ? preset.description : stakePreference;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Stake Preference
        </CardTitle>
        <CardDescription>
          Set your preferred token stake amount for competitive matches. This helps match you with players who want similar stakes.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stake preset selection */}
        <div className="space-y-3">
          <Label>Preferred Stake Level</Label>
          <Select value={stakePreference.includes('-') ? 'custom' : stakePreference} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your stake preference" />
            </SelectTrigger>
            <SelectContent>
              {stakePresets.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-xs text-muted-foreground">{preset.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom range inputs */}
        {(stakePreference === 'custom' || stakePreference.includes('-')) && (
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="custom-min">Minimum Tokens</Label>
              <Input
                id="custom-min"
                type="number"
                min="0"
                placeholder="0"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="text-center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-max">Maximum Tokens</Label>
              <Input
                id="custom-max"
                type="number"
                min="0"
                placeholder="100"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                className="text-center"
              />
            </div>
          </div>
        )}

        {/* Current selection display */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Current Preference:</span>
            <Badge variant="secondary">
              {getCurrentStakeDisplay()}
            </Badge>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={saving || (stakePreference === 'custom' && (!customMin || !customMax))}
            size="sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3 w-3 mr-2" />
                Save Preference
              </>
            )}
          </Button>
        </div>

        {/* Info section */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">How Stakes Work</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Stakes are optional and purely for competitive fun</li>
            <li>• Winner takes all tokens from the stake pool</li>
            <li>• You can always play friendly matches without stakes</li>
            <li>• Your preference helps match you with like-minded players</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};