
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock, User, UserCheck, Users } from 'lucide-react';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'player' | 'coach'>('player');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, role);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
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
              Account created successfully! Welcome to Rako. Redirecting you to the dashboard...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-tennis-green-dark">Join Rako</CardTitle>
        <CardDescription className="text-gray-600">Create your account to get started</CardDescription>
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
          
          <div className="space-y-3">
            <Label className="text-gray-700 font-medium">I want to join as a:</Label>
            <RadioGroup value={role} onValueChange={(value: 'player' | 'coach') => setRole(value)}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-tennis-green-light transition-colors">
                <RadioGroupItem value="player" id="player" className="text-tennis-green-dark" />
                <Label htmlFor="player" className="flex items-center cursor-pointer flex-1">
                  <User className="mr-2 h-4 w-4 text-tennis-green-dark" />
                  <div>
                    <div className="font-medium">Player</div>
                    <div className="text-sm text-gray-500">Track progress and find coaches</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-tennis-green-light transition-colors">
                <RadioGroupItem value="coach" id="coach" className="text-tennis-green-dark" />
                <Label htmlFor="coach" className="flex items-center cursor-pointer flex-1">
                  <Users className="mr-2 h-4 w-4 text-tennis-green-dark" />
                  <div>
                    <div className="font-medium">Coach</div>
                    <div className="text-sm text-gray-500">Teach and mentor players</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-tennis-green-dark hover:bg-tennis-green-medium transition-colors font-medium" 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
          
          <div className="text-center pt-2">
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/auth/login" 
                className="text-tennis-green-dark hover:text-tennis-green-medium font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
