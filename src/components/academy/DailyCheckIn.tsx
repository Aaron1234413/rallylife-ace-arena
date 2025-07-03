import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DailyCheckInProps {
  currentStreak: number;
  hasCheckedInToday: boolean;
  onCheckInComplete: () => void;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  currentStreak,
  hasCheckedInToday,
  onCheckInComplete
}) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCheckIn = async () => {
    if (!user || hasCheckedInToday) return;

    setIsCheckingIn(true);
    try {
      const { data, error } = await supabase.rpc('academy_daily_check_in', {
        user_id: user.id
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: "Daily Check-in Complete!",
          description: "Ready to start your quiz",
        });
        onCheckInComplete();
      } else {
        toast({
          title: "Check-in Failed",
          description: result?.error || "Unable to complete check-in",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        title: "Error",
        description: "Failed to complete check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover-scale transition-all duration-300 shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="text-center space-y-4">
          {/* Header with icon and title */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <span className="font-semibold text-tennis-green-dark text-lg sm:text-xl orbitron-heading">
              Daily Check-in
            </span>
          </div>

          {/* Streak display (if applicable) */}
          {currentStreak > 0 && (
            <div className="bg-white/70 rounded-lg p-2">
              <div className="text-sm text-tennis-green-medium">Current Streak</div>
              <div className="text-lg font-bold text-green-600 orbitron-heading">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'} 🔥
              </div>
            </div>
          )}
          
          {/* Main action button - larger for mobile */}
          <Button
            onClick={handleCheckIn}
            disabled={hasCheckedInToday || isCheckingIn}
            className={`w-full transition-all duration-300 ${
              hasCheckedInToday 
                ? 'bg-green-600 hover:bg-green-600' 
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover-scale'
            } text-white font-semibold py-4 sm:py-5 text-base sm:text-lg rounded-xl shadow-lg`}
            size="lg"
          >
            {isCheckingIn ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Checking in...
              </>
            ) : hasCheckedInToday ? (
              <>
                <CheckCircle className="h-5 w-5 mr-3" />
                ✅ Checked in today!
              </>
            ) : (
              <span className="poppins-body">
                Check in now for your daily quiz
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};