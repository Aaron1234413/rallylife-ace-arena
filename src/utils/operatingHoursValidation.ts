interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
  };
}

interface TimeSlot {
  start: string;
  end: string;
}

export function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

export function timeToMinutes(timeString: string): number {
  const { hours, minutes } = parseTime(timeString);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function isTimeWithinOperatingHours(
  timeSlot: TimeSlot,
  dayOfWeek: string,
  operatingHours: OperatingHours
): boolean {
  const dayHours = operatingHours[dayOfWeek.toLowerCase()];
  if (!dayHours) return false;

  const openMinutes = timeToMinutes(dayHours.open);
  const closeMinutes = timeToMinutes(dayHours.close);
  const startMinutes = timeToMinutes(timeSlot.start);
  const endMinutes = timeToMinutes(timeSlot.end);

  // Check if the entire time slot is within operating hours
  return startMinutes >= openMinutes && endMinutes <= closeMinutes;
}

export function validateBookingTime(
  bookingDate: Date,
  startTime: string,
  endTime: string,
  operatingHours: OperatingHours
): { valid: boolean; error?: string } {
  const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayHours = operatingHours[dayOfWeek];
  
  if (!dayHours) {
    return {
      valid: false,
      error: `No operating hours defined for ${dayOfWeek}`
    };
  }

  const openMinutes = timeToMinutes(dayHours.open);
  const closeMinutes = timeToMinutes(dayHours.close);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (startMinutes < openMinutes) {
    return {
      valid: false,
      error: `Booking cannot start before club opens at ${dayHours.open} on ${dayOfWeek}s`
    };
  }

  if (endMinutes > closeMinutes) {
    return {
      valid: false,
      error: `Booking cannot end after club closes at ${dayHours.close} on ${dayOfWeek}s`
    };
  }

  if (startMinutes >= endMinutes) {
    return {
      valid: false,
      error: 'End time must be after start time'
    };
  }

  return { valid: true };
}

export function getAvailableTimeSlots(
  date: Date,
  operatingHours: OperatingHours,
  slotDuration: number = 60 // minutes
): string[] {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayHours = operatingHours[dayOfWeek];
  
  if (!dayHours) return [];

  const openMinutes = timeToMinutes(dayHours.open);
  const closeMinutes = timeToMinutes(dayHours.close);
  const slots: string[] = [];

  for (let minutes = openMinutes; minutes + slotDuration <= closeMinutes; minutes += slotDuration) {
    const startTime = minutesToTime(minutes);
    const endTime = minutesToTime(minutes + slotDuration);
    slots.push(`${startTime}-${endTime}`);
  }

  return slots;
}

export function formatOperatingHours(operatingHours: OperatingHours): string {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const groupedHours: { [key: string]: string[] } = {};
  
  days.forEach((day, index) => {
    const hours = operatingHours[day];
    if (hours) {
      const timeRange = `${hours.open} - ${hours.close}`;
      if (!groupedHours[timeRange]) {
        groupedHours[timeRange] = [];
      }
      groupedHours[timeRange].push(dayAbbr[index]);
    }
  });
  
  return Object.entries(groupedHours)
    .map(([timeRange, days]) => {
      if (days.length === 1) {
        return `${days[0]}: ${timeRange}`;
      } else if (days.length === 7) {
        return `Daily: ${timeRange}`;
      } else {
        // Group consecutive days
        const grouped = groupConsecutiveDays(days, dayAbbr);
        return grouped.map(group => `${group}: ${timeRange}`).join(', ');
      }
    })
    .join(' | ');
}

function groupConsecutiveDays(selectedDays: string[], allDays: string[]): string[] {
  const indices = selectedDays.map(day => allDays.indexOf(day)).sort((a, b) => a - b);
  const groups: string[] = [];
  let start = indices[0];
  let end = start;
  
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === end + 1) {
      end = indices[i];
    } else {
      if (start === end) {
        groups.push(allDays[start]);
      } else {
        groups.push(`${allDays[start]}-${allDays[end]}`);
      }
      start = indices[i];
      end = start;
    }
  }
  
  if (start === end) {
    groups.push(allDays[start]);
  } else {
    groups.push(`${allDays[start]}-${allDays[end]}`);
  }
  
  return groups;
}