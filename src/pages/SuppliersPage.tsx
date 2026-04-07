import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Supplier } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const emptySupplier = { companyName: '', contactPerson: '', email: '', phone: '' };

const SuppliersPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { suppliers, products, addSupplier, updateSupplier, deleteSupplier } = useInventory();
  const canEdit = hasRole(['admin', 'manager']);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptySupplier);
  const [search, setSearch] = useState('');

  const filtered = suppliers.filter(s =>
    s.companyName.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(emptySupplier); setDialogOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm({ companyName: s.companyName, contactPerson: s.contactPerson, email: s.email, phone: s.phone }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.email.trim()) {
      toast.error('Company name and email are required');
      return;
    }
    try {
      if (editing) await updateSupplier(editing._id, form);
      else await addSupplier(form);
      setDialogOpen(false);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(ax.response?.data?.message || ax.message || 'Could not save supplier');
    }
  };

  const getProductCount = (supplierId: string) => products.filter(p => p.supplierId === supplierId).length;

  const handleDelete = async (id: string) => {
    try {
      await deleteSupplier(id);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(ax.response?.data?.message || ax.message || 'Could not delete supplier');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Suppliers</h1>
          <p className="text-xs text-muted-foreground">{suppliers.length} suppliers</p>
        </div>
        {canEdit && <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Supplier</Button>}
      </div>

      <Card>
        <CardContent className="pt-3 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-9" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(s => (
          <Card key={s._id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(s._id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-foreground text-sm">{s.companyName}</h3>
              <p className="text-xs text-muted-foreground">{s.contactPerson}</p>
              <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                <p>{s.email}</p>
                <p>{s.phone}</p>
              </div>
              <div className="mt-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground">{getProductCount(s._id)} products</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground text-sm">No suppliers found</div>
        )}
      </div>

      <Dialog open={dialogOpen && canEdit} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Company Name</Label><Input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} /></div>
            <div className="space-y-1"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
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

export default SuppliersPage;
