import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { TrainingSessionProvider } from '@/contexts/TrainingSessionContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import ResetPassword from '@/pages/ResetPassword';
import UpdatePassword from '@/pages/UpdatePassword';
import EndTraining from '@/pages/EndTraining';
import { Toaster } from "@/components/ui/toaster"
import { SocialPlaySessionProvider } from "@/contexts/SocialPlaySessionContext";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TrainingSessionProvider>
            <SocialPlaySessionProvider>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/update-password" element={<UpdatePassword />} />
                  <Route path="/end-training" element={<EndTraining />} />
                </Routes>
                <Toaster />
              </div>
            </SocialPlaySessionProvider>
          </TrainingSessionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
