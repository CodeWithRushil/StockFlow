import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText,
  LogOut, Menu, X, AlertTriangle, Sun, Moon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  const lowStockCount = getLowStockProducts().length;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={onToggle} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 flex flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-bold text-sidebar-primary-foreground">StockFlow</span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Low stock alert */}
        {lowStockCount > 0 && (
          <div className="mx-3 mt-3 p-2.5 rounded-lg flex items-center gap-2 text-xs font-medium shrink-0"
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
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-sm font-medium text-sidebar-primary-foreground">{user?.name}</p>
              <p className="text-xs capitalize text-sidebar-foreground">{user?.role}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-md transition-colors text-sidebar-foreground hover:text-sidebar-primary-foreground"
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
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-4 border-b bg-card lg:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
