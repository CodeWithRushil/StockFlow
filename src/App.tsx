import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import SalesPage from "@/pages/SalesPage";
import SuppliersPage from "@/pages/SuppliersPage";
import PurchaseOrdersPage from "@/pages/PurchaseOrdersPage";
import UsersPage from "@/pages/UsersPage";
import LoginPage from "@/pages/LoginPage";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";
import RoleGuard from "@/components/auth/RoleGuard";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <InventoryProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<RoleGuard allow={["admin", "manager", "staff"]}><DashboardPage /></RoleGuard>} />
          <Route path="/inventory" element={<RoleGuard allow={["admin", "manager", "staff"]}><InventoryPage /></RoleGuard>} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/suppliers" element={<RoleGuard allow={["admin", "manager", "staff"]}><SuppliersPage /></RoleGuard>} />
          <Route path="/purchase-orders" element={<RoleGuard allow={["admin", "manager", "staff"]}><PurchaseOrdersPage /></RoleGuard>} />
          <Route path="/users" element={<RoleGuard allow={["admin"]}><UsersPage /></RoleGuard>} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </InventoryProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
