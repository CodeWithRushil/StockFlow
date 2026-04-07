import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, Sale, SaleItem, Supplier, PurchaseOrder, POStatus } from '@/types';
import { toast } from 'sonner';
import { api } from '@/lib/api';

type ProductInput = Pick<Product, 'name' | 'sku' | 'category' | 'price' | 'quantity' | 'threshold' | 'supplierId'>;

interface InventoryContextType {
  products: Product[];
  sales: Sale[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  refreshInventory: () => Promise<void>;
  addProduct: (p: ProductInput) => Promise<void>;
  updateProduct: (id: string, p: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createSale: (items: SaleItem[]) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
  addSupplier: (s: Omit<Supplier, '_id' | 'createdAt'>) => Promise<void>;
  updateSupplier: (id: string, s: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  createPurchaseOrder: (po: Omit<PurchaseOrder, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePOStatus: (id: string, status: POStatus) => Promise<void>;
  getLowStockProducts: () => Product[];
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshInventory = useCallback(async () => {
    const raw = localStorage.getItem('ims_user');
    if (!raw) {
      setProducts([]);
      setSales([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [productsRes, suppliersRes, salesRes, poRes] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Supplier[]>('/suppliers'),
        api.get<Sale[]>('/sales'),
        api.get<PurchaseOrder[]>('/purchase-orders'),
      ]);
      setProducts(productsRes.data);
      setSuppliers(suppliersRes.data);
      setSales(salesRes.data);
      setPurchaseOrders(poRes.data);
    } catch {
      toast.error('Failed to load inventory from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshInventory();
  }, [refreshInventory]);

  const addProduct = useCallback(async (p: ProductInput) => {
    const { data } = await api.post<Product>('/products', p);
    setProducts((prev) => [data, ...prev]);
    toast.success('Product added successfully');
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<ProductInput>) => {
    const { data: updated } = await api.put<Product>(`/products/${id}`, data);
    setProducts((prev) => prev.map((x) => (x._id === id ? updated : x)));
    toast.success('Product updated');
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
    toast.success('Product deleted');
  }, []);

  const createSale = useCallback(async (items: SaleItem[]) => {
    const payload = {
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    };

    const { data } = await api.post<Sale>('/sales', payload);
    setSales((prev) => [data, ...prev]);

    try {
      const productsRes = await api.get<Product[]>('/products');
      setProducts(productsRes.data);
    } catch {
      // ignore
    }

    toast.success(`Sale ${data.saleId} recorded (${items.length} items)`);
    return data;
  }, []);

  const deleteSale = useCallback(async (id: string) => {
    await api.delete(`/sales/${id}`);
    setSales((prev) => prev.filter((s) => s._id !== id));
    try {
      const productsRes = await api.get<Product[]>('/products');
      setProducts(productsRes.data);
    } catch {
      // ignore
    }
    toast.success('Sale deleted and stock restored');
  }, []);

  const addSupplier = useCallback(async (s: Omit<Supplier, '_id' | 'createdAt'>) => {
    const { data } = await api.post<Supplier>('/suppliers', s);
    setSuppliers((prev) => [data, ...prev]);
    toast.success('Supplier added');
  }, []);

  const updateSupplier = useCallback(async (id: string, data: Partial<Supplier>) => {
    const { data: updated } = await api.put<Supplier>(`/suppliers/${id}`, data);
    setSuppliers((prev) => prev.map((x) => (x._id === id ? updated : x)));
    toast.success('Supplier updated');
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    await api.delete(`/suppliers/${id}`);
    setSuppliers((prev) => prev.filter((s) => s._id !== id));
    toast.success('Supplier deleted');
  }, []);

  const createPurchaseOrder = useCallback(async (po: Omit<PurchaseOrder, '_id' | 'createdAt' | 'updatedAt'>) => {
    const body = {
      supplierId: po.supplierId,
      status: po.status,
      items: po.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    };
    const { data } = await api.post<PurchaseOrder>('/purchase-orders', body);
    setPurchaseOrders((prev) => [data, ...prev]);
    toast.success('Purchase order created');
  }, []);

  const updatePOStatus = useCallback(async (id: string, status: POStatus) => {
    const { data: updated } = await api.put<PurchaseOrder>(`/purchase-orders/${id}`, { status });
    setPurchaseOrders((prev) => prev.map((x) => (x._id === id ? updated : x)));
    if (status === 'Received') {
      try {
        const productsRes = await api.get<Product[]>('/products');
        setProducts(productsRes.data);
        toast.success('Stock updated from received PO');
      } catch {
        // ignore
      }
    } else {
      toast.success(
        status === 'Sent' ? 'Purchase order sent' : status === 'Cancelled' ? 'Purchase order cancelled' : 'Order updated'
      );
    }
  }, []);

  const getLowStockProducts = useCallback(() => {
    return products.filter((p) => !p.deletedAt && p.quantity < p.threshold);
  }, [products]);

  return (
    <InventoryContext.Provider
      value={{
        products: products.filter((p) => !p.deletedAt),
        sales,
        suppliers,
        purchaseOrders,
        loading,
        refreshInventory,
        addProduct,
        updateProduct,
        deleteProduct,
        createSale,
        deleteSale,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        createPurchaseOrder,
        updatePOStatus,
        getLowStockProducts,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
};
