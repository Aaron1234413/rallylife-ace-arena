
import React from 'react';
import { useLocation } from 'react-router-dom';
import { AppNavigation } from '@/components/navigation/AppNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  
  // Don't show navigation on auth pages
  const hideNavigation = location.pathname.startsWith('/auth');

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      {!hideNavigation && <AppNavigation />}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
