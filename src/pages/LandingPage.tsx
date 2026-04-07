import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Package,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Boxes,
    title: 'Live Inventory',
    text: 'Track stock, thresholds, suppliers, and purchase orders in one place.',
  },
  {
    icon: ShoppingCart,
    title: 'Fast Billing',
    text: 'Create sales quickly with automatic stock deduction and printable receipts.',
  },
  {
    icon: BarChart3,
    title: 'Business Insights',
    text: 'Monitor revenue, sales trends, and low-stock alerts in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    text: 'Control what Admin, Manager, and Staff can view or manage.',
  },
];

const stats = [
  { label: 'Inventory sync', value: 'Real-time' },
  { label: 'Access model', value: 'Role-based' },
  { label: 'Deployment', value: 'Cloud-ready' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur border-b bg-background/80">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold">StockFlow</span>
          </div>
          <Button asChild size="sm">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.18),transparent_35%),radial-gradient(circle_at_80%_0%,hsl(var(--primary)/0.14),transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground mb-5">
                Modern Inventory Management
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Manage inventory, sales, and suppliers in one flow
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
                StockFlow gives your team a clean workspace for daily operations with role-based access,
                live stock updates, and actionable analytics.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/login">
                    Login to Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">View Dashboard</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> JWT auth</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Role-based access</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> MongoDB backend</span>
              </div>
            </div>

            <Card className="border-primary/20 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Platform Overview</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-lg border p-3 bg-muted/30">
                      <p className="text-lg md:text-xl font-semibold">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-lg border p-4 bg-background">
                  <p className="text-sm font-medium">Built for Admin, Manager, and Staff</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Staff can create sales fast, Managers control operations, and Admin gets complete visibility.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((item) => (
            <Card key={item.title} className="border-muted hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <item.icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>StockFlow</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure and role-based
          </span>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
