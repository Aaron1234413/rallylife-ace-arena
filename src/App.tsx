import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Account from './pages/Account';
import Home from './pages/Home';
import Training from './pages/Training';
import Matches from './pages/Matches';
import Feed from './pages/Feed';
import StartSocialPlay from './pages/StartSocialPlay';
import { Toaster } from '@/components/ui/toaster';
import { SocialPlaySessionProvider } from '@/contexts/SocialPlaySessionContext';
import { ActiveSocialPlayWidget } from '@/components/social-play/ActiveSocialPlayWidget';
import { SocialPlayInvitations } from '@/components/social-play/SocialPlayInvitations';
import { useSocialPlayNotifications } from '@/hooks/useSocialPlayNotifications';

function App() {
  const [showHeader, setShowHeader] = useState(true);
  const session = useSession();
  const supabase = useSupabaseClient();
  
  // Add social play notifications
  useSocialPlayNotifications();

  return (
    <>
      <Router>
        <div className="container" style={{ padding: '50px 0 100px 0' }}>
          <SocialPlaySessionProvider>
            {showHeader && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActiveSocialPlayWidget />
                <SocialPlayInvitations />
              </div>
            )}

            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/training" element={<Training />} />
              <Route exact path="/matches" element={<Matches />} />
              <Route exact path="/feed" element={<Feed />} />
              <Route exact path="/start-social-play" element={<StartSocialPlay />} />
              <Route
                path="/account"
                element={
                  !session ? (
                    <Navigate to="/login" replace={true} />
                  ) : (
                    <Account key={session.user.id} session={session} />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  session ? (
                    <Navigate to="/account" replace={true} />
                  ) : (
                    <div className="w-full flex justify-center">
                      <div className="block-container w-full max-w-sm">
                        <Auth
                          supabaseClient={supabase}
                          appearance={{ theme: ThemeSupa }}
                          providers={['google', 'github']}
                          redirectTo={`${window.location.origin}/account`}
                        />
                      </div>
                    </div>
                  )
                }
              />
            </Routes>
          </SocialPlaySessionProvider>
        </div>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
