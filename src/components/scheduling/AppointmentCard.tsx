
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react';
import { Appointment } from '@/hooks/useAppointments';
import { format } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: 'coach' | 'player';
  onCancel?: (appointmentId: string) => void;
  onComplete?: (appointmentId: string) => void;
}

export function AppointmentCard({ appointment, userRole, onCancel, onComplete }: AppointmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'h:mm a');
  };

  const otherPartyName = userRole === 'coach' ? appointment.player_name : appointment.coach_name;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{appointment.title}</CardTitle>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{userRole === 'coach' ? 'Student' : 'Coach'}: {otherPartyName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(appointment.scheduled_date), 'EEEE, MMMM d, yyyy')}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
          <span className="text-xs">({appointment.duration_minutes} min)</span>
        </div>

        {appointment.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{appointment.location}</span>
          </div>
        )}

        {appointment.price_amount && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>${appointment.price_amount}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Badge variant="outline" className="text-xs">
            {appointment.appointment_type}
          </Badge>
        </div>

        {appointment.status === 'confirmed' && (
          <div className="flex gap-2 pt-2">
            {onComplete && (
              <Button
                size="sm"
                onClick={() => onComplete(appointment.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark Complete
              </Button>
            )}
            {onCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancel(appointment.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
