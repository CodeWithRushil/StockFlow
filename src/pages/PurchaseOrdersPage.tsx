import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { POStatus, PurchaseOrderItem } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const statusStyles: Record<POStatus, string> = {
  Draft: 'status-draft',
  Sent: 'status-sent',
  Received: 'status-received',
  Cancelled: 'status-cancelled',
};

const PurchaseOrdersPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { purchaseOrders, suppliers, products, getLowStockProducts, createPurchaseOrder, updatePOStatus } = useInventory();
  const canEdit = hasRole(['admin', 'manager']);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  const lowStockProducts = getLowStockProducts();

  const openCreate = () => { setSelectedSupplier(''); setItems([]); setDialogOpen(true); };

  const autoFillLowStock = () => {
    if (!selectedSupplier) return;
    const supplierProducts = lowStockProducts.filter(p => p.supplierId === selectedSupplier);

    if (supplierProducts.length > 0) {
      setItems(supplierProducts.map(p => ({
        productId: p._id, productName: p.name,
        quantity: Math.max(1, p.threshold - p.quantity + 10),
        unitPrice: p.price * 0.7,
      })));
      return;
    }

    // Fallback: allow creating PO even when nothing is currently low-stock.
    const allSupplierProducts = products.filter((p) => p.supplierId === selectedSupplier);
    if (allSupplierProducts.length === 0) {
      toast.error('No products found for this supplier');
      return;
    }
    setItems(allSupplierProducts.map((p) => ({
      productId: p._id,
      productName: p.name,
      quantity: Math.max(1, p.threshold || 1),
      unitPrice: p.price * 0.7,
    })));
    toast.info('No low-stock items for this supplier, filled with supplier catalog');
  };

  const handleCreate = async () => {
    if (!selectedSupplier || items.length === 0) return;
    if (items.some((i) => !i.productId || i.quantity <= 0 || i.unitPrice <= 0)) {
      toast.error('Each item must have valid product, quantity, and unit price');
      return;
    }
    const supplier = suppliers.find(s => s._id === selectedSupplier);
    try {
      await createPurchaseOrder({
        supplierId: selectedSupplier,
        supplierName: supplier?.companyName,
        items,
        status: 'Draft',
        totalAmount: items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
      });
      setDialogOpen(false);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(ax.response?.data?.message || ax.message || 'Could not create purchase order');
    }
  };

  const setStatus = async (id: string, status: POStatus) => {
    try {
      await updatePOStatus(id, status);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(ax.response?.data?.message || ax.message || 'Could not update order');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-xs text-muted-foreground">{purchaseOrders.length} orders</p>
        </div>
        {canEdit && <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New PO</Button>}
      </div>

      <div className="space-y-3">
        {purchaseOrders.map(po => (
          <Card key={po._id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{po.supplierName}</h3>
                    <p className="text-xs text-muted-foreground">{po.items.length} items · ₹{po.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={statusStyles[po.status]}>{po.status}</span>
                  {canEdit && po.status === 'Draft' && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(po._id, 'Sent')}>Send</Button>
                  )}
                  {canEdit && po.status === 'Sent' && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(po._id, 'Received')}>Received</Button>
                  )}
                  {canEdit && (po.status === 'Draft' || po.status === 'Sent') && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setStatus(po._id, 'Cancelled')}>Cancel</Button>
                  )}
                </div>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1.5 font-medium text-muted-foreground text-xs">Product</th>
                      <th className="text-right py-1.5 font-medium text-muted-foreground text-xs">Qty</th>
                      <th className="text-right py-1.5 font-medium text-muted-foreground text-xs">Unit Price</th>
                      <th className="text-right py-1.5 font-medium text-muted-foreground text-xs">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.items.map((item, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-1.5 text-foreground">{item.productName}</td>
                        <td className="py-1.5 text-right text-foreground">{item.quantity}</td>
                        <td className="py-1.5 text-right text-muted-foreground">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="py-1.5 text-right text-foreground font-medium">₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Created: {new Date(po.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
        {purchaseOrders.length === 0 && (
          <div className="py-10 text-center text-muted-foreground text-sm">No purchase orders yet</div>
        )}
      </div>

      <Dialog open={dialogOpen && canEdit} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>{suppliers.map(s => <SelectItem key={s._id} value={s._id}>{s.companyName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {selectedSupplier && (
              <Button variant="outline" size="sm" onClick={autoFillLowStock}>
                Auto-fill low stock
              </Button>
            )}
            {items.length > 0 && (
              <div className="border rounded p-2 space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.productName}</span>
                    <div className="flex items-center gap-2">
                      <Input type="number" className="w-16 h-7 text-xs" value={item.quantity}
                        onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, quantity: +e.target.value } : it))} />
                      <span className="text-muted-foreground text-xs w-16 text-right">₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-1 border-t text-sm font-medium text-foreground text-right">
                  Total: ₹{items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(2)}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
              <Button size="sm" onClick={handleCreate} disabled={!selectedSupplier || items.length === 0}>Create PO</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrdersPage;
