
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const { error } = await resetPassword(email);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="text-center pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-tennis-green-bg rounded-full mb-4">
            <CheckCircle className="h-6 w-6 text-tennis-green-dark" />
          </div>
          <CardTitle className="text-2xl font-bold text-tennis-green-dark">Check Your Email</CardTitle>
          <CardDescription className="text-gray-600">We've sent you a password reset link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-tennis-green-light bg-tennis-green-bg/20">
            <Mail className="h-4 w-4 text-tennis-green-dark" />
            <AlertDescription className="text-tennis-green-dark">
              If an account with that email exists, we've sent you a password reset link. 
              Check your email and follow the instructions to reset your password.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Link 
              to="/auth/login" 
              className="inline-flex items-center text-tennis-green-dark hover:text-tennis-green-medium font-medium transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-tennis-green-dark">Reset Password</CardTitle>
        <CardDescription className="text-gray-600">Enter your email to receive a password reset link</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="pl-10 h-12 border-gray-300 focus:border-tennis-green-medium focus:ring-tennis-green-medium"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-tennis-green-dark hover:bg-tennis-green-medium transition-colors font-medium" 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
          
          <div className="text-center">
            <Link 
              to="/auth/login" 
              className="inline-flex items-center text-tennis-green-dark hover:text-tennis-green-medium font-medium text-sm transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
