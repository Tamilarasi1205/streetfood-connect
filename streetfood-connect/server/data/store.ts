import { 
  User, 
  Product, 
  Order, 
  GroupOrder, 
  Rating,
  OrderStatus,
  UserRole,
  BusinessType 
} from "@shared/api";

// In-memory data store (replace with MongoDB in production)
class DataStore {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private orders: Map<string, Order> = new Map();
  private groupOrders: Map<string, GroupOrder> = new Map();
  private ratings: Map<string, Rating> = new Map();

  constructor() {
    this.seedData();
  }

  // Generate unique ID
  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // User operations
  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Product operations
  createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const product: Product = {
      id: this.generateId(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.set(product.id, product);
    return product;
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  getProductsBySupplierId(supplierId: string): Product[] {
    return Array.from(this.products.values()).filter(p => p.supplierId === supplierId);
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const product = this.products.get(id);
    if (product) {
      const updatedProduct = { 
        ...product, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      this.products.set(id, updatedProduct);
      return updatedProduct;
    }
    return undefined;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // Order operations
  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const order: Order = {
      id: this.generateId(),
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(order.id, order);
    return order;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getOrdersByVendorId(vendorId: string): Order[] {
    return Array.from(this.orders.values()).filter(o => o.vendorId === vendorId);
  }

  getOrdersBySupplierId(supplierId: string): Order[] {
    return Array.from(this.orders.values()).filter(o => o.supplierId === supplierId);
  }

  updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
    const order = this.orders.get(id);
    if (order) {
      const updatedOrder = { 
        ...order, 
        status, 
        updatedAt: new Date().toISOString() 
      };
      this.orders.set(id, updatedOrder);
      return updatedOrder;
    }
    return undefined;
  }

  // Group Order operations
  createGroupOrder(groupOrderData: Omit<GroupOrder, 'id' | 'createdAt' | 'updatedAt'>): GroupOrder {
    const groupOrder: GroupOrder = {
      id: this.generateId(),
      ...groupOrderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.groupOrders.set(groupOrder.id, groupOrder);
    return groupOrder;
  }

  getGroupOrderById(id: string): GroupOrder | undefined {
    return this.groupOrders.get(id);
  }

  getAllGroupOrders(): GroupOrder[] {
    return Array.from(this.groupOrders.values());
  }

  joinGroupOrder(id: string, vendorId: string, quantity: number): GroupOrder | undefined {
    const groupOrder = this.groupOrders.get(id);
    if (groupOrder && !groupOrder.participants.includes(vendorId)) {
      const updatedGroupOrder = {
        ...groupOrder,
        participants: [...groupOrder.participants, vendorId],
        currentQuantity: groupOrder.currentQuantity + quantity,
        updatedAt: new Date().toISOString()
      };
      this.groupOrders.set(id, updatedGroupOrder);
      return updatedGroupOrder;
    }
    return undefined;
  }

  updateGroupOrder(id: string, updates: Partial<GroupOrder>): GroupOrder | undefined {
    const groupOrder = this.groupOrders.get(id);
    if (groupOrder) {
      const updatedGroupOrder = {
        ...groupOrder,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.groupOrders.set(id, updatedGroupOrder);
      return updatedGroupOrder;
    }
    return undefined;
  }

  // Rating operations
  createRating(ratingData: Omit<Rating, 'id' | 'createdAt'>): Rating {
    const rating: Rating = {
      id: this.generateId(),
      ...ratingData,
      createdAt: new Date().toISOString(),
    };
    this.ratings.set(rating.id, rating);
    
    // Update supplier's average rating
    this.updateSupplierRating(rating.supplierId);
    
    return rating;
  }

  getRatingsBySupplierId(supplierId: string): Rating[] {
    return Array.from(this.ratings.values()).filter(r => r.supplierId === supplierId);
  }

  getRatingsByVendorId(vendorId: string): Rating[] {
    return Array.from(this.ratings.values()).filter(r => r.vendorId === vendorId);
  }

  private updateSupplierRating(supplierId: string): void {
    const ratings = this.getRatingsBySupplierId(supplierId);
    const supplier = this.users.get(supplierId);
    
    if (supplier && ratings.length > 0) {
      const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / ratings.length;
      
      this.updateUser(supplierId, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings: ratings.length
      });
    }
  }

  // Seed some initial data for development
  private seedData(): void {
    // Create sample suppliers
    const supplier1 = this.createUser({
      email: "rajesh@freshveggies.com",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      location: "Azadpur Mandi, Delhi",
      role: "supplier" as UserRole,
      businessType: "wholesaler" as BusinessType,
      rating: 4.5,
      totalRatings: 23
    });

    const supplier2 = this.createUser({
      email: "priya@organicfarm.com",
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      location: "Gurgaon, Haryana",
      role: "supplier" as UserRole,
      businessType: "farm" as BusinessType,
      rating: 4.8,
      totalRatings: 15
    });

    // Create sample vendors
    const vendor1 = this.createUser({
      email: "ravi@chatstall.com",
      name: "Ravi Patel",
      phone: "+91 76543 21098",
      location: "Connaught Place, Delhi",
      role: "vendor" as UserRole,
      stallName: "Ravi's Chat Corner"
    });

    // Create sample products
    this.createProduct({
      supplierId: supplier1.id,
      name: "Fresh Tomatoes",
      category: "Vegetables",
      description: "Farm fresh red tomatoes, perfect for cooking",
      unitPrice: 25,
      unit: "kg",
      availableQuantity: 500,
      minimumOrder: 10,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400"
    });

    this.createProduct({
      supplierId: supplier1.id,
      name: "Yellow Onions",
      category: "Vegetables",
      description: "Fresh yellow onions, ideal for cooking",
      unitPrice: 20,
      unit: "kg",
      availableQuantity: 300,
      minimumOrder: 5,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      imageUrl: "https://images.unsplash.com/photo-1587049332298-cf0c4916d4c6?w=400"
    });

    this.createProduct({
      supplierId: supplier2.id,
      name: "Organic Spinach",
      category: "Leafy Greens",
      description: "Fresh organic spinach leaves",
      unitPrice: 40,
      unit: "kg",
      availableQuantity: 100,
      minimumOrder: 2,
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
      imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400"
    });

    this.createProduct({
      supplierId: supplier2.id,
      name: "Green Chilies",
      category: "Spices",
      description: "Fresh green chilies for that perfect spice",
      unitPrice: 60,
      unit: "kg",
      availableQuantity: 50,
      minimumOrder: 1,
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
      imageUrl: "https://images.unsplash.com/photo-1583658697259-c4ba846a4f10?w=400"
    });
  }
}

// Export singleton instance
export const dataStore = new DataStore();
