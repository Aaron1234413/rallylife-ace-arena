import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle, Clock, Coins, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateCourtPricing } from '@/utils/pricing';

interface Court {
  id: string;
  name: string;
  surface_type: string;
  hourly_rate_tokens: number;
  hourly_rate_money: number;
  is_active: boolean;
}

interface Booking {
  court_id: string;
  start_time: string;
  end_time: string;
  user_id?: string;
}

interface TimeSlotSelection {
  courtId: string;
  startTime: string;
  duration: number;
}

interface InteractiveTimeGridProps {
  courts: Court[];
  timeSlots: string[];
  bookings: Booking[];
  selectedDate: Date;
  currentUserId?: string;
  onSelectionChange: (selection: TimeSlotSelection | null) => void;
  onBookingClick: (courtId: string, time: string, duration: number) => void;
}

const DURATION_OPTIONS = [
  { value: 1, label: '1 hour', minutes: 60 },
  { value: 1.5, label: '1.5 hours', minutes: 90 },
  { value: 2, label: '2 hours', minutes: 120 },
  { value: 2.5, label: '2.5 hours', minutes: 150 },
  { value: 3, label: '3 hours', minutes: 180 },
  { value: 4, label: '4 hours', minutes: 240 }
];

export function InteractiveTimeGrid({
  courts,
  timeSlots,
  bookings,
  selectedDate,
  currentUserId,
  onSelectionChange,
  onBookingClick
}: InteractiveTimeGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotSelection | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [hoveredSlot, setHoveredSlot] = useState<{ courtId: string; time: string } | null>(null);

  useEffect(() => {
    // Clear selection when date changes
    setSelectedSlot(null);
    onSelectionChange(null);
  }, [selectedDate, onSelectionChange]);

  const isSlotBooked = (courtId: string, time: string) => {
    return bookings.some(booking =>
      booking.court_id === courtId &&
      booking.start_time.slice(0, 5) === time
    );
  };

  const getBookingInfo = (courtId: string, time: string) => {
    return bookings.find(booking =>
      booking.court_id === courtId &&
      booking.start_time.slice(0, 5) === time
    );
  };

  const isSlotAvailable = (courtId: string, startTime: string, durationHours: number) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = startHour + durationHours;

    // Check if any slot in the duration range is booked
    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      if (isSlotBooked(courtId, timeSlot)) {
        return false;
      }
    }

    // Check if end time extends beyond available time slots
    const lastSlot = timeSlots[timeSlots.length - 1];
    const lastHour = parseInt(lastSlot.split(':')[0]);
    if (endHour > lastHour + 1) {
      return false;
    }

    return true;
  };

  const handleSlotClick = (courtId: string, time: string) => {
    if (isSlotBooked(courtId, time)) return;

    const newSelection = { courtId, startTime: time, duration };
    
    // Check if the full duration is available
    if (!isSlotAvailable(courtId, time, duration)) {
      // Find the maximum available duration from this slot
      let maxDuration = 0;
      for (let d = 0.5; d <= 4; d += 0.5) {
        if (isSlotAvailable(courtId, time, d)) {
          maxDuration = d;
        } else {
          break;
        }
      }
      
      if (maxDuration === 0) {
        return; // No availability
      }
      
      setDuration(maxDuration);
      newSelection.duration = maxDuration;
    }
    
    setSelectedSlot(newSelection);
    onSelectionChange(newSelection);
    
    // Immediately trigger the booking dialog
    onBookingClick(courtId, time, newSelection.duration);
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    
    if (selectedSlot) {
      if (isSlotAvailable(selectedSlot.courtId, selectedSlot.startTime, newDuration)) {
        const updatedSelection = { ...selectedSlot, duration: newDuration };
        setSelectedSlot(updatedSelection);
        onSelectionChange(updatedSelection);
      } else {
        // Duration not available, clear selection
        setSelectedSlot(null);
        onSelectionChange(null);
      }
    }
  };

  const calculatePricing = (courtId: string, durationHours: number) => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return { baseAmount: 0, convenienceFee: 0, totalAmount: 0, tokens: 0 };
    
    return calculateCourtPricing(court, durationHours);
  };

  const isSlotInSelection = (courtId: string, time: string) => {
    if (!selectedSlot || selectedSlot.courtId !== courtId) return false;
    
    const selectionStart = parseInt(selectedSlot.startTime.split(':')[0]);
    const selectionEnd = selectionStart + selectedSlot.duration;
    const slotHour = parseInt(time.split(':')[0]);
    
    return slotHour >= selectionStart && slotHour < selectionEnd;
  };

  const isSlotInHover = (courtId: string, time: string) => {
    if (!hoveredSlot || hoveredSlot.courtId !== courtId) return false;
    
    const hoverStart = parseInt(hoveredSlot.time.split(':')[0]);
    const hoverEnd = hoverStart + duration;
    const slotHour = parseInt(time.split(':')[0]);
    
    return slotHour >= hoverStart && slotHour < hoverEnd;
  };

  const handleSlotHover = (courtId: string, time: string) => {
    if (!isSlotBooked(courtId, time) && isSlotAvailable(courtId, time, duration)) {
      setHoveredSlot({ courtId, time });
    }
  };

  const handleSlotLeave = () => {
    setHoveredSlot(null);
  };

  const handleBookClick = () => {
    if (selectedSlot) {
      onBookingClick(selectedSlot.courtId, selectedSlot.startTime, selectedSlot.duration);
    }
  };

  return (
    <div className="space-y-6">
      {/* Duration Selection */}
      <Card className="bg-tennis-green-bg/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium text-tennis-green-dark">
              Select Duration:
            </Label>
            <Select value={duration.toString()} onValueChange={(value) => handleDurationChange(parseFloat(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedSlot && (
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-tennis-green-medium" />
                  <span className="text-tennis-green-dark font-medium">
                    {selectedSlot.startTime} - {
                      `${(parseInt(selectedSlot.startTime.split(':')[0]) + selectedSlot.duration).toString().padStart(2, '0')}:00`
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">
                      {calculatePricing(selectedSlot.courtId, selectedSlot.duration).tokens} tokens
                    </span>
                  </div>
                  
                  {calculatePricing(selectedSlot.courtId, selectedSlot.duration).totalAmount > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        ${(calculatePricing(selectedSlot.courtId, selectedSlot.duration).totalAmount / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleBookClick}
                  className="bg-tennis-green-primary hover:bg-tennis-green-medium"
                >
                  Book Now
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `120px repeat(${courts.length}, 1fr)` }}>
            <div className="font-medium text-sm text-tennis-green-dark">Time</div>
            {courts.map((court) => (
              <div key={court.id} className="font-medium text-sm text-tennis-green-dark text-center">
                <div>{court.name}</div>
                <div className="text-xs text-tennis-green-medium">
                  {court.surface_type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="space-y-1">
            {timeSlots.map((time) => (
              <div key={time} className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${courts.length}, 1fr)` }}>
                <div className="flex items-center text-sm font-medium text-tennis-green-dark py-3">
                  {time}
                </div>
                {courts.map((court) => {
                  const isBooked = isSlotBooked(court.id, time);
                  const bookingInfo = getBookingInfo(court.id, time);
                  const isMyBooking = bookingInfo?.user_id === currentUserId;
                  const isSelected = isSlotInSelection(court.id, time);
                  const isHovered = !selectedSlot && isSlotInHover(court.id, time);
                  const isAvailable = isSlotAvailable(court.id, time, duration);

                  return (
                    <div key={`${court.id}-${time}`} className="h-12">
                      {isBooked ? (
                        <div
                          className={cn(
                            "h-full rounded-md px-3 py-2 text-xs flex items-center justify-center font-medium",
                            isMyBooking
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          )}
                        >
                          {isMyBooking ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Your Booking</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              <span>Booked</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-full w-full text-xs transition-all duration-200",
                            isSelected && "bg-tennis-green-primary text-white border-tennis-green-primary ring-2 ring-tennis-green-primary/20",
                            isHovered && "bg-tennis-green-bg border-tennis-green-medium ring-1 ring-tennis-green-medium/30",
                            !isAvailable && "opacity-40 cursor-not-allowed",
                            isAvailable && !isSelected && !isHovered && "hover:bg-tennis-green-bg hover:border-tennis-green-medium"
                          )}
                          onClick={() => handleSlotClick(court.id, time)}
                          onMouseEnter={() => handleSlotHover(court.id, time)}
                          onMouseLeave={handleSlotLeave}
                          disabled={!isAvailable}
                        >
                          <div className="flex flex-col items-center">
                            {isSelected ? (
                              <span className="font-medium">Selected</span>
                            ) : isHovered ? (
                              <span className="font-medium">
                                Book {duration}h
                              </span>
                            ) : (
                              <span>Available</span>
                            )}
                            
                            {(isSelected || isHovered) && court.hourly_rate_money > 0 && (
                              <span className="text-[10px] opacity-75">
                                ${(calculatePricing(court.id, duration).totalAmount / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 pt-4 border-t border-tennis-green-bg/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span className="text-xs text-tennis-green-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-tennis-green-primary rounded"></div>
          <span className="text-xs text-tennis-green-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
            <CheckCircle className="h-2 w-2 text-blue-800" />
          </div>
          <span className="text-xs text-tennis-green-medium">Your Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center">
            <AlertCircle className="h-2 w-2 text-red-800" />
          </div>
          <span className="text-xs text-tennis-green-medium">Booked</span>
        </div>
      </div>
    </div>
  );
}