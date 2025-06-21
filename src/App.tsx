
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Toaster } from '@/components/ui/toaster';
import { SocialPlaySessionProvider } from '@/contexts/SocialPlaySessionContext';
import { ActiveSocialPlayWidget } from '@/components/social-play/ActiveSocialPlayWidget';
import { SocialPlayInvitations } from '@/components/social-play/SocialPlayInvitations';
import { useSocialPlayNotifications } from '@/hooks/useSocialPlayNotifications';
// Import existing pages
import Feed from './pages/Feed';
import StartSocialPlay from './pages/StartSocialPlay';

// Create placeholder components for missing pages
const Home = () => (
  <div className="text-center space-y-6">
    <h1 className="text-3xl font-bold">Welcome to RallyLife</h1>
    <p className="text-muted-foreground">Your gamified tennis platform</p>
  </div>
);

const Account = ({ session }: { session: any }) => (
  <div className="text-center space-y-6">
    <h1 className="text-2xl font-bold">Account</h1>
    <p>Welcome, {session?.user?.email}</p>
  </div>
);

const Training = () => (
  <div className="text-center space-y-6">
    <h1 className="text-2xl font-bold">Training</h1>
    <p className="text-muted-foreground">Training features coming soon</p>
  </div>
);

const Matches = () => (
  <div className="text-center space-y-6">
    <h1 className="text-2xl font-bold">Matches</h1>
    <p className="text-muted-foreground">Match features coming soon</p>
  </div>
);

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
              <Route path="/" element={<Home />} />
              <Route path="/training" element={<Training />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/start-social-play" element={<StartSocialPlay />} />
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
