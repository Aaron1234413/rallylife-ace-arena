import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login');
      return;
    }

    if (user) {
      checkOnboardingStatus();
    }
  }, [user, loading, navigate]);

  const checkOnboardingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        setCheckingOnboarding(false);
        return;
      }

      // If onboarding is not completed and user is not already on onboarding page
      if (!data?.onboarding_completed && window.location.pathname !== '/onboarding') {
        navigate('/onboarding');
        return;
      }

      // If onboarding is completed and user is on onboarding page, redirect to home
      if (data?.onboarding_completed && window.location.pathname === '/onboarding') {
        navigate('/');
        return;
      }

      setCheckingOnboarding(false);
    } catch (error) {
      console.error('Error:', error);
      setCheckingOnboarding(false);
    }
  };

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-tennis-green-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

// Keep default export for backward compatibility
export default ProtectedRoute;
