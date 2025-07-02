import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  Save, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useCourtBooking, Court, CourtAvailability } from '@/hooks/useCourtBooking';
import { toast } from 'sonner';

interface AvailabilitySettingsProps {
  court: Court;
  canManage: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_bookable: boolean;
}

export function AvailabilitySettings({ court, canManage }: AvailabilitySettingsProps) {
  const { availability, fetchCourtAvailability, setCourtAvailability } = useCourtBooking();
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (court?.id) {
      loadAvailability();
    }
  }, [court?.id]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const data = await fetchCourtAvailability(court.id);
      setSlots(data.map(slot => ({
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_bookable: slot.is_bookable
      })));
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '17:00',
      is_bookable: true
    };
    setSlots(prev => [...prev, newSlot]);
    setHasChanges(true);
  };

  const updateSlot = (index: number, updates: Partial<AvailabilitySlot>) => {
    setSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, ...updates } : slot
    ));
    setHasChanges(true);
  };

  const removeSlot = (index: number) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    // Validate slots
    for (const slot of slots) {
      if (slot.start_time >= slot.end_time) {
        toast.error('Start time must be before end time for all slots');
        return;
      }
    }

    setLoading(true);
    try {
      await setCourtAvailability(court.id, slots);
      setHasChanges(false);
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadAvailability();
    setHasChanges(false);
  };

  const setDefaultHours = () => {
    const defaultSlots: AvailabilitySlot[] = DAYS_OF_WEEK.map(day => ({
      day_of_week: day.value,
      start_time: '09:00',
      end_time: '21:00',
      is_bookable: true
    }));
    setSlots(defaultSlots);
    setHasChanges(true);
  };

  if (!canManage) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h3 className="font-medium mb-2">Access Restricted</h3>
          <p className="text-sm text-muted-foreground">
            Only club owners and admins can manage court availability.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getSlotsByDay = (dayOfWeek: number) => {
    return slots.filter(slot => slot.day_of_week === dayOfWeek);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Set when {court.name} is available for booking
            </p>
          </div>
          <div className="flex items-center gap-2">
            {slots.length === 0 && (
              <Button variant="outline" onClick={setDefaultHours}>
                Set Default Hours
              </Button>
            )}
            {hasChanges && (
              <>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && slots.length === 0 ? (
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(day => (
              <div key={day.value} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {DAYS_OF_WEEK.map(day => {
              const daySlots = getSlotsByDay(day.value);
              
              return (
                <div key={day.value} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{day.label}</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addTimeSlot(day.value)}
                    >
                      Add Hours
                    </Button>
                  </div>
                  
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No availability set for {day.label}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {daySlots.map((slot, slotIndex) => {
                        const globalIndex = slots.findIndex(s => 
                          s.day_of_week === slot.day_of_week && 
                          s.start_time === slot.start_time &&
                          s.end_time === slot.end_time
                        );
                        
                        return (
                          <div key={`${slot.day_of_week}-${slot.start_time}-${slotIndex}`} 
                               className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">From:</Label>
                              <select 
                                value={slot.start_time}
                                onChange={(e) => updateSlot(globalIndex, { start_time: e.target.value })}
                                className="text-sm border rounded px-2 py-1"
                              >
                                {TIME_SLOTS.map(time => (
                                  <option key={time.value} value={time.value}>
                                    {time.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">To:</Label>
                              <select 
                                value={slot.end_time}
                                onChange={(e) => updateSlot(globalIndex, { end_time: e.target.value })}
                                className="text-sm border rounded px-2 py-1"
                              >
                                {TIME_SLOTS.map(time => (
                                  <option key={time.value} value={time.value}>
                                    {time.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={slot.is_bookable}
                                onCheckedChange={(checked) => 
                                  updateSlot(globalIndex, { is_bookable: checked })
                                }
                              />
                              <Label className="text-xs">
                                {slot.is_bookable ? 'Bookable' : 'Blocked'}
                              </Label>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSlot(globalIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            {slots.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-medium mb-2">No Availability Set</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set the hours when this court is available for booking
                </p>
                <Button onClick={setDefaultHours}>
                  Set Default Hours (9 AM - 9 PM)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}