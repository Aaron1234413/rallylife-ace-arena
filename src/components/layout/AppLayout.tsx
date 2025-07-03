import { useAuth } from "@/hooks/useAuth";
import { AppNavigation } from "@/components/navigation/AppNavigation";
import { FloatingCheckInButton } from "@/components/match/FloatingCheckInButton";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ROUTES, shouldHideNavigation } from "@/utils/routes";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const hideNavigation = shouldHideNavigation(location.pathname);

  // Redirect authenticated users from landing page to dashboard
  useEffect(() => {
    if (!loading && user && location.pathname === ROUTES.LANDING) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user && !hideNavigation && <AppNavigation />}
      
      <main className={`${user && !hideNavigation ? 'pt-56 md:pt-44' : ''} pb-20 sm:pb-6 min-h-screen`}>
        <div className="safe-area-inset">
          {children}
        </div>
      </main>
      
      {user && !hideNavigation && <FloatingCheckInButton />}
    </div>
  );
}
