import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Info } from 'lucide-react';
import { formatOperatingHours } from '@/utils/operatingHoursValidation';

interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
  };
}

interface CourtOperatingHoursProps {
  operatingHours: OperatingHours;
  className?: string;
}

export function CourtOperatingHours({ operatingHours, className }: CourtOperatingHoursProps) {
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Clock className="h-5 w-5" />
          Operating Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {days.map(day => {
            const hours = operatingHours[day.key];
            return (
              <div key={day.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-medium text-gray-700">{day.label}</span>
                <span className="text-tennis-green-dark">
                  {hours ? `${hours.open} - ${hours.close}` : 'Closed'}
                </span>
              </div>
            );
          })}
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-gray-600">
                Court bookings are only available during operating hours. 
                Times shown are when the club is open for play.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}