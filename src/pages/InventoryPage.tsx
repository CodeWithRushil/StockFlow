import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Product } from '@/types';

const emptyProduct = { name: '', sku: '', category: '', price: 0, quantity: 0, threshold: 10, supplierId: '' };

const InventoryPage: React.FC = () => {
  const { products, suppliers, addProduct, updateProduct, deleteProduct } = useInventory();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  const filtered = useMemo(() => products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSup = supplierFilter === 'all' || p.supplierId === supplierFilter;
    return matchesSearch && matchesCat && matchesSup;
  }), [products, search, categoryFilter, supplierFilter]);

  const openAdd = () => { setEditing(null); setForm(emptyProduct); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, quantity: p.quantity, threshold: p.threshold, supplierId: p.supplierId }); setDialogOpen(true); };

  const handleSave = () => {
    const supplier = suppliers.find(s => s._id === form.supplierId);
    if (editing) {
      updateProduct(editing._id, { ...form, supplierName: supplier?.companyName });
    } else {
      addProduct({ ...form, supplierName: supplier?.companyName } as any);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Inventory</h1>
          <p className="text-xs text-muted-foreground">{products.length} products total</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-3 pb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8 h-9" placeholder="Search name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Supplier" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map(s => <SelectItem key={s._id} value={s._id}>{s.companyName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Stock</th>
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Supplier</th>
                  <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-medium text-foreground">{p.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{p.category}</td>
                    <td className="py-2.5 px-3 text-right text-foreground">${p.price.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right">
                      {p.quantity < p.threshold
                        ? <span className="low-stock-badge">{p.quantity}</span>
                        : <span className="text-foreground">{p.quantity}</span>}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{p.supplierName}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteProduct(p._id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">
                    <Package className="h-6 w-6 mx-auto mb-1 opacity-30" />No products found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label>Price</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></div>
              <div className="space-y-1"><Label>Qty</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} /></div>
              <div className="space-y-1"><Label>Threshold</Label><Input type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: +e.target.value })} /></div>
            </div>
            <div className="space-y-1">
              <Label>Supplier</Label>
              <Select value={form.supplierId} onValueChange={v => setForm({ ...form, supplierId: v })}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>{suppliers.map(s => <SelectItem key={s._id} value={s._id}>{s.companyName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
              <Button size="sm" onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
