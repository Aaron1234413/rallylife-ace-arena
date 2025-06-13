
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-tennis-green-dark">RallyLife Dashboard</h1>
            <p className="text-tennis-green-medium mt-1">Welcome back to your tennis journey!</p>
          </div>
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="flex items-center gap-2 border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-dark hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Card className="border-tennis-green-light">
          <CardHeader className="bg-tennis-green-light text-white">
            <CardTitle>Welcome to RallyLife!</CardTitle>
            <CardDescription className="text-tennis-green-bg">
              Your gamified tennis platform is ready. Authentication system is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-2">
              <p><strong className="text-tennis-green-dark">Email:</strong> {user?.email}</p>
              <p><strong className="text-tennis-green-dark">User ID:</strong> {user?.id}</p>
              <p className="text-tennis-green-medium text-sm mt-4">
                Phase 1.1 (Authentication & Authorization) is now complete! 
                Users can sign up as players or coaches, sign in, and reset their passwords.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
