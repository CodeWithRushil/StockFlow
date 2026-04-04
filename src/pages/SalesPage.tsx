import React, { useState, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { SaleItem, Sale } from '@/types';
import { ShoppingCart, Search, Plus, Trash2, Printer, Receipt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const SalesPage: React.FC = () => {
  const { products, sales, createSale } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [search, setSearch] = useState('');

  // Cart state
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const billRef = useRef<HTMLDivElement>(null);

  const filtered = sales.filter(s =>
    s.saleId?.toLowerCase().includes(search.toLowerCase()) ||
    s.items?.some(i => i.productName.toLowerCase().includes(search.toLowerCase())) ||
    s.soldByName?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = () => {
    const product = products.find(p => p._id === selectedProduct);
    if (!product || quantity < 1) return;

    const existingIdx = cart.findIndex(i => i.productId === selectedProduct);
    if (existingIdx >= 0) {
      const updated = [...cart];
      updated[existingIdx].quantity += quantity;
      updated[existingIdx].total = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setCart(updated);
    } else {
      setCart([...cart, {
        productId: product._id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total: product.price * quantity,
      }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (idx: number) => setCart(cart.filter((_, i) => i !== idx));

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    // Validate stock
    for (const item of cart) {
      const prod = products.find(p => p._id === item.productId);
      if (!prod || prod.quantity < item.quantity) {
        return;
      }
    }
    const saleId = createSale(cart);
    const completedSale = sales.find(s => s.saleId === saleId) ||
      { _id: '', saleId, items: cart, totalAmount: cartTotal, soldBy: 'u1', soldByName: 'John Admin', createdAt: new Date().toISOString() };
    setCart([]);
    setDialogOpen(false);
    setViewingSale(completedSale as Sale);
    setBillDialogOpen(true);
  };

  const handleViewBill = (sale: Sale) => {
    setViewingSale(sale);
    setBillDialogOpen(true);
  };

  const handlePrint = () => {
    if (!billRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Bill - ${viewingSale?.saleId}</title>
      <style>
        body { font-family: 'Courier New', monospace; max-width: 320px; margin: 0 auto; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 4px 2px; font-size: 12px; }
        th { border-bottom: 1px dashed #000; }
        .right { text-align: right; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        hr { border: none; border-top: 1px dashed #000; }
      </style></head><body>${billRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const product = products.find(p => p._id === selectedProduct);
  const availableStock = product
    ? product.quantity - (cart.find(i => i.productId === product._id)?.quantity || 0)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">{sales.length} transactions</p>
        </div>
        <Button onClick={() => { setCart([]); setDialogOpen(true); }}>
          <ShoppingCart className="h-4 w-4 mr-2" /> New Sale
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by sale ID, product, or seller..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sale ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sold By</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Bill</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-medium text-primary">{s.saleId || '—'}</td>
                    <td className="py-3 px-4 text-foreground">
                      {s.items?.map(i => `${i.productName} ×${i.quantity}`).join(', ') || s.productName}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground font-medium">${s.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.soldByName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewBill(s)}>
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No sales found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Sale Dialog - Multi-Item Cart */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Sale</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Add item row */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label>Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name} (Stock: {p.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20 space-y-1.5">
                <Label>Qty</Label>
                <Input type="number" min={1} max={availableStock} value={quantity}
                  onChange={e => setQuantity(Math.max(1, +e.target.value))} />
              </div>
              <Button size="icon" className="shrink-0" onClick={addToCart}
                disabled={!selectedProduct || quantity < 1 || availableStock < quantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {product && (
              <p className="text-xs text-muted-foreground">
                Unit: ${product.price.toFixed(2)} · Available: {availableStock}
              </p>
            )}

            {/* Cart items */}
            {cart.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Item</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Qty</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 px-3 text-foreground">{item.productName}</td>
                        <td className="py-2 px-3 text-right text-foreground">{item.quantity}</td>
                        <td className="py-2 px-3 text-right text-muted-foreground">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-medium text-foreground">${item.total.toFixed(2)}</td>
                        <td className="py-2 px-1">
                          <button onClick={() => removeFromCart(idx)} className="text-destructive hover:text-destructive/80 p-1">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {cart.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">{cart.length} item(s)</span>
                <span className="text-lg font-bold text-foreground">${cartTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleCompleteSale} disabled={cart.length === 0}>
                Complete Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bill/Receipt Dialog */}
      <Dialog open={billDialogOpen} onOpenChange={setBillDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Bill / Receipt
            </DialogTitle>
          </DialogHeader>

          <div ref={billRef} className="space-y-3">
            <div className="text-center">
              <p className="font-bold text-lg text-foreground">StockFlow</p>
              <p className="text-xs text-muted-foreground">Inventory Management System</p>
            </div>
            <Separator />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sale ID: <span className="font-mono font-medium text-foreground">{viewingSale?.saleId}</span></span>
              <span>{viewingSale ? new Date(viewingSale.createdAt).toLocaleString() : ''}</span>
            </div>
            <Separator />
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 font-medium text-muted-foreground">Item</th>
                  <th className="text-right py-1 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right py-1 font-medium text-muted-foreground">Rate</th>
                  <th className="text-right py-1 font-medium text-muted-foreground">Amt</th>
                </tr>
              </thead>
              <tbody>
                {viewingSale?.items?.map((item, i) => (
                  <tr key={i} className="border-b border-dashed last:border-0">
                    <td className="py-1.5 text-foreground">{item.productName}</td>
                    <td className="py-1.5 text-right text-foreground">{item.quantity}</td>
                    <td className="py-1.5 text-right text-muted-foreground">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-1.5 text-right font-medium text-foreground">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">${viewingSale?.totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Cashier: {viewingSale?.soldByName}</p>
            </div>
            <Separator />
            <p className="text-center text-xs text-muted-foreground">Thank you for your purchase!</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setBillDialogOpen(false)}>
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPage;
