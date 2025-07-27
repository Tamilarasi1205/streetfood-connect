import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth, withAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiCall, authenticatedApiCall } from "@/lib/api";
import {
  Leaf,
  Search,
  MapPin,
  Star,
  ShoppingCart,
  Clock,
  Package,
  Filter,
  LogOut,
  Plus,
  Minus,
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react";
import { Product, Order, GroupOrder, CreateOrderRequest, CreateRatingRequest, ApiResponse, OrderStatus } from "@shared/api";

function VendorDashboard() {
  const { user, logout, token } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [cart, setCart] = useState<{[productId: string]: {product: Product, quantity: number}}>({});
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderForm, setOrderForm] = useState({
    deliveryAddress: "",
    notes: ""
  });
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    orderId: "",
    supplierId: "",
    rating: 5,
    comment: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter products based on search term and category
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const fetchData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchGroupOrders()
    ]);
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await apiCall('/api/products');
      const data: ApiResponse<Product[]> = await response.json();

      if (data.success && data.data) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await authenticatedApiCall(token!, '/api/orders');
      const data: ApiResponse<Order[]> = await response.json();

      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  const fetchGroupOrders = async () => {
    try {
      const response = await apiCall('/api/group-orders');
      const data: ApiResponse<GroupOrder[]> = await response.json();

      if (data.success && data.data) {
        setGroupOrders(data.data);
      }
    } catch (error) {
      console.error("Fetch group orders error:", error);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: {
        product,
        quantity: prev[product.id]?.quantity ? prev[product.id].quantity + 1 : product.minimumOrder
      }
    }));
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity
      }
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => total + (item.quantity * item.product.unitPrice), 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(cart).length === 0) {
      toast({
        title: "Error",
        description: "Please add items to your cart",
        variant: "destructive",
      });
      return;
    }

    if (!orderForm.deliveryAddress) {
      toast({
        title: "Error",
        description: "Please provide a delivery address",
        variant: "destructive",
      });
      return;
    }

    // Group cart items by supplier
    const supplierGroups: {[supplierId: string]: Array<{productId: string, quantity: number, unitPrice: number}>} = {};

    Object.values(cart).forEach(item => {
      const supplierId = item.product.supplierId;
      if (!supplierGroups[supplierId]) {
        supplierGroups[supplierId] = [];
      }
      supplierGroups[supplierId].push({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.unitPrice
      });
    });

    try {
      // Create separate orders for each supplier
      const orderPromises = Object.entries(supplierGroups).map(([supplierId, items]) => {
        const orderData: CreateOrderRequest = {
          supplierId,
          items,
          deliveryAddress: orderForm.deliveryAddress,
          orderType: "individual",
          notes: orderForm.notes
        };

        return authenticatedApiCall(token!, '/api/orders', {
          method: 'POST',
          body: JSON.stringify(orderData)
        });
      });

      const responses = await Promise.all(orderPromises);
      const results = await Promise.all(responses.map(r => r.json()));

      const successCount = results.filter(r => r.success).length;

      if (successCount > 0) {
        setCart({});
        setShowOrderDialog(false);
        setOrderForm({ deliveryAddress: "", notes: "" });
        await fetchOrders();

        toast({
          title: "Success",
          description: `${successCount} order(s) placed successfully!`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to place orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleCreateRating = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authenticatedApiCall(token!, '/api/ratings', {
        method: 'POST',
        body: JSON.stringify(ratingForm)
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setShowRatingDialog(false);
        setRatingForm({ orderId: "", supplierId: "", rating: 5, comment: "" });
        toast({
          title: "Success",
          description: "Rating submitted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit rating",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleJoinGroupOrder = async (groupOrderId: string, quantity: number) => {
    try {
      const response = await authenticatedApiCall(token!, `/api/group-orders/${groupOrderId}/join`, {
        method: 'POST',
        body: JSON.stringify({ quantity })
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        await fetchGroupOrders();
        toast({
          title: "Success",
          description: "Successfully joined group order!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join group order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "ready": return "bg-green-100 text-green-800";
      case "delivered": return "bg-emerald-100 text-emerald-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate analytics
  const totalSpent = orders
    .filter(o => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "confirmed" || o.status === "preparing").length;
  const totalOrders = orders.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-emerald-600 rounded-xl p-2">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-800">StreetFood Connect</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                🛒 Vendor Dashboard
              </Badge>
              <span className="text-sm text-gray-600">Hi, {user?.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Browse fresh ingredients from trusted suppliers near you
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cart Items</p>
                  <p className="text-2xl font-bold">{getCartItemCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Summary */}
        {Object.keys(cart).length > 0 && (
          <Card className="mb-8 border-emerald-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shopping Cart ({getCartItemCount()} items)
                </CardTitle>
                <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Checkout • {formatPrice(getCartTotal())}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Place Order</DialogTitle>
                      <DialogDescription>
                        Complete your order details
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateOrder} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryAddress">Delivery Address</Label>
                        <Textarea
                          id="deliveryAddress"
                          value={orderForm.deliveryAddress}
                          onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                          placeholder="Enter your stall address"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Special Instructions (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={orderForm.notes}
                          onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                          placeholder="Any special requirements..."
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Order Summary</h4>
                        {Object.values(cart).map(item => (
                          <div key={item.product.id} className="flex justify-between text-sm mb-1">
                            <span>{item.product.name} × {item.quantity}</span>
                            <span>{formatPrice(item.quantity * item.product.unitPrice)}</span>
                          </div>
                        ))}
                        <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatPrice(getCartTotal())}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                          Place Order
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowOrderDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.values(cart).map(item => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {item.product.imageUrl && (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                      )}
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.product.unitPrice)}/{item.product.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Products</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="group-orders">Group Orders</TabsTrigger>
            <TabsTrigger value="ratings">My Ratings</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  Find Suppliers & Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search products or suppliers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedCategory === "" ? "default" : "outline"}
                      onClick={() => setSelectedCategory("")}
                      className={selectedCategory === "" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      All Categories
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>

                        <p className="text-gray-600 text-sm mb-2">{product.description}</p>

                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {(product as any).supplier?.location || 'Location not available'}
                        </div>

                        {(product as any).supplier?.rating && (
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {(product as any).supplier.rating} ({(product as any).supplier.totalRatings || 0} reviews)
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-2xl font-bold text-emerald-600">
                              {formatPrice(product.unitPrice)}
                            </span>
                            <span className="text-sm text-gray-500">/{product.unit}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Available</div>
                            <div className="font-semibold">{product.availableQuantity} {product.unit}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>Min order: {product.minimumOrder} {product.unit}</span>
                          {product.expiryDate && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(product.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {cart[product.id] ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(product.id, cart[product.id].quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="flex-1 text-center font-semibold">{cart[product.id].quantity} in cart</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(product.id, cart[product.id].quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Orders</h2>
            </div>

            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{(order as any).supplier?.name}</h3>
                        <p className="text-sm text-gray-600">Order #{order.id.slice(-8)}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{(item as any).product?.name || 'Product'} × {item.quantity}</span>
                          <span>{formatPrice(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-2 mb-4">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <p>Delivery: {order.deliveryAddress}</p>
                      <p>Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    {order.status === "delivered" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setRatingForm({
                            orderId: order.id,
                            supplierId: order.supplierId,
                            rating: 5,
                            comment: ""
                          });
                          setShowRatingDialog(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Rate Supplier
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No orders yet</h3>
                  <p className="text-gray-500">Start browsing products to place your first order</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="group-orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Group Orders</h2>

            <div className="space-y-4">
              {groupOrders.map(groupOrder => (
                <Card key={groupOrder.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{(groupOrder as any).product?.name}</h3>
                        <p className="text-sm text-gray-600">by {(groupOrder as any).supplier?.name}</p>
                      </div>
                      <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                        {groupOrder.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Regular Price</p>
                        <p className="font-semibold line-through">{formatPrice(groupOrder.unitPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Group Price</p>
                        <p className="font-semibold text-emerald-600">{formatPrice(groupOrder.discountPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Progress</p>
                        <p className="font-semibold">{groupOrder.currentQuantity}/{groupOrder.targetQuantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Deadline</p>
                        <p className="font-semibold">{new Date(groupOrder.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${Math.min((groupOrder.currentQuantity / groupOrder.targetQuantity) * 100, 100)}%` }}
                      ></div>
                    </div>

                    {groupOrder.status === "open" && !groupOrder.participants.includes(user?.id || '') && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const quantity = prompt(`How many ${(groupOrder as any).product?.unit} would you like to order?`);
                          if (quantity && !isNaN(Number(quantity))) {
                            handleJoinGroupOrder(groupOrder.id, Number(quantity));
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Join Group Order
                      </Button>
                    )}

                    {groupOrder.participants.includes(user?.id || '') && (
                      <Badge variant="outline" className="text-green-700 border-green-200">
                        ✓ You've joined this group order
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}

              {groupOrders.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No group orders available</h3>
                  <p className="text-gray-500">Check back later for bulk buying opportunities</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <h2 className="text-2xl font-bold">My Ratings & Reviews</h2>

            <div className="text-center py-8">
              <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No ratings yet</h3>
              <p className="text-gray-500">Rate suppliers after receiving your orders</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Rating Dialog */}
        <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate Supplier</DialogTitle>
              <DialogDescription>
                Share your experience with this supplier
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateRating} className="space-y-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setRatingForm({...ratingForm, rating: star})}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= ratingForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </Button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{ratingForm.rating}/5</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Review (Optional)</Label>
                <Textarea
                  id="comment"
                  value={ratingForm.comment}
                  onChange={(e) => setRatingForm({...ratingForm, comment: e.target.value})}
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  Submit Rating
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRatingDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default withAuth(VendorDashboard);
