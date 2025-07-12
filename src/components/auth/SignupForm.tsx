
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
      role, 
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
      // Redirect all users to dashboard
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
              Account created successfully! Welcome to Rako. Redirecting you...
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
          
          {/* Optional Skill Level Fields */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <Label className="text-sm font-medium text-gray-600">Tennis Ratings (Optional)</Label>
              <p className="text-xs text-gray-500 mt-1">You can set these now or skip and add them later</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="utrRating" className="text-sm">UTR Rating</Label>
                <Input
                  id="utrRating"
                  type="number"
                  min="1.0"
                  max="16.5"
                  step="0.1"
                  value={utrRating || ''}
                  onChange={(e) => setUtrRating(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="4.0"
                  className="text-center text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ustaRating" className="text-sm">USTA Rating</Label>
                <Input
                  id="ustaRating"
                  type="number"
                  min="1.0"
                  max="7.0"
                  step="0.5"
                  value={ustaRating || ''}
                  onChange={(e) => setUstaRating(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="3.0"
                  className="text-center text-sm"
                />
              </div>
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
              'Create Account'
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
