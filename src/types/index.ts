export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  threshold: number;
  supplierId: string;
  supplierName?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  _id: string;
  saleId: string;
  items: SaleItem[];
  totalAmount: number;
  soldBy: string;
  soldByName?: string;
  createdAt: string;
  // Legacy single-item fields (for backward compat)
  productId?: string;
  productName?: string;
  quantitySold?: number;
}

export interface Supplier {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
}

export type POStatus = 'Draft' | 'Sent' | 'Received' | 'Cancelled';

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  _id: string;
  supplierId: string;
  supplierName?: string;
  items: PurchaseOrderItem[];
  status: POStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  lowStockCount: number;
}
