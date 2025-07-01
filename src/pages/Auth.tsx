
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  useEffect(() => {
    // Only redirect if user is authenticated and not loading
    if (user && !loading) {
      console.log('Auth: User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-dark mx-auto"></div>
          <p className="text-tennis-green-dark font-orbitron">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render auth forms if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-dark mx-auto"></div>
          <p className="text-tennis-green-dark font-orbitron">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-medium via-tennis-green-bg to-tennis-green-dark">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-orbitron font-bold text-tennis-green-dark mb-2">
                🎾 Rako
              </h1>
              <p className="text-gray-600">Tennis Gaming Platform</p>
            </div>

            {mode === 'login' && <LoginForm />}
            {mode === 'signup' && <SignupForm />}
            {mode === 'forgot-password' && <ForgotPasswordForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
