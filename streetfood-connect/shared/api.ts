/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// User types
export type UserRole = "vendor" | "supplier";
export type BusinessType = "wholesaler" | "farm" | "kirana" | "distributor";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  location: string;
  role: UserRole;
  stallName?: string; // For vendors
  businessType?: BusinessType; // For suppliers
  rating?: number;
  totalRatings?: number;
  createdAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
  phone: string;
  location: string;
  role: UserRole;
  stallName?: string;
  businessType?: BusinessType;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Product/Inventory types
export interface Product {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  description?: string;
  unitPrice: number;
  unit: string; // kg, pieces, liters, etc.
  availableQuantity: number;
  minimumOrder: number;
  expiryDate?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  category: string;
  description?: string;
  unitPrice: number;
  unit: string;
  availableQuantity: number;
  minimumOrder: number;
  expiryDate?: string;
  imageUrl?: string;
}

// Order types
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
export type OrderType = "individual" | "group";

export interface OrderItem {
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  vendorId: string;
  vendor?: User;
  supplierId: string;
  supplier?: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderType: OrderType;
  groupOrderId?: string; // For group orders
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  supplierId: string;
  items: OrderItem[];
  deliveryAddress: string;
  orderType: OrderType;
  groupOrderId?: string;
  notes?: string;
}

// Group Order types
export interface GroupOrder {
  id: string;
  creatorId: string;
  creator?: User;
  supplierId: string;
  supplier?: User;
  productId: string;
  product?: Product;
  targetQuantity: number;
  currentQuantity: number;
  unitPrice: number;
  discountPrice: number; // Bulk discount price
  participants: string[]; // vendor IDs
  status: "open" | "closed" | "completed";
  deadline: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupOrderRequest {
  supplierId: string;
  productId: string;
  targetQuantity: number;
  discountPrice: number;
  deadline: string;
  deliveryAddress: string;
}

export interface JoinGroupOrderRequest {
  quantity: number;
}

// Rating types
export interface Rating {
  id: string;
  vendorId: string;
  vendor?: User;
  supplierId: string;
  supplier?: User;
  orderId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface CreateRatingRequest {
  orderId: string;
  supplierId: string;
  rating: number;
  comment?: string;
}

// Analytics types
export interface SupplierAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  topProducts: Array<{
    product: Product;
    orderCount: number;
    revenue: number;
  }>;
  monthlyStats: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
