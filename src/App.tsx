
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"

import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import ProtectedRoute from "@/components/ProtectedRoute";
import Achievements from "@/pages/Achievements";
import Activities from "@/pages/Activities";
import Messages from "@/pages/Messages";
import Feed from "@/pages/Feed";
import Leaderboards from "@/pages/Leaderboards";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/login" element={<Auth />} />
              <Route path="/auth/signup" element={<Auth />} />
              <Route path="/auth/forgot-password" element={<Auth />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/leaderboards" element={<ProtectedRoute><Leaderboards /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
