
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { AppointmentRequest } from '@/hooks/useAppointmentRequests';
import { format } from 'date-fns';

interface AppointmentRequestCardProps {
  request: AppointmentRequest;
  userRole: 'coach' | 'player';
  onApprove?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  isProcessing?: boolean;
}

export function AppointmentRequestCard({ 
  request, 
  userRole, 
  onApprove, 
  onDecline, 
  isProcessing 
}: AppointmentRequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'h:mm a');
  };

  const otherPartyName = userRole === 'coach' ? request.player_name : request.coach_name;
  const isPending = request.status === 'pending';
  const isExpired = new Date(request.expires_at) < new Date();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {request.appointment_type.charAt(0).toUpperCase() + request.appointment_type.slice(1)} Request
          </CardTitle>
          <Badge className={getStatusColor(request.status)}>
            {isExpired && isPending ? 'Expired' : request.status}
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
          <span>{format(new Date(request.requested_date), 'EEEE, MMMM d, yyyy')}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatTime(request.requested_start_time)} - {formatTime(request.requested_end_time)}</span>
        </div>

        {request.message && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Message:</span>
            </div>
            <p className="text-sm bg-muted p-2 rounded">{request.message}</p>
          </div>
        )}

        {request.response_message && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Response:</div>
            <p className="text-sm bg-muted p-2 rounded">{request.response_message}</p>
          </div>
        )}

        {isPending && !isExpired && userRole === 'coach' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onApprove?.(request.id)}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDecline?.(request.id)}
              disabled={isProcessing}
            >
              Decline
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Requested {format(new Date(request.created_at), 'MMM d, yyyy at h:mm a')}
          {isPending && (
            <span> • Expires {format(new Date(request.expires_at), 'MMM d, yyyy at h:mm a')}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
