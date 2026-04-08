import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { SaleItem, Sale } from '@/types';
import { ShoppingCart, Search, Plus, Trash2, Printer, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const SalesPage: React.FC = () => {
  const { products, sales, createSale, deleteSale } = useInventory();
  const { hasRole } = useAuth();
  const canDeleteSale = hasRole(['admin']);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [search, setSearch] = useState('');

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

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
        productId: product._id, productName: product.name,
        quantity, unitPrice: product.price, total: product.price * quantity,
      }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (idx: number) => setCart(cart.filter((_, i) => i !== idx));
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    for (const item of cart) {
      const prod = products.find(p => p._id === item.productId);
      if (!prod || prod.quantity < item.quantity) return;
    }
    try {
      const completedSale = await createSale(cart);
      setCart([]);
      setDialogOpen(false);
      setViewingSale(completedSale as Sale);
      setBillDialogOpen(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to create sale');
    }
  };

  const handleViewBill = (sale: Sale) => { setViewingSale(sale); setBillDialogOpen(true); };

  const handleDeleteSale = async (id: string) => {
    try {
      await deleteSale(id);
      if (viewingSale?._id === id) setBillDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to delete sale');
    }
  };

  const handlePrint = () => {
    if (!viewingSale) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const printFavicon =
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="hsl(221 83% 53%)"/><path d="M9 11.5 16 8l7 3.5V21a1.5 1.5 0 0 1-.83 1.34L16 25l-6.17-2.66A1.5 1.5 0 0 1 9 21V11.5Z" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 11.5 16 15l7-3.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M16 15V25" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>'
      );

    const rows = (viewingSale.items || [])
      .map(
        (item) => `
        <tr>
          <td>${item.productName}</td>
          <td class="right">${item.quantity}</td>
          <td class="right">Rs ${item.unitPrice.toFixed(2)}</td>
          <td class="right">Rs ${item.total.toFixed(2)}</td>
        </tr>`
      )
      .join('');

    printWindow.document.write(`
      <html><head>
      <base href="${window.location.origin}/" />
      <link rel="icon" href="${printFavicon}" type="image/svg+xml" />
      <title>Bill - ${viewingSale.saleId}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 340px; margin: 0 auto; padding: 16px; font-size: 12px; color: #111; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 4px 2px; }
        th { border-bottom: 1px dashed #000; font-weight: 600; }
        td { border-bottom: 1px dashed #ddd; }
        .right { text-align: right; }
        .muted { color: #555; font-size: 11px; }
        .total { font-size: 16px; font-weight: 700; }
        hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
      </style></head><body>
        <div style="text-align:center">
          <div style="font-size:16px;font-weight:700">StockFlow</div>
          <div class="muted">Inventory Management System</div>
        </div>
        <hr />
        <div class="muted" style="display:flex;justify-content:space-between">
          <span>ID: <b>${viewingSale.saleId}</b></span>
          <span>${new Date(viewingSale.createdAt).toLocaleString()}</span>
        </div>
        <hr />
        <table>
          <thead>
            <tr>
              <th>Item</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amt</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <hr />
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="muted">Total</span>
          <span class="total">Rs ${viewingSale.totalAmount.toFixed(2)}</span>
        </div>
        <div class="muted" style="margin-top:6px">Cashier: ${viewingSale.soldByName || '-'}</div>
        <hr />
        <div class="muted" style="text-align:center">Thank you!</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const product = products.find(p => p._id === selectedProduct);
  const availableStock = product ? product.quantity - (cart.find(i => i.productId === product._id)?.quantity || 0) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Sales</h1>
          <p className="text-xs text-muted-foreground">{sales.length} transactions</p>
        </div>
        <Button size="sm" onClick={() => { setCart([]); setDialogOpen(true); }}>
          <ShoppingCart className="h-4 w-4 mr-1" /> New Sale
        </Button>
      </div>

      <Card>
        <CardContent className="pt-3 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-9" placeholder="Search sales..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Sale ID</th>
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Items</th>
                  <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Sold By</th>
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-center py-2.5 px-3 font-medium text-muted-foreground">Bill</th>
                  {canDeleteSale && <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-mono text-xs text-primary">{s.saleId || '—'}</td>
                    <td className="py-2.5 px-3 text-foreground">
                      {s.items?.map(i => `${i.productName} ×${i.quantity}`).join(', ') || s.productName}
                    </td>
                    <td className="py-2.5 px-3 text-right text-foreground font-medium">₹{s.totalAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{s.soldByName}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" onClick={() => handleViewBill(s)}>
                        <Receipt className="h-4 w-4" />
                      </button>
                    </td>
                    {canDeleteSale && (
                      <td className="py-2.5 px-3 text-right">
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void handleDeleteSale(s._id)}>
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={canDeleteSale ? 7 : 6} className="py-10 text-center text-muted-foreground">No sales found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Sale Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Sale</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.name} (Stock: {p.quantity})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-16 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input className="h-9" type="number" min={1} max={availableStock} value={quantity}
                  onChange={e => setQuantity(Math.max(1, +e.target.value))} />
              </div>
              <Button size="icon" className="shrink-0 h-9 w-9" onClick={addToCart}
                disabled={!selectedProduct || quantity < 1 || availableStock < quantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {product && (
              <p className="text-xs text-muted-foreground">
                Price: ₹{product.price.toFixed(2)} · Available: {availableStock}
              </p>
            )}

            {cart.length > 0 && (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b">
                      <th className="text-left py-1.5 px-2 font-medium text-muted-foreground text-xs">Item</th>
                      <th className="text-right py-1.5 px-2 font-medium text-muted-foreground text-xs">Qty</th>
                      <th className="text-right py-1.5 px-2 font-medium text-muted-foreground text-xs">Price</th>
                      <th className="text-right py-1.5 px-2 font-medium text-muted-foreground text-xs">Total</th>
                      <th className="w-7"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-1.5 px-2 text-foreground">{item.productName}</td>
                        <td className="py-1.5 px-2 text-right text-foreground">{item.quantity}</td>
                        <td className="py-1.5 px-2 text-right text-muted-foreground">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-right font-medium text-foreground">₹{item.total.toFixed(2)}</td>
                        <td className="py-1.5 px-1">
                          <button onClick={() => removeFromCart(idx)} className="text-destructive p-0.5">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {cart.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <span className="text-muted-foreground">{cart.length} item(s)</span>
                <span className="font-bold text-foreground">₹{cartTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
              <Button size="sm" onClick={handleCompleteSale} disabled={cart.length === 0}>
                Complete Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bill Dialog */}
      <Dialog open={billDialogOpen} onOpenChange={setBillDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-1.5">
              <Receipt className="h-4 w-4" /> Receipt
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <div className="text-center">
              <p className="font-bold text-foreground">StockFlow</p>
              <p className="text-xs text-muted-foreground">Inventory Management System</p>
            </div>
            <Separator />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>ID: <span className="font-mono text-foreground">{viewingSale?.saleId}</span></span>
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
                    <td className="py-1 text-foreground">{item.productName}</td>
                    <td className="py-1 text-right text-foreground">{item.quantity}</td>
                    <td className="py-1 text-right text-muted-foreground">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="py-1 text-right font-medium text-foreground">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">₹{viewingSale?.totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Cashier: {viewingSale?.soldByName}</p>
            <Separator />
            <p className="text-center text-xs text-muted-foreground">Thank you!</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setBillDialogOpen(false)}>
              Close
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-1" /> Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPage;
