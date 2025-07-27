import { RequestHandler } from "express";
import { dataStore } from "../data/store";
import { CreateGroupOrderRequest, JoinGroupOrderRequest, ApiResponse, GroupOrder } from "@shared/api";

export const handleCreateGroupOrder: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: "Only vendors can create group orders" });
    }
    
    const groupOrderData: CreateGroupOrderRequest = req.body;
    
    if (!groupOrderData.supplierId || !groupOrderData.productId || !groupOrderData.targetQuantity || !groupOrderData.discountPrice || !groupOrderData.deadline || !groupOrderData.deliveryAddress) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    // Validate supplier exists
    const supplier = dataStore.getUserById(groupOrderData.supplierId);
    if (!supplier || supplier.role !== 'supplier') {
      return res.status(404).json({ success: false, error: "Supplier not found" });
    }
    
    // Validate product exists and belongs to supplier
    const product = dataStore.getProductById(groupOrderData.productId);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    if (product.supplierId !== groupOrderData.supplierId) {
      return res.status(400).json({ success: false, error: "Product does not belong to the specified supplier" });
    }
    
    // Validate deadline is in the future
    const deadlineDate = new Date(groupOrderData.deadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ success: false, error: "Deadline must be in the future" });
    }
    
    // Validate discount price is less than unit price
    if (groupOrderData.discountPrice >= product.unitPrice) {
      return res.status(400).json({ success: false, error: "Discount price must be less than unit price" });
    }
    
    const groupOrder = dataStore.createGroupOrder({
      creatorId: user.id,
      supplierId: groupOrderData.supplierId,
      productId: groupOrderData.productId,
      targetQuantity: groupOrderData.targetQuantity,
      currentQuantity: 0,
      unitPrice: product.unitPrice,
      discountPrice: groupOrderData.discountPrice,
      participants: [],
      status: "open",
      deadline: groupOrderData.deadline,
      deliveryAddress: groupOrderData.deliveryAddress
    });
    
    const response: ApiResponse<GroupOrder> = {
      success: true,
      data: groupOrder,
      message: "Group order created successfully"
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error("Create group order error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetGroupOrders: RequestHandler = (req, res) => {
  try {
    const { status, supplierId } = req.query;
    
    let groupOrders = dataStore.getAllGroupOrders();
    
    // Filter by status
    if (status && typeof status === 'string') {
      groupOrders = groupOrders.filter(go => go.status === status);
    } else {
      // Default to only open group orders
      groupOrders = groupOrders.filter(go => go.status === 'open');
    }
    
    // Filter by supplier
    if (supplierId && typeof supplierId === 'string') {
      groupOrders = groupOrders.filter(go => go.supplierId === supplierId);
    }
    
    // Add related data
    const groupOrdersWithDetails = groupOrders.map(groupOrder => {
      const creator = dataStore.getUserById(groupOrder.creatorId);
      const supplier = dataStore.getUserById(groupOrder.supplierId);
      const product = dataStore.getProductById(groupOrder.productId);
      
      return {
        ...groupOrder,
        creator,
        supplier,
        product
      };
    });
    
    const response: ApiResponse<GroupOrder[]> = {
      success: true,
      data: groupOrdersWithDetails
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get group orders error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetGroupOrder: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const groupOrder = dataStore.getGroupOrderById(id);
    if (!groupOrder) {
      return res.status(404).json({ success: false, error: "Group order not found" });
    }
    
    // Add related data
    const creator = dataStore.getUserById(groupOrder.creatorId);
    const supplier = dataStore.getUserById(groupOrder.supplierId);
    const product = dataStore.getProductById(groupOrder.productId);
    const participants = groupOrder.participants.map(participantId => 
      dataStore.getUserById(participantId)
    ).filter(Boolean);
    
    const groupOrderWithDetails = {
      ...groupOrder,
      creator,
      supplier,
      product,
      participantDetails: participants
    };
    
    const response: ApiResponse<GroupOrder> = {
      success: true,
      data: groupOrderWithDetails
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get group order error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleJoinGroupOrder: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: "Only vendors can join group orders" });
    }
    
    const joinData: JoinGroupOrderRequest = req.body;
    
    if (!joinData.quantity || joinData.quantity <= 0) {
      return res.status(400).json({ success: false, error: "Quantity must be greater than 0" });
    }
    
    const groupOrder = dataStore.getGroupOrderById(id);
    if (!groupOrder) {
      return res.status(404).json({ success: false, error: "Group order not found" });
    }
    
    if (groupOrder.status !== 'open') {
      return res.status(400).json({ success: false, error: "Group order is not open for joining" });
    }
    
    // Check if deadline has passed
    if (new Date(groupOrder.deadline) <= new Date()) {
      // Auto-close expired group orders
      dataStore.updateGroupOrder(id, { status: 'closed' });
      return res.status(400).json({ success: false, error: "Group order deadline has passed" });
    }
    
    // Check if user already joined
    if (groupOrder.participants.includes(user.id)) {
      return res.status(400).json({ success: false, error: "You have already joined this group order" });
    }
    
    // Validate product availability
    const product = dataStore.getProductById(groupOrder.productId);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    const newTotalQuantity = groupOrder.currentQuantity + joinData.quantity;
    if (newTotalQuantity > product.availableQuantity) {
      return res.status(400).json({ 
        success: false, 
        error: `Not enough product available. Available: ${product.availableQuantity - groupOrder.currentQuantity} ${product.unit}` 
      });
    }
    
    const updatedGroupOrder = dataStore.joinGroupOrder(id, user.id, joinData.quantity);
    
    if (!updatedGroupOrder) {
      return res.status(500).json({ success: false, error: "Failed to join group order" });
    }
    
    // Check if target quantity is reached
    if (updatedGroupOrder.currentQuantity >= updatedGroupOrder.targetQuantity) {
      dataStore.updateGroupOrder(id, { status: 'completed' });
    }
    
    const response: ApiResponse<GroupOrder> = {
      success: true,
      data: updatedGroupOrder,
      message: "Successfully joined group order"
    };
    
    res.json(response);
  } catch (error) {
    console.error("Join group order error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetVendorGroupOrders: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: "Only vendors can access this endpoint" });
    }
    
    const allGroupOrders = dataStore.getAllGroupOrders();
    
    // Get group orders where user is creator or participant
    const userGroupOrders = allGroupOrders.filter(go => 
      go.creatorId === user.id || go.participants.includes(user.id)
    );
    
    // Add related data
    const groupOrdersWithDetails = userGroupOrders.map(groupOrder => {
      const creator = dataStore.getUserById(groupOrder.creatorId);
      const supplier = dataStore.getUserById(groupOrder.supplierId);
      const product = dataStore.getProductById(groupOrder.productId);
      
      return {
        ...groupOrder,
        creator,
        supplier,
        product
      };
    });
    
    const response: ApiResponse<GroupOrder[]> = {
      success: true,
      data: groupOrdersWithDetails
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get vendor group orders error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
