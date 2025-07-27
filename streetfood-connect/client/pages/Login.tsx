import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Leaf, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      const dashboardPath = user.role === 'vendor' ? '/vendor-dashboard' : '/supplier-dashboard';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ email, password });

      if (response.success) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.user?.name}!`,
        });
        // Navigation will happen via useEffect when isAuthenticated changes
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-emerald-600 rounded-xl p-2">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-800">StreetFood Connect</h1>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 mb-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-emerald-600 hover:underline">
                Sign up
              </Link>
            </div>

            {/* Demo accounts for testing */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-2">Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail("rajesh@freshveggies.com");
                    setPassword("demo123");
                  }}
                  disabled={isLoading}
                >
                  Supplier Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail("ravi@chatstall.com");
                    setPassword("demo123");
                  }}
                  disabled={isLoading}
                >
                  Vendor Demo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
