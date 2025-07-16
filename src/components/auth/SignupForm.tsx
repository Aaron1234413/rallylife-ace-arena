
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock, User, UserCheck } from 'lucide-react';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [utrRating, setUtrRating] = useState<number | undefined>(undefined);
  const [ustaRating, setUstaRating] = useState<number | undefined>(undefined);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { error } = await signUp(
      email, 
      password, 
      fullName, 
      'player', // Always default to player role
      utrRating || 4.0, 
      ustaRating || 3.0
    );
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(true);
      // Redirect to onboarding for MVP setup
      setTimeout(() => navigate('/onboarding'), 2000);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="pt-6">
          <Alert className="border-tennis-green-light bg-tennis-green-bg/20">
            <UserCheck className="h-4 w-4 text-tennis-green-dark" />
            <AlertDescription className="text-tennis-green-dark font-medium">
              Welcome to Rako! Let's set up your tennis profile and UTR verification...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-tennis-green-dark">Find Tennis Matches</CardTitle>
        <CardDescription className="text-gray-600">Join Rako's UTR-verified matchmaking platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="pl-10 h-12 border-gray-300 focus:border-tennis-green-medium focus:ring-tennis-green-medium"
              />
            </div>
          </div>
          
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
                placeholder="Create a password (min 6 characters)"
                className="pl-10 h-12 border-gray-300 focus:border-tennis-green-medium focus:ring-tennis-green-medium"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-tennis-green-dark hover:bg-tennis-green-medium transition-colors font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Join Rako'
            )}
          </Button>
          
          <div className="text-center pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/auth/login')}
              className="w-full h-12 text-tennis-green-dark hover:text-tennis-green-medium hover:bg-tennis-green-light/20 font-medium transition-colors"
            >
              Already a RAKO? Click here to sign back in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
