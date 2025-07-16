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
  const [manualUTR, setManualUTR] = useState('');
  const [savingManual, setSavingManual] = useState(false);
  const [useManualUTR, setUseManualUTR] = useState(false);
  
  const { lookupUTR, loading: utrLoading } = useUTRLookup();
  const { toast } = useToast();

  // Generate UTR rating options from 1.0 to 16.5 in 0.5 increments
  const utrRatingOptions = [];
  for (let i = 1.0; i <= 16.5; i += 0.5) {
    utrRatingOptions.push({
      value: i.toString(),
      label: i.toFixed(1)
    });
  }

  // Updated skill levels to reflect actual UTR ranges
  const skillLevels = [
    { value: '1.0-2.0', label: 'Beginner (UTR 1.0-2.0)' },
    { value: '2.0-3.0', label: 'Novice (UTR 2.0-3.0)' },
    { value: '3.0-4.0', label: 'Recreational (UTR 3.0-4.0)' },
    { value: '4.0-5.0', label: 'Intermediate (UTR 4.0-5.0)' },
    { value: '5.0-6.0', label: 'Club Player (UTR 5.0-6.0)' },
    { value: '6.0-7.0', label: 'Strong Club (UTR 6.0-7.0)' },
    { value: '7.0-8.0', label: 'Local Tournament (UTR 7.0-8.0)' },
    { value: '8.0-9.0', label: 'Regional (UTR 8.0-9.0)' },
    { value: '9.0-10.0', label: 'Strong Regional (UTR 9.0-10.0)' },
    { value: '10.0-11.0', label: 'Sectional (UTR 10.0-11.0)' },
    { value: '11.0-12.0', label: 'National (UTR 11.0-12.0)' },
    { value: '12.0-13.0', label: 'High Performance (UTR 12.0-13.0)' },
    { value: '13.0-14.0', label: 'Elite Junior/College (UTR 13.0-14.0)' },
    { value: '14.0-15.0', label: 'Professional (UTR 14.0-15.0)' },
    { value: '15.0-16.5', label: 'World Class (UTR 15.0-16.5)' }
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
    if (useManualUTR) {
      if (!manualUTR) {
        toast({
          title: "Please Select UTR",
          description: "Please select your UTR rating.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!manualLevel) {
        toast({
          title: "Please Select Level",
          description: "Please select your skill level.",
          variant: "destructive",
        });
        return;
      }
    }

    setSavingManual(true);
    
    try {
      const updateData = useManualUTR 
        ? { 
            utr_rating: parseFloat(manualUTR),
            utr_verified: false,
            updated_at: new Date().toISOString()
          }
        : {
            manual_level: manualLevel,
            updated_at: new Date().toISOString()
          };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: useManualUTR ? "UTR Rating Saved" : "Skill Level Saved",
        description: useManualUTR 
          ? "Your UTR rating has been saved successfully."
          : "Your skill level has been saved successfully.",
      });

      onComplete?.(
        useManualUTR ? parseFloat(manualUTR) : undefined, 
        useManualUTR ? undefined : manualLevel
      );
    } catch (error) {
      console.error('Error saving manual level:', error);
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
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
            Get verified with your official UTR rating for the most accurate skill-based matchmaking.
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
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
                UTR
              </div>
              <span className="text-sm font-medium text-blue-800">Universal Tennis Rating</span>
            </div>
            <p className="text-xs text-blue-600 mb-3">
              Search for your official UTR rating for the most accurate matchmaking. UTR is the global standard for tennis player ratings.
            </p>
          </div>
          
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
            If you can't find your UTR or prefer to set your level manually, choose from skill ranges or enter your known UTR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="radio"
              id="useSkillLevel"
              name="manualType"
              checked={!useManualUTR}
              onChange={() => setUseManualUTR(false)}
              className="w-4 h-4 text-blue-600"
            />
            <Label htmlFor="useSkillLevel" className="text-sm font-medium">
              Use Skill Level Ranges
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="radio"
              id="useManualUTR"
              name="manualType"
              checked={useManualUTR}
              onChange={() => setUseManualUTR(true)}
              className="w-4 h-4 text-blue-600"
            />
            <Label htmlFor="useManualUTR" className="text-sm font-medium">
              I Know My UTR Rating
            </Label>
          </div>

          {useManualUTR ? (
            <div>
              <Label htmlFor="manualUTR">Your UTR Rating (1.0-16.5)</Label>
              <Select value={manualUTR} onValueChange={setManualUTR}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your UTR rating" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {utrRatingOptions.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                      UTR {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Only enter this if you know your current official UTR rating
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="skillLevel">Skill Level Range</Label>
              <Select value={manualLevel} onValueChange={setManualLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your skill level range" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {skillLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose the range that best matches your current playing level
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleManualSave}
            disabled={savingManual || (!manualLevel && !useManualUTR) || (useManualUTR && !manualUTR)}
            variant="outline"
            className="w-full"
          >
            {savingManual ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              useManualUTR ? 'Save UTR Rating' : 'Save Skill Level'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};