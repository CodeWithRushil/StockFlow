import React from 'react';
import { NavLink } from 'react-router-dom';
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
        <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={onToggle} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-60 flex flex-col lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
      )}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-sidebar-primary" />
            <span className="text-base font-bold text-sidebar-primary-foreground">StockFlow</span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {lowStockCount > 0 && (
          <div className="mx-3 mt-3 p-2 rounded border flex items-center gap-2 text-xs"
            style={{ backgroundColor: 'hsl(40 85% 48% / 0.12)', color: 'hsl(40 85% 48%)', borderColor: 'hsl(40 85% 48% / 0.25)' }}>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{lowStockCount} low stock</span>
          </div>
        )}

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.filter(item => hasRole(item.roles as any)).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => window.innerWidth < 1024 && onToggle()}
              className={({ isActive }) => cn(
                "flex items-center gap-2.5 px-3 py-2 rounded text-sm",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div>
              <p className="text-sm font-medium text-sidebar-primary-foreground">{user?.name}</p>
              <p className="text-xs capitalize text-sidebar-foreground">{user?.role}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded hover:bg-sidebar-accent text-sidebar-foreground"
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
        <header className="h-14 flex items-center px-4 border-b bg-card">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-5 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
