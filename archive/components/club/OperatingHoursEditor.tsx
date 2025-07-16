import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

interface OperatingHoursEditorProps {
  operatingHours: OperatingHours;
  onOperatingHoursChange: (hours: OperatingHours) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export function OperatingHoursEditor({ 
  operatingHours, 
  onOperatingHoursChange, 
  disabled = false 
}: OperatingHoursEditorProps) {
  
  const updateDayHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const newHours = {
      ...operatingHours,
      [day]: {
        ...operatingHours[day],
        [field]: value
      }
    };
    onOperatingHoursChange(newHours);
  };

  const toggleDayClosed = (day: string, closed: boolean) => {
    updateDayHours(day, 'closed', closed);
  };

  const applyToAllDays = (template: { open: string; close: string }) => {
    const newHours = { ...operatingHours };
    DAYS_OF_WEEK.forEach(({ key }) => {
      if (!newHours[key]?.closed) {
        newHours[key] = { ...template, closed: false };
      }
    });
    onOperatingHoursChange(newHours);
  };

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const isValidTimeRange = (open: string, close: string): boolean => {
    if (!validateTime(open) || !validateTime(close)) return false;
    const openTime = new Date(`2000-01-01 ${open}`);
    const closeTime = new Date(`2000-01-01 ${close}`);
    return openTime < closeTime;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-tennis-green-primary" />
          <CardTitle className="text-lg">Operating Hours</CardTitle>
        </div>
        <p className="text-sm text-tennis-green-medium">
          Set your club's operating hours for each day of the week
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Templates */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyToAllDays({ open: '06:00', close: '22:00' })}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-tennis-green-bg/50 hover:bg-tennis-green-bg text-tennis-green-dark rounded-md transition-colors"
            >
              Standard (6 AM - 10 PM)
            </button>
            <button
              type="button"
              onClick={() => applyToAllDays({ open: '05:00', close: '23:00' })}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-tennis-green-bg/50 hover:bg-tennis-green-bg text-tennis-green-dark rounded-md transition-colors"
            >
              Extended (5 AM - 11 PM)
            </button>
            <button
              type="button"
              onClick={() => applyToAllDays({ open: '08:00', close: '20:00' })}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-tennis-green-bg/50 hover:bg-tennis-green-bg text-tennis-green-dark rounded-md transition-colors"
            >
              Weekend (8 AM - 8 PM)
            </button>
          </div>
        </div>

        {/* Individual Day Settings */}
        <div className="space-y-4">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const dayHours = operatingHours[key] || { open: '06:00', close: '22:00', closed: false };
            const isClosed = dayHours.closed || false;
            const hasValidRange = !isClosed && isValidTimeRange(dayHours.open, dayHours.close);

            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-tennis-green-dark">{label}</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${key}-closed`} className="text-xs text-tennis-green-medium">
                      Closed
                    </Label>
                    <Switch
                      id={`${key}-closed`}
                      checked={isClosed}
                      onCheckedChange={(checked) => toggleDayClosed(key, checked)}
                      disabled={disabled}
                      className="scale-75"
                    />
                  </div>
                </div>

                {!isClosed && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`${key}-open`} className="text-xs text-tennis-green-medium">
                        Opening Time
                      </Label>
                      <Input
                        id={`${key}-open`}
                        type="time"
                        value={dayHours.open}
                        onChange={(e) => updateDayHours(key, 'open', e.target.value)}
                        disabled={disabled}
                        className={`text-sm ${
                          !hasValidRange ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${key}-close`} className="text-xs text-tennis-green-medium">
                        Closing Time
                      </Label>
                      <Input
                        id={`${key}-close`}
                        type="time"
                        value={dayHours.close}
                        onChange={(e) => updateDayHours(key, 'close', e.target.value)}
                        disabled={disabled}
                        className={`text-sm ${
                          !hasValidRange ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                      />
                    </div>
                  </div>
                )}

                {!isClosed && !hasValidRange && (
                  <p className="text-xs text-red-600">
                    Please ensure opening time is before closing time
                  </p>
                )}

                {isClosed && (
                  <div className="text-xs text-tennis-green-medium italic">
                    Club is closed on {label.toLowerCase()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-tennis-green-bg/30 p-3 rounded-lg">
          <p className="text-xs text-tennis-green-medium">
            <strong>Note:</strong> Operating hours determine when court bookings and coaching sessions can be scheduled. 
            Members can only book sessions during your club's operating hours.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}