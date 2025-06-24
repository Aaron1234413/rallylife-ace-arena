
import { useAuth } from "@/hooks/useAuth";
import { AppNavigation } from "@/components/navigation/AppNavigation";
import { FloatingCheckInButton } from "@/components/match/FloatingCheckInButton";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user && <AppNavigation />}
      
      <main className={`${user ? 'pt-20 sm:pt-16' : ''} pb-20 sm:pb-6 min-h-screen`}>
        <div className="safe-area-inset">
          {children}
        </div>
      </main>
      
      {user && <FloatingCheckInButton />}
    </div>
  );
}
