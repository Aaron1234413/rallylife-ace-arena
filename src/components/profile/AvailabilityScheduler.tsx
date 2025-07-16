import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  fullName: string;
  slots: string[];
}

const timeSlots: TimeSlot[] = [
  { id: 'morning', label: 'Morning', start: '6:00', end: '12:00' },
  { id: 'afternoon', label: 'Afternoon', start: '12:00', end: '18:00' },
  { id: 'evening', label: 'Evening', start: '18:00', end: '22:00' },
];

const days = [
  { day: 'monday', fullName: 'Monday' },
  { day: 'tuesday', fullName: 'Tuesday' },
  { day: 'wednesday', fullName: 'Wednesday' },
  { day: 'thursday', fullName: 'Thursday' },
  { day: 'friday', fullName: 'Friday' },
  { day: 'saturday', fullName: 'Saturday' },
  { day: 'sunday', fullName: 'Sunday' },
];

export function AvailabilityScheduler() {
  const [availability, setAvailability] = useState<DayAvailability[]>(
    days.map(d => ({ ...d, slots: [] }))
  );
  const [activeTab, setActiveTab] = useState('schedule');

  const toggleSlot = (dayIndex: number, slotId: string) => {
    setAvailability(prev => 
      prev.map((day, index) => 
        index === dayIndex 
          ? {
              ...day,
              slots: day.slots.includes(slotId)
                ? day.slots.filter(s => s !== slotId)
                : [...day.slots, slotId]
            }
          : day
      )
    );
  };

  const clearDay = (dayIndex: number) => {
    setAvailability(prev =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, slots: [] } : day
      )
    );
  };

  const setAllDay = (dayIndex: number) => {
    setAvailability(prev =>
      prev.map((day, index) =>
        index === dayIndex 
          ? { ...day, slots: timeSlots.map(s => s.id) }
          : day
      )
    );
  };

  const applyPreset = (preset: string) => {
    let newAvailability = [...availability];
    
    switch (preset) {
      case 'weekday-evenings':
        newAvailability = days.map((d, index) => ({
          ...d,
          slots: index < 5 ? ['evening'] : []
        }));
        break;
      case 'weekend-days':
        newAvailability = days.map((d, index) => ({
          ...d,
          slots: index >= 5 ? ['morning', 'afternoon'] : []
        }));
        break;
      case 'always-available':
        newAvailability = days.map(d => ({
          ...d,
          slots: timeSlots.map(s => s.id)
        }));
        break;
      case 'clear-all':
        newAvailability = days.map(d => ({ ...d, slots: [] }));
        break;
    }
    
    setAvailability(newAvailability);
  };

  const getTotalSlots = () => {
    return availability.reduce((total, day) => total + day.slots.length, 0);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Calendar className="h-5 w-5" />
          Set Your Availability
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose when you're available for tennis matches
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="presets">Quick Presets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="space-y-4">
            {/* Mobile-optimized day cards */}
            <div className="space-y-3">
              {availability.map((day, dayIndex) => (
                <Card key={day.day} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-base">{day.fullName}</h3>
                        {day.slots.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAllDay(dayIndex)}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          All Day
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearDay(dayIndex)}
                          className="text-xs px-2 py-1 h-auto text-muted-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    
                    {/* Time slot buttons - mobile optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {timeSlots.map(slot => (
                        <Button
                          key={slot.id}
                          variant={day.slots.includes(slot.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSlot(dayIndex, slot.id)}
                          className={cn(
                            "flex flex-col items-center py-3 h-auto transition-all duration-200",
                            day.slots.includes(slot.id) 
                              ? "bg-primary text-primary-foreground shadow-md" 
                              : "hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium text-sm">{slot.label}</span>
                          </div>
                          <span className="text-xs opacity-80">
                            {slot.start} - {slot.end}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => applyPreset('weekday-evenings')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Zap className="h-4 w-4" />
                <div className="text-center">
                  <div className="font-medium">Weekday Evenings</div>
                  <div className="text-xs text-muted-foreground">Mon-Fri 6PM-10PM</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => applyPreset('weekend-days')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Calendar className="h-4 w-4" />
                <div className="text-center">
                  <div className="font-medium">Weekend Days</div>
                  <div className="text-xs text-muted-foreground">Sat-Sun 6AM-6PM</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => applyPreset('always-available')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Clock className="h-4 w-4" />
                <div className="text-center">
                  <div className="font-medium">Always Available</div>
                  <div className="text-xs text-muted-foreground">All times</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => applyPreset('clear-all')}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <div className="text-center">
                  <div className="font-medium">Clear All</div>
                  <div className="text-xs text-muted-foreground">Remove all availability</div>
                </div>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Summary and save */}
        <div className="border-t pt-4 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {getTotalSlots()} time slots selected across {availability.filter(d => d.slots.length > 0).length} days
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1 animate-fade-in">
              Save Availability
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}