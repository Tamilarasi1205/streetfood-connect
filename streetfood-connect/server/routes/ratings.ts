import { RequestHandler } from "express";
import { dataStore } from "../data/store";
import { CreateRatingRequest, ApiResponse, Rating } from "@shared/api";

export const handleCreateRating: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: "Only vendors can create ratings" });
    }
    
    const ratingData: CreateRatingRequest = req.body;
    
    if (!ratingData.orderId || !ratingData.supplierId || !ratingData.rating) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    if (ratingData.rating < 1 || ratingData.rating > 5) {
      return res.status(400).json({ success: false, error: "Rating must be between 1 and 5" });
    }
    
    // Validate order exists and belongs to vendor
    const order = dataStore.getOrderById(ratingData.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    
    if (order.vendorId !== user.id) {
      return res.status(403).json({ success: false, error: "You can only rate your own orders" });
    }
    
    if (order.status !== "delivered") {
      return res.status(400).json({ success: false, error: "You can only rate delivered orders" });
    }
    
    // Validate supplier exists
    const supplier = dataStore.getUserById(ratingData.supplierId);
    if (!supplier || supplier.role !== 'supplier') {
      return res.status(404).json({ success: false, error: "Supplier not found" });
    }
    
    const rating = dataStore.createRating({
      vendorId: user.id,
      supplierId: ratingData.supplierId,
      orderId: ratingData.orderId,
      rating: ratingData.rating,
      comment: ratingData.comment
    });
    
    const response: ApiResponse<Rating> = {
      success: true,
      data: rating,
      message: "Rating created successfully"
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error("Create rating error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetRatingsBySupplierId: RequestHandler = (req, res) => {
  try {
    const { supplierId } = req.params;
    
    // Validate supplier exists
    const supplier = dataStore.getUserById(supplierId);
    if (!supplier || supplier.role !== 'supplier') {
      return res.status(404).json({ success: false, error: "Supplier not found" });
    }
    
    const ratings = dataStore.getRatingsBySupplierId(supplierId);
    
    // Add vendor info to ratings
    const ratingsWithVendor = ratings.map(rating => {
      const vendor = dataStore.getUserById(rating.vendorId);
      return {
        ...rating,
        vendor
      };
    });
    
    const response: ApiResponse<Rating[]> = {
      success: true,
      data: ratingsWithVendor
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetRatingsByVendorId: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: "Only vendors can access this endpoint" });
    }
    
    const ratings = dataStore.getRatingsByVendorId(user.id);
    
    // Add supplier info to ratings
    const ratingsWithSupplier = ratings.map(rating => {
      const supplier = dataStore.getUserById(rating.supplierId);
      return {
        ...rating,
        supplier
      };
    });
    
    const response: ApiResponse<Rating[]> = {
      success: true,
      data: ratingsWithSupplier
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get vendor ratings error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
