
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-tennis-green-dark">Welcome Back</CardTitle>
        <CardDescription className="text-gray-600">Sign in to your Rako account</CardDescription>
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
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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
            Sign In
          </Button>
          
          <div className="text-center space-y-3 pt-2">
            <Link 
              to="/auth/forgot-password" 
              className="text-tennis-green-dark hover:text-tennis-green-medium font-medium text-sm transition-colors"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/auth/signup" 
                className="text-tennis-green-dark hover:text-tennis-green-medium font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
