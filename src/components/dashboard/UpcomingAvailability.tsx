import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

interface UpcomingAvailabilityProps {
  className?: string;
}

export function UpcomingAvailability({ className }: UpcomingAvailabilityProps) {
  const navigate = useNavigate();
  
  // Mock data - replace with actual hook when implemented
  const availabilitySlots: AvailabilitySlot[] = [
    {
      id: '1',
      date: 'Today',
      startTime: '6:00 PM',
      endTime: '8:00 PM',
      isBooked: false
    },
    {
      id: '2',
      date: 'Tomorrow',
      startTime: '9:00 AM',
      endTime: '11:00 AM',
      isBooked: false
    },
    {
      id: '3',
      date: 'Friday',
      startTime: '7:00 PM',
      endTime: '9:00 PM',
      isBooked: true
    }
  ];

  const handleManageAvailability = () => {
    navigate('/profile?tab=availability');
  };

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-white/20 shadow-xl ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Calendar className="h-5 w-5" />
            Upcoming Availability
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageAvailability}
            className="border-tennis-green-bg/30 text-tennis-green-dark hover:bg-tennis-green-light/20"
          >
            <Plus className="h-4 w-4 mr-1" />
            Manage
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {availabilitySlots.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 text-tennis-green-medium mx-auto mb-2" />
            <p className="text-sm text-tennis-green-dark/70 mb-3">
              No availability set
            </p>
            <Button
              onClick={handleManageAvailability}
              className="bg-tennis-green-primary hover:bg-tennis-green-medium text-white"
              size="sm"
            >
              Set Availability
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilitySlots.slice(0, 3).map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  slot.isBooked
                    ? 'bg-green-50 border-green-200'
                    : 'bg-tennis-green-bg/10 border-tennis-green-bg/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-medium text-tennis-green-dark">
                    <Calendar className="h-4 w-4" />
                    {slot.date}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-tennis-green-dark/70">
                    <Clock className="h-4 w-4" />
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
                <div className="text-xs">
                  {slot.isBooked ? (
                    <span className="text-green-600 font-medium">Booked</span>
                  ) : (
                    <span className="text-tennis-green-medium">Available</span>
                  )}
                </div>
              </div>
            ))}
            
            {availabilitySlots.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManageAvailability}
                className="w-full text-tennis-green-dark hover:bg-tennis-green-light/20"
              >
                View all ({availabilitySlots.length} slots)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}