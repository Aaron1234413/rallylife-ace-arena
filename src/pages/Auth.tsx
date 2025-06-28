
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const renderForm = () => {
    const path = location.pathname;
    
    if (path === '/auth/signup') {
      return <SignupForm />;
    } else if (path === '/auth/forgot-password') {
      return <ForgotPasswordForm />;
    } else {
      return <LoginForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
              <span className="text-2xl">🎾</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Rako</h1>
            <p className="text-tennis-green-bg/90 text-lg">The gamified tennis platform</p>
          </div>
          
          {/* Form Container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            {renderForm()}
          </div>
          
          {/* Footer */}
          <div className="text-center text-tennis-green-bg/80 text-sm">
            Transform your tennis journey with Rako
          </div>
        </div>
      </div>
    </div>
  );
}
