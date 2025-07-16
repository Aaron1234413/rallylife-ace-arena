import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Edit, Plus } from 'lucide-react';
import { AvailabilityScheduler } from './AvailabilityScheduler';

interface TimeSlot {
  day: string;
  slots: string[];
}

// Mock data - in real app this would come from the database
const mockAvailability: TimeSlot[] = [
  { day: 'Monday', slots: ['evening'] },
  { day: 'Tuesday', slots: ['evening'] },
  { day: 'Wednesday', slots: ['evening'] },
  { day: 'Thursday', slots: ['evening'] },
  { day: 'Friday', slots: ['evening'] },
  { day: 'Saturday', slots: ['morning', 'afternoon'] },
  { day: 'Sunday', slots: ['morning', 'afternoon'] },
];

const timeSlotLabels = {
  morning: 'Morning (6AM-12PM)',
  afternoon: 'Afternoon (12PM-6PM)',
  evening: 'Evening (6PM-10PM)',
};

export function ProfileAvailability() {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasAvailability = mockAvailability.some(day => day.slots.length > 0);
  const totalSlots = mockAvailability.reduce((total, day) => total + day.slots.length, 0);
  const activeDays = mockAvailability.filter(day => day.slots.length > 0).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Match Availability
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <AvailabilityScheduler />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasAvailability ? (
          <>
            {/* Summary stats */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {totalSlots} time slots
              </Badge>
              <Badge variant="secondary">
                {activeDays} days available
              </Badge>
            </div>
            
            {/* Availability grid */}
            <div className="space-y-3">
              {mockAvailability.map(day => (
                day.slots.length > 0 && (
                  <div key={day.day} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="font-medium text-sm">{day.day}</div>
                    <div className="flex flex-wrap gap-1">
                      {day.slots.map(slot => (
                        <Badge key={slot} variant="outline" className="text-xs">
                          {timeSlotLabels[slot as keyof typeof timeSlotLabels]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">No availability set</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Availability
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <AvailabilityScheduler />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}