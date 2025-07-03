import { useAuth } from "@/hooks/useAuth";
import { AppNavigation } from "@/components/navigation/AppNavigation";
import { FloatingCheckInButton } from "@/components/match/FloatingCheckInButton";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isLandingPage = location.pathname === '/';
  const isPaymentGate = location.pathname === '/payment-gate';
  const shouldHideNavigation = isLandingPage || isPaymentGate;

  // Redirect authenticated users from landing page to dashboard
  useEffect(() => {
    if (!loading && user && isLandingPage) {
      navigate('/dashboard');
    }
  }, [user, loading, isLandingPage, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user && !shouldHideNavigation && <AppNavigation />}
      
      <main className={`${user && !shouldHideNavigation ? 'pt-56 md:pt-44' : ''} pb-20 sm:pb-6 min-h-screen`}>
        <div className="safe-area-inset">
          {children}
        </div>
      </main>
      
      {user && !shouldHideNavigation && <FloatingCheckInButton />}
    </div>
  );
}
