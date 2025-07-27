import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth, withAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiCall, authenticatedApiCall } from "@/lib/api";
import {
  Leaf,
  Plus,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Eye,
  LogOut,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Product, Order, Rating, ApiResponse, ProductRequest, OrderStatus } from "@shared/api";

function SupplierDashboard() {
  const { user, logout, token } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [productForm, setProductForm] = useState<ProductRequest>({
    name: "",
    category: "",
    description: "",
    unitPrice: 0,
    unit: "kg",
    availableQuantity: 0,
    minimumOrder: 1,
    expiryDate: "",
    imageUrl: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchRatings()
    ]);
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await authenticatedApiCall(token!, '/api/supplier/products');
      const data: ApiResponse<Product[]> = await response.json();
      if (data.success && data.data) {
        setProducts(data.data);
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

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings/supplier/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data: ApiResponse<Rating[]> = await response.json();
      if (data.success && data.data) {
        setRatings(data.data);
      }
    } catch (error) {
      console.error("Fetch ratings error:", error);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      const data: ApiResponse<Product> = await response.json();

      if (data.success && data.data) {
        setProducts([...products, data.data]);
        setShowAddProduct(false);
        resetProductForm();
        toast({
          title: "Success",
          description: "Product added successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add product",
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

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      const data: ApiResponse<Product> = await response.json();

      if (data.success && data.data) {
        setProducts(products.map(p => p.id === editingProduct.id ? data.data! : p));
        setEditingProduct(null);
        resetProductForm();
        toast({
          title: "Success",
          description: "Product updated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update product",
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

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setProducts(products.filter(p => p.id !== productId));
        toast({
          title: "Success",
          description: "Product deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete product",
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

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data: ApiResponse<Order> = await response.json();

      if (data.success && data.data) {
        setOrders(orders.map(o => o.id === orderId ? data.data! : o));
        toast({
          title: "Success",
          description: `Order ${status}!`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update order",
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

  const resetProductForm = () => {
    setProductForm({
      name: "",
      category: "",
      description: "",
      unitPrice: 0,
      unit: "kg",
      availableQuantity: 0,
      minimumOrder: 1,
      expiryDate: "",
      imageUrl: ""
    });
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description || "",
      unitPrice: product.unitPrice,
      unit: product.unit,
      availableQuantity: product.availableQuantity,
      minimumOrder: product.minimumOrder,
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : "",
      imageUrl: product.imageUrl || ""
    });
  };

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
  const totalRevenue = orders
    .filter(o => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const totalProducts = products.length;
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
                📦 Supplier Dashboard
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
            Manage your inventory, orders, and connect with vendors
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
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
                <Package className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{(order as any).vendor?.name}</p>
                        <p className="text-sm text-gray-600">{order.items.length} items • {formatPrice(order.totalAmount)}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded object-cover" />
                        )}
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.availableQuantity} {product.unit} available</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(product.unitPrice)}</p>
                        <p className="text-sm text-gray-600">per {product.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Inventory</h2>
              <Dialog open={showAddProduct || !!editingProduct} onOpenChange={(open) => {
                if (!open) {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  resetProductForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setShowAddProduct(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>
                      {editingProduct ? 'Update your product details' : 'Add a new product to your inventory'}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        placeholder="Fresh Tomatoes"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vegetables">Vegetables</SelectItem>
                          <SelectItem value="Fruits">Fruits</SelectItem>
                          <SelectItem value="Spices">Spices</SelectItem>
                          <SelectItem value="Grains">Grains</SelectItem>
                          <SelectItem value="Dairy">Dairy</SelectItem>
                          <SelectItem value="Leafy Greens">Leafy Greens</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unitPrice">Price per Unit</Label>
                        <Input
                          id="unitPrice"
                          type="number"
                          value={productForm.unitPrice}
                          onChange={(e) => setProductForm({...productForm, unitPrice: Number(e.target.value)})}
                          placeholder="25"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={productForm.unit} onValueChange={(value) => setProductForm({...productForm, unit: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="pieces">pieces</SelectItem>
                            <SelectItem value="liters">liters</SelectItem>
                            <SelectItem value="grams">grams</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="availableQuantity">Available Quantity</Label>
                        <Input
                          id="availableQuantity"
                          type="number"
                          value={productForm.availableQuantity}
                          onChange={(e) => setProductForm({...productForm, availableQuantity: Number(e.target.value)})}
                          placeholder="100"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimumOrder">Minimum Order</Label>
                        <Input
                          id="minimumOrder"
                          type="number"
                          value={productForm.minimumOrder}
                          onChange={(e) => setProductForm({...productForm, minimumOrder: Number(e.target.value)})}
                          placeholder="10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={productForm.expiryDate}
                        onChange={(e) => setProductForm({...productForm, expiryDate: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        placeholder="Fresh, organic tomatoes perfect for cooking"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddProduct(false);
                          setEditingProduct(null);
                          resetProductForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>Available: {product.availableQuantity} {product.unit}</p>
                        <p>Price: {formatPrice(product.unitPrice)}/{product.unit}</p>
                        <p>Min Order: {product.minimumOrder} {product.unit}</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditProduct(product)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Order Management</h2>

            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{(order as any).vendor?.name}</h3>
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

                    {order.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {order.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, "preparing")}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Start Preparing
                      </Button>
                    )}

                    {order.status === "preparing" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Ready
                      </Button>
                    )}

                    {order.status === "ready" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, "delivered")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Delivered
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>

            <div className="space-y-4">
              {ratings.map(rating => (
                <Card key={rating.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{(rating as any).vendor?.name}</h3>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{rating.rating}/5</span>
                      </div>
                    </div>

                    {rating.comment && (
                      <p className="text-gray-600 mb-2">{rating.comment}</p>
                    )}

                    <p className="text-xs text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {ratings.length === 0 && (
                <div className="text-center py-8">
                  <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No reviews yet</h3>
                  <p className="text-gray-500">Start fulfilling orders to receive customer feedback</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(SupplierDashboard);
