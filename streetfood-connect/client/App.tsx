import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VendorDashboard from "./pages/VendorDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";
import GroupOrders from "./pages/GroupOrders";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/supplier-dashboard" element={<SupplierDashboard />} />

            {/* Feature routes */}
          <Route path="/group-orders" element={<GroupOrders />} />
            <Route path="/order-tracking" element={
              <Placeholder
                title="Order Tracking"
                description="Track your orders from supplier to your stall in real-time."
              />
            } />
            <Route path="/orders" element={
              <Placeholder
                title="Order Management"
                description="View and manage all incoming orders from vendors."
              />
            } />
            <Route path="/analytics" element={
              <Placeholder
                title="Analytics Dashboard"
                description="View insights about your sales, top products, and vendor ratings."
              />
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
