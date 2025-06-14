
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useAppointmentRequests } from '@/hooks/useAppointmentRequests';
import { AppointmentCard } from '@/components/scheduling/AppointmentCard';
import { AppointmentRequestCard } from '@/components/scheduling/AppointmentRequestCard';
import { BookAppointmentDialog } from '@/components/scheduling/BookAppointmentDialog';
import { useProfiles } from '@/hooks/useProfiles';

export default function Scheduling() {
  const { user } = useAuth();
  const { appointments, isLoading: appointmentsLoading, approveAppointmentRequest, isApprovingRequest } = useAppointments();
  const { requests, isLoading: requestsLoading, declineRequest, isDeclining } = useAppointmentRequests();
  const { data: profiles } = useProfiles();

  // Get user role from their profile
  const userProfile = profiles?.find(p => p.id === user?.id);
  const userRole = userProfile?.role || 'player';

  // Filter coaches for booking dialog
  const coaches = profiles?.filter(p => p.role === 'coach') || [];

  const handleApproveRequest = (requestId: string) => {
    approveAppointmentRequest({
      request_id: requestId,
      response_message: 'Appointment approved!',
    });
  };

  const handleDeclineRequest = (requestId: string) => {
    declineRequest({
      requestId,
      responseMessage: 'Unfortunately, this time slot is not available.',
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Scheduling</h1>
          {userRole === 'player' && coaches.length > 0 && (
            <BookAppointmentDialog 
              coachId={coaches[0].id} 
              coachName={coaches[0].full_name || 'Coach'}
            >
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </BookAppointmentDialog>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="appointments" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Requests
              {pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Your Appointments</h2>
              {appointmentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    {userRole === 'player' 
                      ? "You don't have any upcoming appointments. Book one to get started!"
                      : "You don't have any upcoming appointments with students."
                    }
                  </p>
                  {userRole === 'player' && coaches.length > 0 && (
                    <BookAppointmentDialog 
                      coachId={coaches[0].id} 
                      coachName={coaches[0].full_name || 'Coach'}
                    >
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Book Your First Appointment
                      </Button>
                    </BookAppointmentDialog>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      userRole={userRole as 'coach' | 'player'}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <div className="space-y-6">
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-orange-600">
                    Pending Requests ({pendingRequests.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingRequests.map((request) => (
                      <AppointmentRequestCard
                        key={request.id}
                        request={request}
                        userRole={userRole as 'coach' | 'player'}
                        onApprove={userRole === 'coach' ? handleApproveRequest : undefined}
                        onDecline={userRole === 'coach' ? handleDeclineRequest : undefined}
                        isProcessing={isApprovingRequest || isDeclining}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Processed Requests */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Request History</h2>
                {requestsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : processedRequests.length === 0 && pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No appointment requests</h3>
                    <p className="text-muted-foreground">
                      {userRole === 'player' 
                        ? "You haven't made any appointment requests yet."
                        : "You haven't received any appointment requests yet."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {processedRequests.map((request) => (
                      <AppointmentRequestCard
                        key={request.id}
                        request={request}
                        userRole={userRole as 'coach' | 'player'}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">
                {userRole === 'coach' ? 'Your Availability' : 'Coach Availability'}
              </h2>
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Availability Management</h3>
                <p className="text-muted-foreground">
                  {userRole === 'coach' 
                    ? "Set your available time slots for students to book appointments."
                    : "View when your coaches are available for appointments."
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This feature will be available soon.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
