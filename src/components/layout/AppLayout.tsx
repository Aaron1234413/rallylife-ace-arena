
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
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';
  const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/');

  if (loading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-dark mx-auto"></div>
          <p className="text-tennis-green-dark font-orbitron">Loading Rako...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user && !isLandingPage && !isAuthPage && <AppNavigation />}
      
      <main className={`${user && !isLandingPage && !isAuthPage ? 'pt-56 md:pt-44' : ''} pb-20 sm:pb-6 min-h-screen`}>
        <div className="safe-area-inset">
          {children}
        </div>
      </main>
      
      {user && !isLandingPage && !isAuthPage && <FloatingCheckInButton />}
    </div>
  );
}
