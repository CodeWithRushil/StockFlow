import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
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
    { label: 'Total Products', value: products.length, icon: Package, color: 'hsl(217, 91%, 50%)' },
    { label: 'Total Sales', value: totalSalesCount, icon: ShoppingCart, color: 'hsl(160, 84%, 39%)' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'hsl(270, 70%, 55%)' },
    { label: 'Low Stock Items', value: lowStock.length, icon: AlertTriangle, color: 'hsl(38, 92%, 50%)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your inventory and sales</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mockSalesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(220,13%,91%)', fontSize: 13 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 50%)" strokeWidth={2} dot={{ r: 4 }} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockTopProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(220,13%,91%)', fontSize: 13 }} />
                <Bar dataKey="sold" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low stock table */}
      {lowStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                      <td className="py-2.5 font-medium text-foreground">{p.name}</td>
                      <td className="py-2.5 text-muted-foreground">{p.sku}</td>
                      <td className="py-2.5 text-right"><span className="low-stock-badge">{p.quantity}</span></td>
                      <td className="py-2.5 text-right text-muted-foreground">{p.threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
