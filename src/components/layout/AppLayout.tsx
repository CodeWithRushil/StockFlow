import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText,
  LogOut, Menu, X, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'staff'] },
  { to: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'manager'] },
  { to: '/sales', label: 'Sales', icon: ShoppingCart, roles: ['admin', 'manager', 'staff'] },
  { to: '/suppliers', label: 'Suppliers', icon: Users, roles: ['admin', 'manager'] },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: FileText, roles: ['admin', 'manager'] },
];

export const AppSidebar: React.FC<{ open: boolean; onToggle: () => void }> = ({ open, onToggle }) => {
  const { user, logout, hasRole } = useAuth();
  const { getLowStockProducts } = useInventory();
  const location = useLocation();
  const lowStockCount = getLowStockProducts().length;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={onToggle} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
        open ? "translate-x-0" : "-translate-x-full",
      )} style={{ backgroundColor: 'hsl(220 20% 14%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b" style={{ borderColor: 'hsl(220 20% 22%)' }}>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" style={{ color: 'hsl(217 91% 50%)' }} />
            <span className="text-lg font-bold" style={{ color: 'hsl(0 0% 100%)' }}>StockFlow</span>
          </div>
          <button onClick={onToggle} className="lg:hidden" style={{ color: 'hsl(220 14% 80%)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Low stock alert */}
        {lowStockCount > 0 && (
          <div className="mx-3 mt-3 p-2.5 rounded-lg flex items-center gap-2 text-xs font-medium"
            style={{ backgroundColor: 'hsl(38 92% 50% / 0.15)', color: 'hsl(38 92% 50%)' }}>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{lowStockCount} items low on stock</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.filter(item => hasRole(item.roles as any)).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => window.innerWidth < 1024 && onToggle()}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "text-primary-foreground"
                  : "hover:text-primary-foreground/90"
              )}
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'hsl(217 91% 50%)' : undefined,
                color: isActive ? 'hsl(0 0% 100%)' : 'hsl(220 14% 80%)',
              })}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t" style={{ borderColor: 'hsl(220 20% 22%)' }}>
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-sm font-medium" style={{ color: 'hsl(0 0% 100%)' }}>{user?.name}</p>
              <p className="text-xs capitalize" style={{ color: 'hsl(220 14% 60%)' }}>{user?.role}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-md transition-colors" style={{ color: 'hsl(220 14% 60%)' }}
              title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-4 border-b bg-card lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto" />
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
