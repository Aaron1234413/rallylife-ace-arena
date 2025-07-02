
import React from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchSessionProvider } from "@/contexts/MatchSessionContext";
import { TrainingSessionProvider } from "@/contexts/TrainingSessionContext";
import { SocialPlaySessionProvider } from "@/contexts/SocialPlaySessionContext";

import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import Search from "@/pages/Search";
import Store from "@/pages/Store";
import Profile from "@/pages/Profile";
import Pulse from "@/pages/Pulse";
import Academy from "@/pages/Academy";
import ProtectedRoute from "@/components/ProtectedRoute";
import Messages from "@/pages/Messages";
import Scheduling from "@/pages/Scheduling";
import Feed from "@/pages/Feed";
import Maps from "@/pages/Maps";
import StartMatch from "@/pages/StartMatch";
import EndMatch from "@/pages/EndMatch";
import StartTraining from "@/pages/StartTraining";
import EndTraining from "@/pages/EndTraining";
import StartSocialPlay from "@/pages/StartSocialPlay";
import JoinSocialPlay from "@/pages/JoinSocialPlay";
import CoachDashboard from "@/pages/CoachDashboard";
import Sessions from "@/pages/Sessions";
import CreateSession from "@/pages/CreateSession";
import Club from "@/pages/Club";
import ClubDirectory from "@/pages/ClubDirectory";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TrainingSessionProvider>
        <MatchSessionProvider>
            <SocialPlaySessionProvider>
            <BrowserRouter>
              <AppLayout>
                <Toaster />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/login" element={<Auth />} />
                  <Route path="/auth/signup" element={<Auth />} />
                  <Route path="/auth/forgot-password" element={<Auth />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/coach-dashboard" element={<ProtectedRoute><CoachDashboard /></ProtectedRoute>} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
                  <Route path="/sessions/create" element={<ProtectedRoute><CreateSession /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                  <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/pulse" element={<ProtectedRoute><Pulse /></ProtectedRoute>} />
                  <Route path="/academy" element={<ProtectedRoute><Academy /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/scheduling" element={<ProtectedRoute><Scheduling /></ProtectedRoute>} />
                  <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/maps" element={<ProtectedRoute><Maps /></ProtectedRoute>} />
                  <Route path="/start-match" element={<ProtectedRoute><StartMatch /></ProtectedRoute>} />
                  <Route path="/end-match" element={<ProtectedRoute><EndMatch /></ProtectedRoute>} />
                  <Route path="/start-training" element={<ProtectedRoute><StartTraining /></ProtectedRoute>} />
                  <Route path="/end-training" element={<ProtectedRoute><EndTraining /></ProtectedRoute>} />
                  <Route path="/start-social-play" element={<ProtectedRoute><StartSocialPlay /></ProtectedRoute>} />
                  <Route path="/join-social-play" element={<ProtectedRoute><JoinSocialPlay /></ProtectedRoute>} />
                  <Route path="/clubs" element={<ProtectedRoute><ClubDirectory /></ProtectedRoute>} />
                  <Route path="/club/:clubId" element={<ProtectedRoute><Club /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
              </BrowserRouter>
            </SocialPlaySessionProvider>
        </MatchSessionProvider>
      </TrainingSessionProvider>
    </QueryClientProvider>
  );
}

export default App;
