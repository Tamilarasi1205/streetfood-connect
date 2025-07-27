import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleRegister, handleProfile, authenticateToken } from "./routes/auth";
import {
  handleGetProducts,
  handleGetProduct,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleGetSupplierProducts
} from "./routes/products";
import {
  handleCreateOrder,
  handleGetOrders,
  handleGetOrder,
  handleUpdateOrderStatus
} from "./routes/orders";
import {
  handleCreateRating,
  handleGetRatingsBySupplierId,
  handleGetRatingsByVendorId
} from "./routes/ratings";
import {
  handleCreateGroupOrder,
  handleGetGroupOrders,
  handleGetGroupOrder,
  handleJoinGroupOrder,
  handleGetVendorGroupOrders
} from "./routes/groupOrders";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/register", handleRegister);
  app.get("/api/auth/profile", authenticateToken, handleProfile);

  // Product routes
  app.get("/api/products", handleGetProducts);
  app.get("/api/products/:id", handleGetProduct);
  app.post("/api/products", authenticateToken, handleCreateProduct);
  app.put("/api/products/:id", authenticateToken, handleUpdateProduct);
  app.delete("/api/products/:id", authenticateToken, handleDeleteProduct);
  app.get("/api/supplier/products", authenticateToken, handleGetSupplierProducts);

  // Order routes
  app.post("/api/orders", authenticateToken, handleCreateOrder);
  app.get("/api/orders", authenticateToken, handleGetOrders);
  app.get("/api/orders/:id", authenticateToken, handleGetOrder);
  app.put("/api/orders/:id/status", authenticateToken, handleUpdateOrderStatus);

  // Rating routes
  app.post("/api/ratings", authenticateToken, handleCreateRating);
  app.get("/api/ratings/supplier/:supplierId", handleGetRatingsBySupplierId);
  app.get("/api/ratings/vendor", authenticateToken, handleGetRatingsByVendorId);

  // Group order routes
  app.post("/api/group-orders", authenticateToken, handleCreateGroupOrder);
  app.get("/api/group-orders", handleGetGroupOrders);
  app.get("/api/group-orders/:id", handleGetGroupOrder);
  app.post("/api/group-orders/:id/join", authenticateToken, handleJoinGroupOrder);
  app.get("/api/vendor/group-orders", authenticateToken, handleGetVendorGroupOrders);

  return app;
}
