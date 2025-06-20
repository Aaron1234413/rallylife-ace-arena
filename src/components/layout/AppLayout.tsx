
import { useAuth } from "@/hooks/useAuth";
import { AppNavigation } from "@/components/navigation/AppNavigation";
import { FloatingCheckInButton } from "@/components/match/FloatingCheckInButton";
import { FloatingCheckInTrigger } from "@/components/training/FloatingCheckInTrigger";

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
      
      <main className={`${user ? 'pt-16' : ''} pb-16 sm:pb-0`}>
        {children}
      </main>
      
      {user && (
        <>
          <FloatingCheckInButton />
          <FloatingCheckInTrigger />
        </>
      )}
    </div>
  );
}
