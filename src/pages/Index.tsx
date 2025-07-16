
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerHP } from "@/hooks/usePlayerHP";
import { usePlayerXP } from "@/hooks/usePlayerXP";
import { usePlayerAvatar } from "@/hooks/usePlayerAvatar";
import { usePlayerAchievements } from "@/hooks/usePlayerAchievements";
import { usePlayerTokens } from "@/hooks/usePlayerTokens";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Zap, 
  Coins, 
  Swords, 
  Users, 
  Building,
  Flame,
  Crown,
  Sparkles,
  TrendingUp,
  Gamepad2,
  Activity
} from 'lucide-react';
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { PlayerVitalsHero, EnhancedQuickActions } from "@/components/dashboard/player";
// Archived coach imports - removed for MVP
// import { CoachOverviewCards } from "@/components/coach/dashboard/CoachOverviewCards";
// import { CoachQuickActions } from "@/components/coach/dashboard/CoachQuickActions";
// import { CoachInteractionPanel } from "@/components/coach/dashboard/CoachInteractionPanel";
import { MobileActionPanel } from "@/components/dashboard/mobile";

import { YourSessions } from "@/components/dashboard/YourSessions";
import { ActiveSessionCard } from "@/components/dashboard/ActiveSessionCard";
import { useUnifiedSessions } from "@/hooks/useUnifiedSessions";
// Archived coach hooks - removed for MVP  
// import { useCoachCXP } from "@/hooks/useCoachCXP";
// import { useCoachTokens } from "@/hooks/useCoachTokens";
// import { useCoachCRP } from "@/hooks/useCoachCRP";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  console.log('🏠 [INDEX] Index component mounted');
  
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [userClubs, setUserClubs] = useState<any[]>([]);

  // Player hooks with error handling
  const { hpData, loading: hpLoading, restoreHP, initializeHP } = usePlayerHP();
  const { xpData, loading: xpLoading, addXP, initializeXP } = usePlayerXP();
  const { tokenData, loading: tokensLoading, addTokens, spendTokens } = usePlayerTokens();
  const { equippedItems, loading: avatarLoading, initializeAvatar, checkLevelUnlocks } = usePlayerAvatar();
  const { checkAllAchievements } = usePlayerAchievements();
  
  // Session hooks for live dashboard integration
  const { sessions: activeSessions, loading: activeSessionsLoading, refreshSessions } = useUnifiedSessions({
    filterUserSessions: true
  });

  // Archived coach hooks - removed for MVP
  // const { cxpData, loading: cxpLoading, addCXP, initializeCXP } = useCoachCXP();
  // const { tokenData: coachTokenData, loading: coachTokensLoading, addTokens: addCoachTokens } = useCoachTokens();
  // const { crpData, isLoading: crpLoading, initializeCRP } = useCoachCRP();

  // Derive user role flags from profile
  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';

  console.log('🏠 [INDEX] Current state:', {
    user: !!user,
    profile,
    profileLoading,
    profileError,
    isPlayer,
    isCoach
  });

  const fetchProfile = async () => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    try {
      console.log('🏠 [INDEX] Fetching profile for user:', user.id);
      setProfileError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('🏠 [INDEX] Error fetching profile:', error);
        setProfileError(`Failed to load profile: ${error.message}`);
        return;
      }

      console.log('🏠 [INDEX] Profile fetched successfully:', data);
      setProfile(data);

      // Fetch user's clubs
      await fetchUserClubs();
    } catch (error) {
      console.error('🏠 [INDEX] Unexpected error:', error);
      setProfileError('An unexpected error occurred while loading your profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUserClubs = async () => {
    if (!user) return;

    try {
      const { data: memberships, error } = await supabase
        .from('club_memberships')
        .select(`
          club_id,
          role,
          clubs:club_id (
            id,
            name,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching user clubs:', error);
        return;
      }

      setUserClubs(memberships || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    // Initialize data based on user role - only once
    if (user && profile && !dataInitialized) {
      console.log('🏠 [INDEX] Initializing data for role:', profile.role);
      
      const initializeData = async () => {
        try {
          if (profile.role === 'player') {
            // Initialize player data with error handling (tokens handled by DB trigger)
            if (!hpData) {
              console.log('🏠 [INDEX] Initializing HP...');
              await initializeHP();
            }
            if (!xpData) {
              console.log('🏠 [INDEX] Initializing XP...');
              await initializeXP();
            }
            if (equippedItems.length === 0) {
              console.log('🏠 [INDEX] Initializing avatar...');
              await initializeAvatar();
            }
          } 
          // Archived coach initialization - removed for MVP
          // else if (profile.role === 'coach') {
          //   // Initialize coach data with error handling (tokens handled by DB trigger)
          //   if (!cxpData) {
          //     console.log('🏠 [INDEX] Initializing coach CXP...');
          //     await initializeCXP();
          //   }
          //   if (!crpData) {
          //     console.log('🏠 [INDEX] Initializing coach CRP...');
          //     await initializeCRP();
          //   }
          // }
          
          setDataInitialized(true);
          console.log('🏠 [INDEX] Data initialization completed successfully');
        } catch (error) {
          console.error('🏠 [INDEX] Error initializing data:', error);
          toast.error('Failed to initialize user data. Some features may not work properly.');
        }
      };

      initializeData();
    }
  }, [user?.id, profile?.role, dataInitialized]);

  // Enhanced XP earning function that checks for avatar unlocks and achievements
  const handleAddXP = async (amount: number, activityType: string, description?: string) => {
    try {
      const oldLevel = xpData?.current_level || 1;
      const result = await addXP(amount, activityType, description);
      
      // Check if level increased and unlock avatar items
      if (xpData && xpData.current_level > oldLevel) {
        await checkLevelUnlocks(xpData.current_level);
      }
      
      // Check for achievement unlocks
      await checkAllAchievements();
      
      return result;
    } catch (error) {
      console.error('🏠 [INDEX] Error adding XP:', error);
      toast.error('Failed to add XP');
    }
  };

  // Enhanced token earning function that checks for achievements
  const handleAddTokens = async (amount: number, tokenType: string = 'regular', source: string = 'manual', description?: string) => {
    try {
      await addTokens(amount, tokenType, source, description);
      // Check for achievement unlocks
      await checkAllAchievements();
    } catch (error) {
      console.error('🏠 [INDEX] Error adding tokens:', error);
      toast.error('Failed to add tokens');
    }
  };

  // Enhanced HP restoration function that checks for achievements
  const handleRestoreHP = async (amount: number, activityType: string, description?: string) => {
    try {
      console.log('🏠 [INDEX] Starting HP restoration...', { amount, activityType, description });
      
      await restoreHP(amount, activityType, description);
      
      // Check for achievement unlocks
      await checkAllAchievements();
      
      console.log('🏠 [INDEX] HP restoration completed');
    } catch (error) {
      console.error('🏠 [INDEX] Error restoring HP:', error);
      toast.error('Failed to restore HP');
    }
  };

  const vitalsLoading = hpLoading || xpLoading || tokensLoading;

  // Show error state if there's a profile error
  if (profileError) {
    console.log('🏠 [INDEX] Rendering profile error state:', profileError);
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Error</h2>
          <p className="text-gray-700 mb-4">{profileError}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={fetchProfile}
              className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while profile is being fetched
  if (profileLoading) {
    console.log('🏠 [INDEX] Rendering loading state');
    return (
      <div className="min-h-screen bg-tennis-green-bg">
        <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-tennis-neutral-100 rounded-lg mb-6"></div>
            <div className="h-48 bg-tennis-neutral-100 rounded-lg mb-6"></div>
            <div className="text-center">
              <p className="text-tennis-green-dark">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no user
  if (!user) {
    console.log('🏠 [INDEX] No user found, showing login prompt');
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-tennis-green-dark mb-4">Welcome to Rako</h2>
          <p className="text-gray-700 mb-4">Please log in to access your dashboard</p>
          <button 
            onClick={() => navigate('/auth')} 
            className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show message if no profile
  if (!profile) {
    console.log('🏠 [INDEX] No profile found, showing profile setup prompt');
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-tennis-green-dark mb-4">Profile Setup Required</h2>
          <p className="text-gray-700 mb-4">We couldn't find your profile. Please complete the onboarding process.</p>
          <button 
            onClick={() => navigate('/onboarding')} 
            className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
          >
            Complete Setup
          </button>
        </div>
      </div>
    );
  }

  console.log('🏠 [INDEX] Rendering main dashboard for role:', profile.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-bg via-tennis-green-bg to-blue-50 relative overflow-hidden">
      {/* Animated background elements - Tennis themed */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-tennis-green-primary/10 to-tennis-green-medium/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-tennis-green-light/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-tennis-green-subtle/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Player-specific content */}
        {isPlayer && (
          <>
            {/* Mobile-Optimized Header with Streak */}
            <div className="text-center relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 flex items-center gap-2 shadow-lg">
                    <Flame className="h-4 w-4 animate-bounce" />
                    <span className="font-bold">Level {xpData?.current_level || 1} Streak!</span>
                  </Badge>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 flex items-center gap-1 shadow-lg">
                    <Crown className="h-4 w-4" />
                    <span className="font-bold">LVL {xpData?.current_level || 1}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-tennis-green-dark to-blue-600 bg-clip-text text-transparent mb-2">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'Champion'}! 
                  <Sparkles className="inline h-8 w-8 ml-2 text-tennis-green-primary animate-spin" />
                </h1>
                <div className="flex items-center justify-center gap-2 text-tennis-green-medium">
                  <TrendingUp className="h-5 w-5 text-tennis-green-primary" />
                  <span className="font-semibold">+{xpData?.total_xp_earned || 0} XP earned total</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-blue-600">Ready for your next challenge?</span>
                </div>
              </div>
            </div>

            {/* Enhanced Stats with Gaming UI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {/* HP Card - Gaming Style */}
              <Card className="border-0 shadow-2xl hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] transition-all duration-500 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 backdrop-blur-sm border border-red-200">
                <CardContent className="p-4 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-lg animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                        <Heart className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-red-700 mb-2">
                      {hpData?.current_hp || 0}
                    </div>
                    <div className="text-sm font-medium text-red-800 mb-3">Health Points</div>
                    <Progress 
                      value={hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0} 
                      className="h-4 bg-red-200"
                    />
                    <div className="text-xs text-red-700 mt-2 font-medium flex items-center justify-center gap-1">
                      {(hpData?.current_hp || 0) > 80 ? (
                        <>💪 <span className="text-green-700 font-bold">Peak Performance!</span></>
                      ) : (
                        <>⚡ <span className="text-orange-700 font-bold">Ready to restore</span></>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* XP Card - Level Up Style */}
              <Card className="border-0 shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-500 hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-100 backdrop-blur-sm border border-blue-200 relative">
                <CardContent className="p-4 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 relative">
                        <Zap className="h-8 w-8 text-white animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-blue-700 mb-2">
                      Level {xpData?.current_level || 1}
                    </div>
                    <div className="text-sm font-medium text-blue-800 mb-3">Experience</div>
                     <Progress 
                       value={xpData ? ((xpData.current_xp % 1000) / 1000) * 100 : 0} 
                       className="h-4 bg-blue-200"
                     />
                     <div className="text-xs text-blue-700 mt-2 font-medium">
                       <span className="text-orange-600 font-bold">{xpData?.xp_to_next_level || 0} XP</span> to next level
                     </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tokens Card - Treasure Style */}
              <Card className="border-0 shadow-2xl hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] transition-all duration-500 hover:scale-105 bg-gradient-to-br from-yellow-50 to-amber-100 backdrop-blur-sm border border-yellow-200">
                <CardContent className="p-4 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50 relative">
                        <Coins className="h-8 w-8 text-white animate-bounce" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-amber-700 mb-2">
                      {tokenData?.regular_tokens || 0}
                    </div>
                    <div className="text-sm font-medium text-amber-800 mb-3">Tokens</div>
                    <div className="flex items-center justify-center gap-2 bg-purple-100 rounded-full px-3 py-1 border border-purple-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-purple-700 font-bold">
                        {tokenData?.premium_tokens || 0} Premium
                      </span>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gamified Quick Actions */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-tennis-green-bg/30 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-tennis-green-dark to-blue-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
                    <Gamepad2 className="h-6 w-6 text-tennis-green-primary" />
                    Choose Your Adventure
                  </h2>
                  <p className="text-tennis-green-medium">What challenge will you conquer today?</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {/* Start a Match - Primary Action */}
                  <Button 
                    onClick={() => navigate('/sessions/create?type=match')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-tennis-green-primary to-tennis-green-medium hover:from-tennis-green-medium hover:to-tennis-green-dark text-white shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse"></div>
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Swords className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold">Start Match</span>
                    </div>
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    </div>
                  </Button>

                  {/* Purchase Items */}
                  <Button 
                    onClick={() => navigate('/store')}
                    variant="outline"
                    className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 border-2 hover:border-orange-300 transition-all duration-500 hover:scale-110 shadow-md hover:shadow-lg group"
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center shadow-lg group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                        <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-700">Purchase Items</span>
                    </div>
                  </Button>

                  {/* Find Matches */}
                  <Button 
                    onClick={() => navigate('/play')}
                    variant="outline"
                    className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 border-2 hover:border-blue-300 transition-all duration-500 hover:scale-110 shadow-md hover:shadow-lg group"
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-700">Find Matches</span>
                    </div>
                  </Button>

                  {/* Create a Club */}
                  <Button 
                    onClick={() => navigate('/clubs')}
                    variant="outline"
                    className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 border-2 hover:border-purple-300 transition-all duration-500 hover:scale-110 shadow-md hover:shadow-lg group relative"
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-lg group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                        <Building className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-700">Create Club</span>
                    </div>
                    <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5">
                      NEW
                    </Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Your Sessions Widget */}
            <ErrorBoundary fallbackTitle="Sessions Error">
              <YourSessions />
            </ErrorBoundary>

            {/* Active Sessions Dashboard Widget */}
            {activeSessions?.filter(s => s.status === 'active' || s.status === 'waiting' || s.status === 'open').length > 0 && (
              <ErrorBoundary fallbackTitle="Active Sessions Error">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Active Sessions
                  </h3>
                  {activeSessions
                    .filter(s => s.status === 'active' || s.status === 'waiting' || s.status === 'open')
                    .slice(0, 2) // Show max 2 active sessions
                    .map(session => (
                      <ActiveSessionCard 
                        key={session.id} 
                        session={session} 
                        onRefresh={refreshSessions}
                      />
                    ))}
                </div>
              </ErrorBoundary>
            )}
          </>
        )}

        {/* Archived coach content - removed for MVP */}
        {isCoach && (
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-tennis-green-dark mb-4">Coach Dashboard Coming Soon</h2>
            <p className="text-gray-700 mb-4">
              Coach features are being enhanced and will be available in a future update.
            </p>
            <p className="text-tennis-green-medium">
              For now, please use the player features available in the MVP.
            </p>
          </div>
        )}

        {/* Fallback content if no role is detected */}
        {!isPlayer && !isCoach && (
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-tennis-green-dark mb-4">Welcome to Rako</h2>
            <p className="text-gray-700 mb-4">
              Your profile is being set up. If this persists, please complete the onboarding process.
            </p>
            <button 
              onClick={() => navigate('/onboarding')} 
              className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
            >
              Complete Onboarding
            </button>
          </div>
        )}

        {/* Clean spacing at bottom */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default Index;
