import { RequestHandler } from "express";
import { dataStore } from "../data/store";
import { CreateOrderRequest, ApiResponse, Order, OrderStatus } from "@shared/api";

export const handleCreateOrder: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: "Only vendors can create orders" });
    }
    
    const orderData: CreateOrderRequest = req.body;
    
    if (!orderData.supplierId || !orderData.items || !orderData.deliveryAddress) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    // Validate supplier exists
    const supplier = dataStore.getUserById(orderData.supplierId);
    if (!supplier || supplier.role !== 'supplier') {
      return res.status(404).json({ success: false, error: "Supplier not found" });
    }
    
    // Validate products and calculate total
    let totalAmount = 0;
    for (const item of orderData.items) {
      const product = dataStore.getProductById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product ${item.productId} not found` });
      }
      
      if (product.supplierId !== orderData.supplierId) {
        return res.status(400).json({ success: false, error: "All items must be from the same supplier" });
      }
      
      if (item.quantity < product.minimumOrder) {
        return res.status(400).json({ 
          success: false, 
          error: `Minimum order for ${product.name} is ${product.minimumOrder} ${product.unit}` 
        });
      }
      
      if (item.quantity > product.availableQuantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Not enough ${product.name} available. Available: ${product.availableQuantity} ${product.unit}` 
        });
      }
      
      totalAmount += item.quantity * product.unitPrice;
    }
    
    const order = dataStore.createOrder({
      vendorId: user.id,
      supplierId: orderData.supplierId,
      items: orderData.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      })),
      totalAmount,
      status: "pending",
      orderType: orderData.orderType,
      groupOrderId: orderData.groupOrderId,
      deliveryAddress: orderData.deliveryAddress,
      notes: orderData.notes
    });
    
    // Update product quantities
    orderData.items.forEach(item => {
      const product = dataStore.getProductById(item.productId);
      if (product) {
        dataStore.updateProduct(item.productId, {
          availableQuantity: product.availableQuantity - item.quantity
        });
      }
    });
    
    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: "Order created successfully"
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetOrders: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    let orders: Order[] = [];
    
    if (user.role === 'vendor') {
      orders = dataStore.getOrdersByVendorId(user.id);
    } else if (user.role === 'supplier') {
      orders = dataStore.getOrdersBySupplierId(user.id);
    }
    
    // Add related user and product info
    const ordersWithDetails = orders.map(order => {
      const vendor = dataStore.getUserById(order.vendorId);
      const supplier = dataStore.getUserById(order.supplierId);
      const itemsWithProducts = order.items.map(item => {
        const product = dataStore.getProductById(item.productId);
        return { ...item, product };
      });
      
      return {
        ...order,
        vendor,
        supplier,
        items: itemsWithProducts
      };
    });
    
    const response: ApiResponse<Order[]> = {
      success: true,
      data: ordersWithDetails
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetOrder: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const order = dataStore.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    
    // Check if user has access to this order
    if (order.vendorId !== user.id && order.supplierId !== user.id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    
    // Add related info
    const vendor = dataStore.getUserById(order.vendorId);
    const supplier = dataStore.getUserById(order.supplierId);
    const itemsWithProducts = order.items.map(item => {
      const product = dataStore.getProductById(item.productId);
      return { ...item, product };
    });
    
    const orderWithDetails = {
      ...order,
      vendor,
      supplier,
      items: itemsWithProducts
    };
    
    const response: ApiResponse<Order> = {
      success: true,
      data: orderWithDetails
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleUpdateOrderStatus: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status }: { status: OrderStatus } = req.body;
    
    if (user.role !== 'supplier') {
      return res.status(403).json({ success: false, error: "Only suppliers can update order status" });
    }
    
    const order = dataStore.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    
    if (order.supplierId !== user.id) {
      return res.status(403).json({ success: false, error: "You can only update your own orders" });
    }
    
    const validStatuses: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }
    
    const updatedOrder = dataStore.updateOrderStatus(id, status);
    
    const response: ApiResponse<Order> = {
      success: true,
      data: updatedOrder,
      message: "Order status updated successfully"
    };
    
    res.json(response);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
