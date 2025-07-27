import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Leaf, ShoppingCart, Package, Loader2, User, Building, MapPin, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { UserRole, BusinessType } from "@shared/api";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<UserRole | "">("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",

    // Business Information
    businessName: "",
    businessType: "" as BusinessType | "",
    businessDescription: "",

    // Location Information
    businessAddress: "",
    city: "",
    state: "",
    zipCode: "",

    // Vendor-specific fields
    cuisineType: "",
    operatingHours: "",

    // Supplier-specific fields
    productCategories: "",
    deliveryRadius: "50",
    minimumOrderValue: "100",
  });
  const { register, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "vendor" || type === "supplier") {
      setUserType(type);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      const dashboardPath = user.role === 'vendor' ? '/vendor-dashboard' : '/supplier-dashboard';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Information
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
          toast({
            title: "Validation Error",
            description: "Please fill in all basic information fields",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 2: // Business Information
        if (!formData.businessName || !formData.businessType || !formData.businessDescription) {
          toast({
            title: "Validation Error",
            description: "Please fill in all business information fields",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 3: // Location Information
        if (!formData.businessAddress || !formData.city || !formData.state || !formData.zipCode) {
          toast({
            title: "Validation Error",
            description: "Please fill in all location information fields",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 4: // Role-specific details
        if (userType === "vendor") {
          if (!formData.cuisineType || !formData.operatingHours) {
            toast({
              title: "Validation Error",
              description: "Please fill in all vendor details",
              variant: "destructive",
            });
            return false;
          }
        } else if (userType === "supplier") {
          if (!formData.productCategories) {
            toast({
              title: "Validation Error",
              description: "Please fill in your product categories",
              variant: "destructive",
            });
            return false;
          }
        }
        break;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !userType) {
      toast({
        title: "Validation Error",
        description: "Please select whether you're a vendor or supplier",
        variant: "destructive",
      });
      return;
    }

    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast({
        title: "Validation Error",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    if (!validateStep(4)) {
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        location: `${formData.businessAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        role: userType,
        ...(userType === "vendor" && { stallName: formData.businessName }),
        ...(userType === "supplier" && { businessType: formData.businessType as BusinessType }),
      };

      const response = await register(registerData);

      if (response.success) {
        toast({
          title: "Registration Successful",
          description: `Welcome to StreetFood Connect, ${response.user?.name}!`,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: response.message || "Something went wrong",
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Basic Information";
      case 2: return "Business Information";
      case 3: return "Location Information";
      case 4: return userType === "vendor" ? "Vendor Details" : "Seller Details";
      default: return "Create Account";
    }
  };

  const getTotalSteps = () => userType ? 4 : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-emerald-600 rounded-xl p-2">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-800">StreetFood Connect</h1>
          </div>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Join the StreetFood Connect community today</CardDescription>

          {userType && (
            <>
              <div className="flex items-center justify-between mt-6 mb-2">
                <span className="text-sm text-gray-600">Step {currentStep} of {getTotalSteps()}</span>
                <span className="text-sm font-medium text-emerald-600">{getStepTitle()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
                ></div>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={currentStep === getTotalSteps() ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">

            {/* Step 1: Role Selection & Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">I am a...</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={userType === "vendor" ? "default" : "outline"}
                      className={`h-16 ${userType === "vendor" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                      onClick={() => setUserType("vendor")}
                      disabled={isLoading}
                    >
                      <div className="flex flex-col items-center">
                        <ShoppingCart className="h-6 w-6 mb-1" />
                        <span>Vendor</span>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={userType === "supplier" ? "default" : "outline"}
                      className={`h-16 ${userType === "supplier" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                      onClick={() => setUserType("supplier")}
                      disabled={isLoading}
                    >
                      <div className="flex flex-col items-center">
                        <Package className="h-6 w-6 mb-1" />
                        <span>Supplier</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {userType && (
                  <>
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <User className="h-5 w-5" />
                      <h3 className="text-lg font-medium">Basic Information</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+91 99999 99999"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-emerald-700">
                  <Building className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Business Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder={userType === "vendor" ? "Your food stall name" : "Your business name"}
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => handleInputChange("businessType", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {userType === "vendor" ? (
                        <>
                          <SelectItem value="street-stall">Street Food Stall</SelectItem>
                          <SelectItem value="food-cart">Food Cart</SelectItem>
                          <SelectItem value="kiosk">Food Kiosk</SelectItem>
                          <SelectItem value="mobile-vendor">Mobile Vendor</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="wholesaler">Wholesaler</SelectItem>
                          <SelectItem value="farm">Farm/Producer</SelectItem>
                          <SelectItem value="kirana">Kirana Shop</SelectItem>
                          <SelectItem value="distributor">Distributor</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description *</Label>
                  <Textarea
                    id="businessDescription"
                    placeholder={
                      userType === "vendor"
                        ? "Describe your food business, cuisine type, specialties..."
                        : "Describe your products, supply capacity, quality standards..."
                    }
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Location Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-emerald-700">
                  <MapPin className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Location Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <Input
                    id="businessAddress"
                    placeholder="Street address, building, area"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    placeholder="ZIP/Postal Code"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Role-specific Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-emerald-700">
                  <Store className="h-5 w-5" />
                  <h3 className="text-lg font-medium">
                    {userType === "vendor" ? "Vendor Details" : "Seller Details"}
                  </h3>
                </div>

                {userType === "vendor" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cuisineType">Cuisine Type *</Label>
                      <Select
                        value={formData.cuisineType}
                        onValueChange={(value) => handleInputChange("cuisineType", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indian">Indian</SelectItem>
                          <SelectItem value="north-indian">North Indian</SelectItem>
                          <SelectItem value="south-indian">South Indian</SelectItem>
                          <SelectItem value="chinese">Chinese</SelectItem>
                          <SelectItem value="continental">Continental</SelectItem>
                          <SelectItem value="fast-food">Fast Food</SelectItem>
                          <SelectItem value="beverages">Beverages</SelectItem>
                          <SelectItem value="desserts">Desserts</SelectItem>
                          <SelectItem value="snacks">Snacks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatingHours">Operating Hours *</Label>
                      <Input
                        id="operatingHours"
                        placeholder="e.g., 9 AM - 9 PM"
                        value={formData.operatingHours}
                        onChange={(e) => handleInputChange("operatingHours", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}

                {userType === "supplier" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="productCategories">Product Categories *</Label>
                      <Textarea
                        id="productCategories"
                        placeholder="e.g., Fresh vegetables, Spices, Meat, Dairy products..."
                        value={formData.productCategories}
                        onChange={(e) => handleInputChange("productCategories", e.target.value)}
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                        <Input
                          id="deliveryRadius"
                          type="number"
                          placeholder="50"
                          value={formData.deliveryRadius}
                          onChange={(e) => handleInputChange("deliveryRadius", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimumOrderValue">Minimum Order Value</Label>
                        <Input
                          id="minimumOrderValue"
                          type="number"
                          placeholder="100"
                          value={formData.minimumOrderValue}
                          onChange={(e) => handleInputChange("minimumOrderValue", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <span className="text-emerald-600 hover:underline cursor-pointer">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="text-emerald-600 hover:underline cursor-pointer">
                      Privacy Policy
                    </span>
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between space-x-4">
              {currentStep > 1 && userType && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}

              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading || (!userType && currentStep === 1)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentStep === getTotalSteps() ? "Creating Account..." : "Processing..."}
                  </>
                ) : (
                  currentStep === getTotalSteps() ? "Create Account" : "Next"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 hover:underline">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
