import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import { Toaster } from "@/components/ui/toaster"
import { SocialPlaySessionProvider } from '@/contexts/SocialPlaySessionContext';
import { TrainingSessionProvider } from '@/contexts/TrainingSessionContext';
import { MatchSessionProvider } from '@/contexts/MatchSessionContext';
import Academy from "@/pages/Academy";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocialPlaySessionProvider>
        <TrainingSessionProvider>
          <MatchSessionProvider>
            <div className="min-h-screen bg-background">
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/academy" element={<Academy />} />
                </Routes>
              </BrowserRouter>
            </div>
          </MatchSessionProvider>
        </TrainingSessionProvider>
      </SocialPlaySessionProvider>
    </QueryClientProvider>
  );
}

export default App;
