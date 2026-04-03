import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

const SalesPage: React.FC = () => {
  const { products, sales, createSale } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = sales.filter(s =>
    (s.productName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSale = () => {
    if (!selectedProduct || quantity < 1) return;
    createSale(selectedProduct, quantity);
    setDialogOpen(false);
    setSelectedProduct('');
    setQuantity(1);
  };

  const product = products.find(p => p._id === selectedProduct);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">{sales.length} transactions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><ShoppingCart className="h-4 w-4 mr-2" /> New Sale</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search sales..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sold By</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{s.productName}</td>
                    <td className="py-3 px-4 text-right text-foreground">{s.quantitySold}</td>
                    <td className="py-3 px-4 text-right text-foreground font-medium">${s.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.soldByName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No sales found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Sale</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p._id} value={p._id}>{p.name} (Stock: {p.quantity})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" min={1} max={product?.quantity || 999} value={quantity} onChange={e => setQuantity(+e.target.value)} />
            </div>
            {product && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="text-muted-foreground">Unit Price: <span className="text-foreground font-medium">${product.price.toFixed(2)}</span></p>
                <p className="text-muted-foreground">Total: <span className="text-foreground font-bold">${(product.price * quantity).toFixed(2)}</span></p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleSale}>Complete Sale</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPage;
