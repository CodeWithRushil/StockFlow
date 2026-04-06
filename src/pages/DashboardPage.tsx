import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { IndianRupee, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { mockSalesChartData, mockTopProducts } from '@/data/mockData';

const DashboardPage: React.FC = () => {
  const { products, sales, getLowStockProducts } = useInventory();
  const lowStock = getLowStockProducts();

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalSalesCount = sales.reduce((sum, s) => sum + (s.items?.reduce((t, i) => t + i.quantity, 0) || s.quantitySold || 0), 0);

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, bg: 'bg-primary/10', color: 'text-primary' },
    { label: 'Total Sales', value: totalSalesCount, icon: ShoppingCart, bg: 'bg-success/10', color: 'text-success' },
    { label: 'Revenue', value: `₹${totalRevenue.toFixed(2)}`, icon: IndianRupee, bg: 'bg-info/10', color: 'text-info' },
    { label: 'Low Stock', value: lowStock.length, icon: AlertTriangle, bg: 'bg-warning/10', color: 'text-warning' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={cn("h-9 w-9 rounded flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mockSalesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 82%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 40%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 40%)" />
                <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid hsl(0,0%,82%)', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(220, 70%, 45%)" strokeWidth={2} dot={{ r: 3 }} name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockTopProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 82%)" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 40%)" />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 40%)" />
                <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid hsl(0,0%,82%)', fontSize: 12 }} />
                <Bar dataKey="sold" fill="hsl(140, 50%, 38%)" radius={[0, 3, 3, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Product</th>
                  <th className="text-left py-2 font-medium">SKU</th>
                  <th className="text-right py-2 font-medium">Stock</th>
                  <th className="text-right py-2 font-medium">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p._id} className="border-b last:border-0">
                    <td className="py-2 text-foreground">{p.name}</td>
                    <td className="py-2 text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="py-2 text-right"><span className="low-stock-badge">{p.quantity}</span></td>
                    <td className="py-2 text-right text-muted-foreground">{p.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// helper used inline
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default DashboardPage;
