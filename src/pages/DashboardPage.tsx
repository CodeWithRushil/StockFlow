import React, { useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { IndianRupee, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { cn } from '@/lib/utils';

const DashboardPage: React.FC = () => {
  const { products, sales, getLowStockProducts, loading } = useInventory();
  const lowStock = getLowStockProducts();

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalSalesCount = sales.reduce(
    (sum, s) => sum + (s.items?.reduce((t, i) => t + i.quantity, 0) || s.quantitySold || 0),
    0
  );

  const salesTrend = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const s of sales) {
      const key = new Date(s.createdAt).toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) || 0) + s.totalAmount);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([iso, revenue]) => ({
        date: new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue,
      }));
  }, [sales]);

  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of sales) {
      for (const item of s.items || []) {
        counts.set(item.productName, (counts.get(item.productName) || 0) + item.quantity);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, sold]) => ({ name, sold }));
  }, [sales]);

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, bg: 'bg-primary/10', color: 'text-primary' },
    { label: 'Total Sales', value: totalSalesCount, icon: ShoppingCart, bg: 'bg-success/10', color: 'text-success' },
    { label: 'Revenue', value: `₹${totalRevenue.toFixed(2)}`, icon: IndianRupee, bg: 'bg-info/10', color: 'text-info' },
    { label: 'Low Stock', value: lowStock.length, icon: AlertTriangle, bg: 'bg-warning/10', color: 'text-warning' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        {loading && <span className="text-xs text-muted-foreground">Loading…</span>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={cn('h-9 w-9 rounded flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
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
            <CardTitle className="text-sm font-semibold">Sales trend (revenue by day)</CardTitle>
          </CardHeader>
          <CardContent>
            {salesTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No sales recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 82%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 40%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 40%)" />
                  <Tooltip
                    contentStyle={{ borderRadius: 4, border: '1px solid hsl(0,0%,82%)', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(220, 70%, 45%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Revenue (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top products (units sold)</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No sales data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 82%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 40%)" />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} stroke="hsl(0, 0%, 40%)" />
                  <Tooltip
                    contentStyle={{ borderRadius: 4, border: '1px solid hsl(0,0%,82%)', fontSize: 12 }}
                  />
                  <Bar dataKey="sold" fill="hsl(140, 50%, 38%)" radius={[0, 3, 3, 0]} name="Units sold" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Low stock alerts
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
                {lowStock.map((p) => (
                  <tr key={p._id} className="border-b last:border-0">
                    <td className="py-2 text-foreground">{p.name}</td>
                    <td className="py-2 text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="py-2 text-right">
                      <span className="low-stock-badge">{p.quantity}</span>
                    </td>
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

export default DashboardPage;
