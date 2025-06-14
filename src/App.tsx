import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Auth from './pages/Auth';
import Index from './pages/Index';
import Activities from './pages/Activities';
import Achievements from './pages/Achievements';
import Leaderboards from './pages/Leaderboards';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';

import Scheduling from './pages/Scheduling';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
          <Route path="/activities" element={<ProtectedRoute><AppLayout><Activities /></AppLayout></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><AppLayout><Achievements /></AppLayout></ProtectedRoute>} />
          <Route path="/leaderboards" element={<ProtectedRoute><AppLayout><Leaderboards /></AppLayout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
          <Route path="/scheduling" element={<ProtectedRoute><AppLayout><Scheduling /></AppLayout></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><AppLayout><Feed /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
