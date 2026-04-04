import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, Sale, SaleItem, Supplier, PurchaseOrder, POStatus } from '@/types';
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
  createSale: (items: SaleItem[]) => string;
  addSupplier: (s: Omit<Supplier, '_id' | 'createdAt'>) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, '_id' | 'createdAt' | 'updatedAt'>) => void;
  updatePOStatus: (id: string, status: POStatus) => void;
  getLowStockProducts: () => Product[];
  generateSaleId: () => string;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

let saleCounter = 100;

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);

  const generateSaleId = useCallback(() => {
    saleCounter++;
    return `INV-${String(saleCounter).padStart(5, '0')}`;
  }, []);

  const addProduct = useCallback((p: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => {
    const newProduct: Product = {
      ...p, _id: `p${Date.now()}`, deletedAt: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
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

  const createSale = useCallback((items: SaleItem[]) => {
    const saleId = generateSaleId();
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    const sale: Sale = {
      _id: `sl${Date.now()}`,
      saleId,
      items,
      totalAmount,
      soldBy: 'u1',
      soldByName: 'John Admin',
      createdAt: new Date().toISOString(),
    };

    setSales(prev => [sale, ...prev]);

    // Deduct stock for each item
    setProducts(prev => prev.map(p => {
      const saleItem = items.find(i => i.productId === p._id);
      if (!saleItem) return p;
      return { ...p, quantity: p.quantity - saleItem.quantity, updatedAt: new Date().toISOString() };
    }));

    toast.success(`Sale ${saleId} recorded (${items.length} items)`);
    return saleId;
  }, [generateSaleId]);

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
      createPurchaseOrder, updatePOStatus, getLowStockProducts, generateSaleId,
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
