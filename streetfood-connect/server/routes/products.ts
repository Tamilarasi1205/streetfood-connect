import { RequestHandler } from "express";
import { dataStore } from "../data/store";
import { ProductRequest, ApiResponse, Product } from "@shared/api";

export const handleGetProducts: RequestHandler = (req, res) => {
  try {
    const { supplierId, category, location } = req.query;
    
    let products = dataStore.getAllProducts();
    
    // Filter by supplier
    if (supplierId) {
      products = products.filter(p => p.supplierId === supplierId);
    }
    
    // Filter by category
    if (category) {
      products = products.filter(p => 
        p.category.toLowerCase().includes((category as string).toLowerCase())
      );
    }
    
    // Add supplier info to products
    const productsWithSupplier = products.map(product => {
      const supplier = dataStore.getUserById(product.supplierId);
      return {
        ...product,
        supplier
      };
    });
    
    const response: ApiResponse<Product[]> = {
      success: true,
      data: productsWithSupplier
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const product = dataStore.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    // Add supplier info
    const supplier = dataStore.getUserById(product.supplierId);
    const productWithSupplier = {
      ...product,
      supplier
    };
    
    const response: ApiResponse<Product> = {
      success: true,
      data: productWithSupplier
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleCreateProduct: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'supplier') {
      return res.status(403).json({ success: false, error: "Only suppliers can create products" });
    }
    
    const productData: ProductRequest = req.body;
    
    if (!productData.name || !productData.category || !productData.unitPrice || !productData.unit || !productData.availableQuantity) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    const product = dataStore.createProduct({
      ...productData,
      supplierId: user.id
    });
    
    const response: ApiResponse<Product> = {
      success: true,
      data: product,
      message: "Product created successfully"
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleUpdateProduct: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const product = dataStore.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    if (product.supplierId !== user.id) {
      return res.status(403).json({ success: false, error: "You can only update your own products" });
    }
    
    const updates = req.body;
    const updatedProduct = dataStore.updateProduct(id, updates);
    
    const response: ApiResponse<Product> = {
      success: true,
      data: updatedProduct,
      message: "Product updated successfully"
    };
    
    res.json(response);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleDeleteProduct: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const product = dataStore.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    
    if (product.supplierId !== user.id) {
      return res.status(403).json({ success: false, error: "You can only delete your own products" });
    }
    
    dataStore.deleteProduct(id);
    
    const response: ApiResponse = {
      success: true,
      message: "Product deleted successfully"
    };
    
    res.json(response);
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetSupplierProducts: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'supplier') {
      return res.status(403).json({ success: false, error: "Only suppliers can access this endpoint" });
    }
    
    const products = dataStore.getProductsBySupplierId(user.id);
    
    const response: ApiResponse<Product[]> = {
      success: true,
      data: products
    };
    
    res.json(response);
  } catch (error) {
    console.error("Get supplier products error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
