import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  ShoppingCart,
  Package,
  Users,
  Star,
  Truck,
  DollarSign,
  Clock,
  MapPin,
  CheckCircle,
  ArrowRight,
  Leaf,
  Shield,
  LogOut
} from "lucide-react";

export default function Index() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 rounded-xl p-2">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-800">StreetFood Connect</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors">How it Works</a>
              <a href="#benefits" className="text-gray-600 hover:text-emerald-600 transition-colors">Benefits</a>
            </nav>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center space-x-3">
                    <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                      {user?.role === 'vendor' ? '🛒 Vendor' : '📦 Supplier'}
                    </Badge>
                    <span className="text-sm text-gray-600">Hi, {user?.name}</span>
                  </div>
                  <Link
                    to={user?.role === 'vendor' ? '/vendor-dashboard' : '/supplier-dashboard'}
                  >
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-emerald-100 text-emerald-800 border-emerald-200">
            Connecting India's Street Food Ecosystem
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Fresh Ingredients,
            <span className="text-emerald-600 block">Direct to You</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The platform that connects street food vendors with trusted suppliers. 
            Get fresh ingredients at wholesale prices, delivered right to your stall.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'vendor' ? '/vendor-dashboard' : '/supplier-dashboard'}
              >
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register?type=vendor">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    I'm a Vendor
                  </Button>
                </Link>
                <Link to="/register?type=supplier">
                  <Button size="lg" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg">
                    <Package className="mr-2 h-5 w-5" />
                    I'm a Supplier
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">500+</div>
              <div className="text-gray-600">Active Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">200+</div>
              <div className="text-gray-600">Trusted Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">30%</div>
              <div className="text-gray-600">Cost Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for India's street food ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-emerald-100 rounded-lg p-3 w-fit mb-4">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Location-Based Sourcing</h3>
                <p className="text-gray-600">Find suppliers near your stall for faster delivery and lower costs</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-emerald-100 rounded-lg p-3 w-fit mb-4">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Group Buying</h3>
                <p className="text-gray-600">Join with other vendors for bulk purchases and better prices</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-emerald-100 rounded-lg p-3 w-fit mb-4">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
                <p className="text-gray-600">Verified suppliers with quality ratings and reviews</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-emerald-100 rounded-lg p-3 w-fit mb-4">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
                <p className="text-gray-600">Track your orders from supplier to your stall</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-emerald-100 rounded-lg p-3 w-fit mb-4">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-gray-600">No hidden costs, competitive wholesale prices</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-emerald-100 rounded-lg p-3 w-fit mb-4">
                  <Star className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Rating System</h3>
                <p className="text-gray-600">Rate suppliers and build trust in the community</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How StreetFood Connect Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to transform your ingredient sourcing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse & Discover</h3>
              <p className="text-gray-600">Find trusted suppliers near you with fresh ingredients</p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Order & Pay</h3>
              <p className="text-gray-600">Place orders individually or join group purchases</p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive & Rate</h3>
              <p className="text-gray-600">Get fresh ingredients delivered and rate your experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Street Food Vendors Choose StreetFood Connect
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Save 30% on Ingredient Costs</h3>
                    <p className="text-gray-600">Direct wholesale pricing without middlemen markups</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Reliable Daily Supply</h3>
                    <p className="text-gray-600">Never run out of ingredients with consistent suppliers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Quality Guaranteed</h3>
                    <p className="text-gray-600">Fresh produce with quality ratings from the community</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Time Saving</h3>
                    <p className="text-gray-600">Skip the market trips, focus on your customers</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <Truck className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                  <p className="text-gray-600">Get your ingredients delivered to your stall within hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of vendors already saving money and time with StreetFood Connect
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg">
              Start Sourcing Smarter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-emerald-600 rounded-xl p-2">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">StreetFood Connect</h3>
              </div>
              <p className="text-gray-400">
                Connecting India's street food vendors with trusted suppliers for fresher ingredients and better profits.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Vendors</h4>
              <div className="space-y-2 text-gray-400">
                <Link to="/vendor-dashboard" className="block hover:text-white">Browse Suppliers</Link>
                <Link to="/group-orders" className="block hover:text-white">Group Orders</Link>
                <Link to="/order-tracking" className="block hover:text-white">Track Orders</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Suppliers</h4>
              <div className="space-y-2 text-gray-400">
                <Link to="/supplier-dashboard" className="block hover:text-white">Manage Inventory</Link>
                <Link to="/orders" className="block hover:text-white">View Orders</Link>
                <Link to="/analytics" className="block hover:text-white">Analytics</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white">Help Center</a>
                <a href="#" className="block hover:text-white">Contact Us</a>
                <a href="#" className="block hover:text-white">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StreetFood Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
