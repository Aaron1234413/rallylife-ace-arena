
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
      <div className="min-h-screen bg-tennis-green-dark flex items-center justify-center">
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
    <div className="min-h-screen bg-tennis-green-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">RallyLife</h1>
          <p className="text-tennis-green-light">The gamified tennis platform</p>
        </div>
        {renderForm()}
      </div>
    </div>
  );
}
