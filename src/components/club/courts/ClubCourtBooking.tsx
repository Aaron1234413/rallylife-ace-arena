import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Target,
  Zap,
  Users
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';

interface ClubCourtBookingProps {
  club: Club;
  canBook: boolean;
}

export function ClubCourtBooking({ club, canBook }: ClubCourtBookingProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Mock court data
  const courts = [
    {
      id: '1',
      name: 'Court 1',
      surface: 'Hard Court',
      status: 'available',
      hourlyRate: 25,
      description: 'Premier court with professional lighting'
    },
    {
      id: '2',
      name: 'Court 2',
      surface: 'Clay Court',
      status: 'available',
      hourlyRate: 30,
      description: 'Traditional clay surface for advanced players'
    },
    {
      id: '3',
      name: 'Court 3',
      surface: 'Hard Court',
      status: 'maintenance',
      hourlyRate: 25,
      description: 'Standard court - currently under maintenance'
    },
    {
      id: '4',
      name: 'Court 4',
      surface: 'Grass Court',
      status: 'available',
      hourlyRate: 35,
      description: 'Exclusive grass court for tournaments'
    }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'booked':
        return <Badge className="bg-red-100 text-red-800">Booked</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSurfaceIcon = (surface: string) => {
    switch (surface) {
      case 'Hard Court':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'Clay Court':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'Grass Court':
        return <Users className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedCourt || !selectedTime) {
      return;
    }
    
    // Mock booking functionality
    console.log('Booking court:', {
      court: selectedCourt,
      date: selectedDate,
      time: selectedTime
    });
  };

  if (!canBook) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2">Member Access Required</h3>
          <p className="text-sm text-muted-foreground">
            You must be a club member to book courts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-tennis-green-dark">Court Booking</h2>
        <p className="text-sm text-tennis-green-medium">
          Reserve courts for your tennis sessions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book a Court
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Court</label>
              <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a court" />
                </SelectTrigger>
                <SelectContent>
                  {courts.filter(court => court.status === 'available').map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name} - {court.surface} (${court.hourlyRate}/hour)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedCourt || !selectedTime}
              className="w-full"
            >
              Book Court
            </Button>
          </CardContent>
        </Card>

        {/* Courts Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Available Courts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courts.map((court) => (
              <div key={court.id} className="p-4 border rounded-lg hover:bg-tennis-green-bg/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSurfaceIcon(court.surface)}
                    <h3 className="font-medium">{court.name}</h3>
                  </div>
                  {getStatusBadge(court.status)}
                </div>
                
                <p className="text-sm text-tennis-green-medium mb-2">{court.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {court.surface}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${court.hourlyRate}/hour
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}