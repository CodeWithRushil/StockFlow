import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, Sale, Supplier, PurchaseOrder, POStatus } from '@/types';
import { mockProducts, mockSales, mockSuppliers, mockPurchaseOrders } from '@/data/mockData';
import { toast } from 'sonner';

interface InventoryContextType {
  products: Product[];
  sales: Sale[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  addProduct: (p: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  createSale: (productId: string, quantity: number) => void;
  addSupplier: (s: Omit<Supplier, '_id' | 'createdAt'>) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, '_id' | 'createdAt' | 'updatedAt'>) => void;
  updatePOStatus: (id: string, status: POStatus) => void;
  getLowStockProducts: () => Product[];
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);

  const addProduct = useCallback((p: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => {
    const newProduct: Product = {
      ...p,
      _id: `p${Date.now()}`,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    toast.success('Product added successfully');
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p._id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
    toast.success('Product updated');
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.map(p => p._id === id ? { ...p, deletedAt: new Date().toISOString() } : p));
    toast.success('Product deleted');
  }, []);

  const createSale = useCallback((productId: string, quantity: number) => {
    const product = products.find(p => p._id === productId);
    if (!product) return toast.error('Product not found');
    if (product.quantity < quantity) return toast.error('Insufficient stock');

    const sale: Sale = {
      _id: `sl${Date.now()}`,
      productId,
      productName: product.name,
      quantitySold: quantity,
      totalAmount: product.price * quantity,
      soldBy: 'u1',
      soldByName: 'John Admin',
      createdAt: new Date().toISOString(),
    };
    setSales(prev => [sale, ...prev]);
    setProducts(prev => prev.map(p => p._id === productId ? { ...p, quantity: p.quantity - quantity, updatedAt: new Date().toISOString() } : p));
    toast.success(`Sale recorded: ${quantity}x ${product.name}`);
  }, [products]);

  const addSupplier = useCallback((s: Omit<Supplier, '_id' | 'createdAt'>) => {
    setSuppliers(prev => [...prev, { ...s, _id: `s${Date.now()}`, createdAt: new Date().toISOString() }]);
    toast.success('Supplier added');
  }, []);

  const updateSupplier = useCallback((id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s._id === id ? { ...s, ...data } : s));
    toast.success('Supplier updated');
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(s => s._id !== id));
    toast.success('Supplier deleted');
  }, []);

  const createPurchaseOrder = useCallback((po: Omit<PurchaseOrder, '_id' | 'createdAt' | 'updatedAt'>) => {
    const newPO: PurchaseOrder = { ...po, _id: `po${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setPurchaseOrders(prev => [...prev, newPO]);
    toast.success('Purchase order created');
  }, []);

  const updatePOStatus = useCallback((id: string, status: POStatus) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po._id !== id) return po;
      if (status === 'Received') {
        // Increment stock
        po.items.forEach(item => {
          setProducts(prods => prods.map(p => p._id === item.productId ? { ...p, quantity: p.quantity + item.quantity } : p));
        });
        toast.success('Stock updated from received PO');
      }
      return { ...po, status, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => !p.deletedAt && p.quantity < p.threshold);
  }, [products]);

  return (
    <InventoryContext.Provider value={{
      products: products.filter(p => !p.deletedAt),
      sales, suppliers, purchaseOrders,
      addProduct, updateProduct, deleteProduct,
      createSale, addSupplier, updateSupplier, deleteSupplier,
      createPurchaseOrder, updatePOStatus, getLowStockProducts,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
};
