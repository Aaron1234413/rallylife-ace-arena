import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvailabilityPickerProps {
  userId: string;
  currentAvailability?: Record<string, string[]>;
  onAvailabilityUpdate?: (availability: Record<string, string[]>) => void;
}

type TimeSlot = 'morning' | 'afternoon' | 'evening';
type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const weekDays: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const timeSlots: TimeSlot[] = ['morning', 'afternoon', 'evening'];

const dayLabels = {
  monday: 'Monday',
  tuesday: 'Tuesday', 
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

const timeLabels = {
  morning: 'Morning (6-12)',
  afternoon: 'Afternoon (12-18)',
  evening: 'Evening (18-22)'
};

export const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  userId,
  currentAvailability = {},
  onAvailabilityUpdate
}) => {
  const [availability, setAvailability] = useState<Record<string, string[]>>(currentAvailability);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setAvailability(currentAvailability);
  }, [currentAvailability]);

  const isSlotSelected = (day: WeekDay, slot: TimeSlot): boolean => {
    return availability[day]?.includes(slot) || false;
  };

  const toggleSlot = (day: WeekDay, slot: TimeSlot) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const newSlots = daySlots.includes(slot)
        ? daySlots.filter(s => s !== slot)
        : [...daySlots, slot];
      
      const newAvailability = {
        ...prev,
        [day]: newSlots
      };

      // Remove empty days
      if (newSlots.length === 0) {
        delete newAvailability[day];
      }

      return newAvailability;
    });
  };

  const clearDay = (day: WeekDay) => {
    setAvailability(prev => {
      const newAvailability = { ...prev };
      delete newAvailability[day];
      return newAvailability;
    });
  };

  const setFullDay = (day: WeekDay) => {
    setAvailability(prev => ({
      ...prev,
      [day]: [...timeSlots]
    }));
  };

  const clearAll = () => {
    setAvailability({});
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          availability,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Availability Updated",
        description: "Your playing availability has been saved successfully.",
      });

      onAvailabilityUpdate?.(availability);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSelectedSlotsCount = () => {
    return Object.values(availability).reduce((total, slots) => total + slots.length, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Availability
        </CardTitle>
        <CardDescription>
          Select the times when you're available to play tennis. This helps us match you with other players.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Time slot grid */}
        <div className="grid grid-cols-1 gap-4">
          {weekDays.map(day => (
            <div key={day} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">{dayLabels[day]}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFullDay(day)}
                    className="text-xs h-6 px-2"
                  >
                    All Day
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearDay(day)}
                    className="text-xs h-6 px-2"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(slot => (
                  <Button
                    key={slot}
                    variant={isSlotSelected(day, slot) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSlot(day, slot)}
                    className={cn(
                      "text-xs h-8 transition-colors",
                      isSlotSelected(day, slot) 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {timeLabels[slot]}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {getSelectedSlotsCount()} time slots selected
            </Badge>
            {getSelectedSlotsCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs h-6 px-2"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={saving}
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
                Save Availability
              </>
            )}
          </Button>
        </div>

        {/* Quick suggestions */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Quick Presets:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                const newAvailability: Record<string, string[]> = {};
                weekdays.forEach(day => {
                  newAvailability[day] = ['evening'];
                });
                setAvailability(newAvailability);
              }}
              className="text-xs"
            >
              Weekday Evenings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAvailability({
                  saturday: ['morning', 'afternoon'],
                  sunday: ['morning', 'afternoon']
                });
              }}
              className="text-xs"
            >
              Weekend Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allDays: Record<string, string[]> = {};
                weekDays.forEach(day => {
                  allDays[day] = ['morning', 'afternoon', 'evening'];
                });
                setAvailability(allDays);
              }}
              className="text-xs"
            >
              Always Available
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};