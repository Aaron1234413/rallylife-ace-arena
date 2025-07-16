import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, User } from 'lucide-react';
import { useUTRLookup } from '@/hooks/useUTRLookup';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UTRSetupProps {
  userId: string;
  currentUTR?: number;
  currentLevel?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  onComplete?: (utrRating?: number, manualLevel?: string) => void;
}

export const UTRSetup: React.FC<UTRSetupProps> = ({
  userId,
  currentUTR,
  currentLevel,
  firstName,
  lastName,
  email,
  onComplete
}) => {
  const [searchFirstName, setSearchFirstName] = useState(firstName || '');
  const [searchLastName, setSearchLastName] = useState(lastName || '');
  const [manualLevel, setManualLevel] = useState(currentLevel || '');
  const [savingManual, setSavingManual] = useState(false);
  
  const { lookupUTR, loading: utrLoading } = useUTRLookup();
  const { toast } = useToast();

  const skillLevels = [
    { value: 'beginner', label: 'Beginner (1.0-2.5)' },
    { value: 'intermediate_low', label: 'Intermediate Low (2.5-4.0)' },
    { value: 'intermediate', label: 'Intermediate (4.0-5.5)' },
    { value: 'intermediate_high', label: 'Intermediate High (5.5-7.0)' },
    { value: 'advanced', label: 'Advanced (7.0-9.0)' },
    { value: 'expert', label: 'Expert (9.0+)' }
  ];

  const handleUTRLookup = async () => {
    if (!searchFirstName.trim() || !searchLastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both first and last name for UTR lookup.",
        variant: "destructive",
      });
      return;
    }

    const result = await lookupUTR(
      searchFirstName,
      searchLastName,
      email || '',
      userId
    );

    if (result.success && result.utr_rating) {
      onComplete?.(result.utr_rating, undefined);
    }
  };

  const handleManualSave = async () => {
    if (!manualLevel) {
      toast({
        title: "Please Select Level",
        description: "Please select your skill level.",
        variant: "destructive",
      });
      return;
    }

    setSavingManual(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          manual_level: manualLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Skill Level Saved",
        description: "Your skill level has been saved successfully.",
      });

      onComplete?.(undefined, manualLevel);
    } catch (error) {
      console.error('Error saving manual level:', error);
      toast({
        title: "Error",
        description: "Failed to save skill level. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingManual(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* UTR Lookup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            UTR Lookup
          </CardTitle>
          <CardDescription>
            Search for your official UTR (Universal Tennis Rating) to get accurate matchmaking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUTR ? (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Current UTR Rating: <span className="text-lg">{currentUTR}</span>
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={searchFirstName}
                    onChange={(e) => setSearchFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={searchLastName}
                    onChange={(e) => setSearchLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleUTRLookup}
                disabled={utrLoading || !searchFirstName.trim() || !searchLastName.trim()}
                className="w-full"
              >
                {utrLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching UTR Database...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Look Up My UTR
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Manual Level Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Manual Skill Level
          </CardTitle>
          <CardDescription>
            If UTR lookup doesn't work or you prefer to set your level manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="skillLevel">Skill Level</Label>
            <Select value={manualLevel} onValueChange={setManualLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select your skill level" />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleManualSave}
            disabled={savingManual || !manualLevel}
            variant="outline"
            className="w-full"
          >
            {savingManual ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Manual Level'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};