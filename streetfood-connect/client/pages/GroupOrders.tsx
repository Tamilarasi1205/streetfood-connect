import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth, withAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiCall, authenticatedApiCall } from "@/lib/api";
import { 
  Leaf, 
  Plus, 
  Users, 
  Clock, 
  Package,
  TrendingDown,
  MapPin,
  LogOut,
  Star
} from "lucide-react";
import { Product, GroupOrder, CreateGroupOrderRequest, ApiResponse } from "@shared/api";

function GroupOrders() {
  const { user, logout, token } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [groupOrderForm, setGroupOrderForm] = useState<CreateGroupOrderRequest>({
    supplierId: "",
    productId: "",
    targetQuantity: 0,
    discountPrice: 0,
    deadline: "",
    deliveryAddress: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchProducts(),
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
      }
    } catch (error) {
      console.error("Fetch products error:", error);
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

  const handleCreateGroupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/group-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupOrderForm)
      });

      const data: ApiResponse<GroupOrder> = await response.json();
      
      if (data.success) {
        setShowCreateDialog(false);
        resetForm();
        await fetchGroupOrders();
        toast({
          title: "Success",
          description: "Group order created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create group order",
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
      const response = await fetch(`/api/group-orders/${groupOrderId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  const resetForm = () => {
    setGroupOrderForm({
      supplierId: "",
      productId: "",
      targetQuantity: 0,
      discountPrice: 0,
      deadline: "",
      deliveryAddress: ""
    });
    setSelectedProduct(null);
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setGroupOrderForm({
      ...groupOrderForm,
      supplierId: product.supplierId,
      productId: product.id,
      discountPrice: product.unitPrice * 0.9 // Default 10% discount
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

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
                👥 Group Orders
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
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Group Orders</h1>
            <p className="text-gray-600">Join bulk orders with other vendors for better prices</p>
          </div>
          
          {user?.role === 'vendor' && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Group Order</DialogTitle>
                  <DialogDescription>
                    Start a group order to get bulk discounts with other vendors
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateGroupOrder} className="space-y-6">
                  {!selectedProduct ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Select a Product</h3>
                      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                        {products.map(product => (
                          <Card 
                            key={product.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => selectProduct(product)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                {product.imageUrl && (
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name}
                                    className="w-16 h-16 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold">{product.name}</h4>
                                  <p className="text-sm text-gray-600">{(product as any).supplier?.name}</p>
                                  <p className="text-emerald-600 font-bold">{formatPrice(product.unitPrice)}/{product.unit}</p>
                                </div>
                                <Badge variant="secondary">{product.category}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Selected Product</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedProduct(null)}
                        >
                          Change Product
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            {selectedProduct.imageUrl && (
                              <img 
                                src={selectedProduct.imageUrl} 
                                alt={selectedProduct.name}
                                className="w-16 h-16 rounded object-cover"
                              />
                            )}
                            <div>
                              <h4 className="font-semibold">{selectedProduct.name}</h4>
                              <p className="text-sm text-gray-600">{(selectedProduct as any).supplier?.name}</p>
                              <p className="text-emerald-600 font-bold">{formatPrice(selectedProduct.unitPrice)}/{selectedProduct.unit}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="targetQuantity">Target Quantity</Label>
                          <Input
                            id="targetQuantity"
                            type="number"
                            value={groupOrderForm.targetQuantity}
                            onChange={(e) => setGroupOrderForm({...groupOrderForm, targetQuantity: Number(e.target.value)})}
                            placeholder="100"
                            required
                          />
                          <p className="text-xs text-gray-500">Minimum quantity needed for bulk discount</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discountPrice">Bulk Price per {selectedProduct.unit}</Label>
                          <Input
                            id="discountPrice"
                            type="number"
                            step="0.01"
                            value={groupOrderForm.discountPrice}
                            onChange={(e) => setGroupOrderForm({...groupOrderForm, discountPrice: Number(e.target.value)})}
                            placeholder="22.50"
                            required
                          />
                          <p className="text-xs text-gray-500">
                            Regular: {formatPrice(selectedProduct.unitPrice)} • 
                            Savings: {formatPrice(selectedProduct.unitPrice - groupOrderForm.discountPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deadline">Order Deadline</Label>
                        <Input
                          id="deadline"
                          type="datetime-local"
                          value={groupOrderForm.deadline}
                          onChange={(e) => setGroupOrderForm({...groupOrderForm, deadline: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryAddress">Delivery Address</Label>
                        <Textarea
                          id="deliveryAddress"
                          value={groupOrderForm.deliveryAddress}
                          onChange={(e) => setGroupOrderForm({...groupOrderForm, deliveryAddress: e.target.value})}
                          placeholder="Central pickup location for all participants"
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                          Create Group Order
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Group Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupOrders.map(groupOrder => (
            <Card key={groupOrder.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {(groupOrder as any).product?.imageUrl && (
                  <img 
                    src={(groupOrder as any).product.imageUrl} 
                    alt={(groupOrder as any).product?.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}
                
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{(groupOrder as any).product?.name}</h3>
                    <p className="text-sm text-gray-600">by {(groupOrder as any).supplier?.name}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 line-through">{formatPrice(groupOrder.unitPrice)}</p>
                      <p className="text-lg font-bold text-emerald-600">{formatPrice(groupOrder.discountPrice)}</p>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      Save {formatPrice(groupOrder.unitPrice - groupOrder.discountPrice)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{groupOrder.currentQuantity}/{groupOrder.targetQuantity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min((groupOrder.currentQuantity / groupOrder.targetQuantity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {groupOrder.participants.length} joined
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(groupOrder.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {groupOrder.deliveryAddress}
                    </div>
                  </div>
                  
                  {groupOrder.status === "open" && user?.role === 'vendor' && !groupOrder.participants.includes(user?.id || '') && (
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        const quantity = prompt(`How many ${(groupOrder as any).product?.unit} would you like to order?`);
                        if (quantity && !isNaN(Number(quantity))) {
                          handleJoinGroupOrder(groupOrder.id, Number(quantity));
                        }
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Join Group Order
                    </Button>
                  )}
                  
                  {groupOrder.participants.includes(user?.id || '') && (
                    <Badge variant="outline" className="w-full justify-center text-green-700 border-green-200">
                      ✓ You've joined this group order
                    </Badge>
                  )}
                  
                  {groupOrder.status === "completed" && (
                    <Badge variant="outline" className="w-full justify-center text-emerald-700 border-emerald-200">
                      🎉 Target reached! Order completed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {groupOrders.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No group orders available</h3>
            <p className="text-gray-500 mb-4">Be the first to create a group order for bulk savings!</p>
            {user?.role === 'vendor' && (
              <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Group Order
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(GroupOrders);
