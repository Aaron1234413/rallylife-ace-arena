import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockAvailability = [
  {
    id: 1,
    day: 'Today',
    time: '2:00 PM - 4:00 PM',
    status: 'available'
  },
  {
    id: 2,
    day: 'Tomorrow',
    time: '10:00 AM - 12:00 PM',
    status: 'available'
  },
  {
    id: 3,
    day: 'Friday',
    time: '6:00 PM - 8:00 PM',
    status: 'booked'
  }
];

export function UpcomingAvailability() {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-tennis-green-dark">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Availability
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/availability">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAvailability.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between p-3 bg-tennis-green-bg/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-tennis-green-medium" />
              <div>
                <p className="font-medium text-tennis-green-dark text-sm">{slot.day}</p>
                <p className="text-xs text-tennis-green-dark/70">{slot.time}</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              slot.status === 'available' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {slot.status === 'available' ? 'Available' : 'Booked'}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}