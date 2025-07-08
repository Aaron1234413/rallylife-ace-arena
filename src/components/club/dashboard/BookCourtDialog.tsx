import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface Court {
  id: string;
  name: string;
  surface: string;
  hourlyRate: number;
  isActive: boolean;
}

interface BookCourtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courtId: string | null;
  date: Date;
  courts: Court[];
}

export function BookCourtDialog({ open, onOpenChange, courtId, date, courts }: BookCourtDialogProps) {
  const [formData, setFormData] = useState({
    startTime: '',
    duration: '1',
    notes: '',
    bookingType: 'personal'
  });

  const selectedCourt = courts.find(c => c.id === courtId);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ];

  const calculateTotal = () => {
    if (!selectedCourt) return 0;
    return selectedCourt.hourlyRate * parseInt(formData.duration);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking court:', {
      courtId,
      date,
      ...formData,
      total: calculateTotal()
    });
    
    // Here you would typically call an API to create the booking
    onOpenChange(false);
    
    // Reset form
    setFormData({
      startTime: '',
      duration: '1',
      notes: '',
      bookingType: 'personal'
    });
  };

  if (!selectedCourt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {selectedCourt.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Court Information */}
          <div className="p-4 bg-tennis-green-bg/20 rounded-lg border">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-tennis-green-medium" />
                <span className="font-medium text-tennis-green-dark">{selectedCourt.name}</span>
                <Badge variant="outline">{selectedCourt.surface}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-tennis-green-medium" />
                <span className="text-sm text-tennis-green-medium">
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-tennis-green-medium" />
                <span className="text-sm text-tennis-green-medium">
                  ${selectedCourt.hourlyRate}/hour
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Select
              value={formData.startTime}
              onValueChange={(value) => setFormData({ ...formData, startTime: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select start time" />
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

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => setFormData({ ...formData, duration: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bookingType">Booking Type</Label>
            <Select
              value={formData.bookingType}
              onValueChange={(value) => setFormData({ ...formData, bookingType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal Practice</SelectItem>
                <SelectItem value="lesson">Coaching Lesson</SelectItem>
                <SelectItem value="match">Match Play</SelectItem>
                <SelectItem value="tournament">Tournament</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requirements or notes..."
              rows={2}
            />
          </div>

          {/* Booking Summary */}
          <div className="p-4 bg-tennis-green-bg/10 rounded-lg border">
            <h4 className="font-medium text-tennis-green-dark mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-tennis-green-medium">Court:</span>
                <span className="text-tennis-green-dark">{selectedCourt.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-tennis-green-medium">Date:</span>
                <span className="text-tennis-green-dark">{format(date, 'MMM d, yyyy')}</span>
              </div>
              {formData.startTime && (
                <div className="flex justify-between">
                  <span className="text-tennis-green-medium">Time:</span>
                  <span className="text-tennis-green-dark">
                    {formData.startTime} ({formData.duration}h)
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium pt-2 border-t border-tennis-green-bg/50">
                <span className="text-tennis-green-dark">Total:</span>
                <span className="text-tennis-green-dark">${calculateTotal()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!formData.startTime}
            >
              Book Court - ${calculateTotal()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}