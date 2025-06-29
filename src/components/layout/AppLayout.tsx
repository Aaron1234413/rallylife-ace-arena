import { useAuth } from "@/hooks/useAuth";
import { AppNavigation } from "@/components/navigation/AppNavigation";
import { FloatingCheckInButton } from "@/components/match/FloatingCheckInButton";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user && !isLandingPage && <AppNavigation />}
      
      <main className={`${user && !isLandingPage ? 'pt-56 md:pt-44' : ''} pb-20 sm:pb-6 min-h-screen`}>
        <div className="safe-area-inset">
          {children}
        </div>
      </main>
      
      {user && !isLandingPage && <FloatingCheckInButton />}
    </div>
  );
}
