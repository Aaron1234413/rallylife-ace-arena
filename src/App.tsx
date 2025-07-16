import React from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchSessionProvider } from "@/contexts/MatchSessionContext";
import { TrainingSessionProvider } from "@/contexts/TrainingSessionContext";
import { SocialPlaySessionProvider } from "@/contexts/SocialPlaySessionContext";

import { useAuth } from "@/hooks/useAuth";
import { useSessionAutomation } from "@/hooks/useSessionAutomation";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { PWAInstaller } from "@/components/mobile/PWAInstaller";

import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";

import Search from "@/pages/Search";
import Store from "@/pages/Store";
import Profile from "@/pages/Profile";
import Play from "@/pages/Play";
import Leaderboards from "@/pages/Leaderboards";
// import Academy from "@/pages/Academy"; // Archived for MVP
import { ProtectedMVPRoute } from "@/components/ProtectedMVPRoute";
import Messages from "@/pages/Messages";
// import Scheduling from "@/pages/Scheduling"; // Archived for MVP

import StartMatch from "@/pages/StartMatch";
import EndMatch from "@/pages/EndMatch";

import EndTraining from "@/pages/EndTraining";
import StartSocialPlay from "@/pages/StartSocialPlay";
import JoinSocialPlay from "@/pages/JoinSocialPlay";
// import CoachDashboard from "@/pages/CoachDashboard"; // Archived for MVP
import { MockDashboard } from "@/pages/MockDashboard";
import { PlayMockup } from "@/pages/mockups/PlayMockup";
import Sessions from "@/pages/Sessions";
import CreateSession from "@/pages/CreateSession";
import EditSession from "@/pages/EditSession";
// import Club from "@/pages/Club"; // Archived for MVP
// import Clubs from "@/pages/ClubsOld"; // Archived for MVP  
// import JoinClub from "@/pages/JoinClub"; // Archived for MVP
import { MockupRouter } from "@/pages/mockups/MockupRouter";


const queryClient = new QueryClient();

// Component that wraps the guide and has access to router context
function AppWithGuide() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      <AppLayout>
        <Toaster />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/login" element={<Auth />} />
          <Route path="/auth/signup" element={<Auth />} />
          <Route path="/auth/forgot-password" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          {/* MVP Core Routes */}
          <Route path="/dashboard" element={<ProtectedMVPRoute><Index /></ProtectedMVPRoute>} />
          <Route path="/play" element={<ProtectedMVPRoute><Play /></ProtectedMVPRoute>} />
          <Route path="/messages" element={<ProtectedMVPRoute><Messages /></ProtectedMVPRoute>} />
          <Route path="/store" element={<ProtectedMVPRoute><Store /></ProtectedMVPRoute>} />
          <Route path="/leaderboards" element={<ProtectedMVPRoute><Leaderboards /></ProtectedMVPRoute>} />
          <Route path="/profile" element={<ProtectedMVPRoute><Profile /></ProtectedMVPRoute>} />
          
          {/* MVP Utility Routes */}
          <Route path="/start-match" element={<ProtectedMVPRoute><StartMatch /></ProtectedMVPRoute>} />
          <Route path="/end-match" element={<ProtectedMVPRoute><EndMatch /></ProtectedMVPRoute>} />
          
          {/* Development/Testing Routes */}
          <Route path="/mock-dashboard" element={<ProtectedMVPRoute><MockDashboard /></ProtectedMVPRoute>} />
          <Route path="/play-mockup" element={<ProtectedMVPRoute><PlayMockup /></ProtectedMVPRoute>} />
          <Route path="/sessions" element={<ProtectedMVPRoute><Sessions /></ProtectedMVPRoute>} />
          <Route path="/sessions/create" element={<ProtectedMVPRoute><CreateSession /></ProtectedMVPRoute>} />
          <Route path="/sessions/:sessionId/edit" element={<ProtectedMVPRoute><EditSession /></ProtectedMVPRoute>} />
          
          {/* Archived Routes - Commented Out for MVP
          <Route path="/coach-dashboard" element={<ProtectedMVPRoute><CoachDashboard /></ProtectedMVPRoute>} />
          <Route path="/search" element={<ProtectedMVPRoute><Search /></ProtectedMVPRoute>} />
          <Route path="/academy" element={<ProtectedMVPRoute><Academy /></ProtectedMVPRoute>} />
          <Route path="/scheduling" element={<ProtectedMVPRoute><Scheduling /></ProtectedMVPRoute>} />
          */}
          
          {/* Legacy Training & Social Play Routes - Keep for now */}
          <Route path="/start-training" element={<ProtectedMVPRoute><CreateSession /></ProtectedMVPRoute>} />
          <Route path="/end-training" element={<ProtectedMVPRoute><EndTraining /></ProtectedMVPRoute>} />
          <Route path="/start-social-play" element={<ProtectedMVPRoute><StartSocialPlay /></ProtectedMVPRoute>} />
          <Route path="/join-social-play" element={<ProtectedMVPRoute><JoinSocialPlay /></ProtectedMVPRoute>} />
          
          {/* Club Routes - Archived for MVP
          <Route path="/clubs" element={<ProtectedMVPRoute><Clubs /></ProtectedMVPRoute>} />
          <Route path="/club/:clubId" element={<ProtectedMVPRoute><Club /></ProtectedMVPRoute>} />
          <Route path="/club/:clubId/sessions/create" element={<ProtectedMVPRoute><CreateSession /></ProtectedMVPRoute>} />
          <Route path="/join/:inviteCode" element={<ProtectedMVPRoute><JoinClub /></ProtectedMVPRoute>} />
          <Route path="/join-club/:linkSlug" element={<ProtectedMVPRoute><JoinClub /></ProtectedMVPRoute>} />
          */}
          
          {/* Mockup Routes */}
          <Route path="/mockups/*" element={<MockupRouter />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>

      {/* Mobile Components */}
      <MobileBottomNav />
      <PWAInstaller />

    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TrainingSessionProvider>
        <MatchSessionProvider>
          <SocialPlaySessionProvider>
            <BrowserRouter>
              <AppWithGuide />
            </BrowserRouter>
          </SocialPlaySessionProvider>
        </MatchSessionProvider>
      </TrainingSessionProvider>
    </QueryClientProvider>
  );
}

export default App;