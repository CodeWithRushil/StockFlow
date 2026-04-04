import { Product, Sale, Supplier, PurchaseOrder } from '@/types';

export const mockUser = {
  _id: 'u1',
  name: 'John Admin',
  email: 'admin@ims.com',
  role: 'admin' as const,
  token: 'mock-jwt-token',
};

export const mockSuppliers: Supplier[] = [
  { _id: 's1', companyName: 'TechParts Inc', contactPerson: 'Alice Johnson', email: 'alice@techparts.com', phone: '555-0101', createdAt: '2024-01-15' },
  { _id: 's2', companyName: 'Global Supply Co', contactPerson: 'Bob Williams', email: 'bob@globalsupply.com', phone: '555-0102', createdAt: '2024-02-10' },
  { _id: 's3', companyName: 'FastShip Ltd', contactPerson: 'Carol Davis', email: 'carol@fastship.com', phone: '555-0103', createdAt: '2024-03-05' },
];

export const mockProducts: Product[] = [
  { _id: 'p1', name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', price: 29.99, quantity: 150, threshold: 20, supplierId: 's1', supplierName: 'TechParts Inc', deletedAt: null, createdAt: '2024-01-20', updatedAt: '2024-03-15' },
  { _id: 'p2', name: 'USB-C Cable', sku: 'UC-002', category: 'Electronics', price: 12.99, quantity: 8, threshold: 30, supplierId: 's1', supplierName: 'TechParts Inc', deletedAt: null, createdAt: '2024-01-22', updatedAt: '2024-03-14' },
  { _id: 'p3', name: 'Notebook A5', sku: 'NB-003', category: 'Stationery', price: 4.99, quantity: 500, threshold: 50, supplierId: 's2', supplierName: 'Global Supply Co', deletedAt: null, createdAt: '2024-02-01', updatedAt: '2024-03-10' },
  { _id: 'p4', name: 'Ballpoint Pen Pack', sku: 'BP-004', category: 'Stationery', price: 6.49, quantity: 12, threshold: 40, supplierId: 's2', supplierName: 'Global Supply Co', deletedAt: null, createdAt: '2024-02-05', updatedAt: '2024-03-12' },
  { _id: 'p5', name: 'Monitor Stand', sku: 'MS-005', category: 'Accessories', price: 49.99, quantity: 75, threshold: 10, supplierId: 's3', supplierName: 'FastShip Ltd', deletedAt: null, createdAt: '2024-02-15', updatedAt: '2024-03-08' },
  { _id: 'p6', name: 'Desk Lamp LED', sku: 'DL-006', category: 'Accessories', price: 34.99, quantity: 5, threshold: 15, supplierId: 's3', supplierName: 'FastShip Ltd', deletedAt: null, createdAt: '2024-02-20', updatedAt: '2024-03-11' },
  { _id: 'p7', name: 'Mechanical Keyboard', sku: 'MK-007', category: 'Electronics', price: 89.99, quantity: 45, threshold: 10, supplierId: 's1', supplierName: 'TechParts Inc', deletedAt: null, createdAt: '2024-03-01', updatedAt: '2024-03-15' },
  { _id: 'p8', name: 'Webcam HD', sku: 'WC-008', category: 'Electronics', price: 59.99, quantity: 3, threshold: 10, supplierId: 's1', supplierName: 'TechParts Inc', deletedAt: null, createdAt: '2024-03-05', updatedAt: '2024-03-14' },
];

export const mockSales: Sale[] = [
  {
    _id: 'sl1', saleId: 'INV-00001',
    items: [{ productId: 'p1', productName: 'Wireless Mouse', quantity: 5, unitPrice: 29.99, total: 149.95 }],
    totalAmount: 149.95, soldBy: 'u1', soldByName: 'John Admin', createdAt: '2024-03-15T10:30:00Z',
  },
  {
    _id: 'sl2', saleId: 'INV-00002',
    items: [
      { productId: 'p3', productName: 'Notebook A5', quantity: 20, unitPrice: 4.99, total: 99.80 },
      { productId: 'p4', productName: 'Ballpoint Pen Pack', quantity: 5, unitPrice: 6.49, total: 32.45 },
    ],
    totalAmount: 132.25, soldBy: 'u1', soldByName: 'John Admin', createdAt: '2024-03-15T11:15:00Z',
  },
  {
    _id: 'sl3', saleId: 'INV-00003',
    items: [{ productId: 'p7', productName: 'Mechanical Keyboard', quantity: 2, unitPrice: 89.99, total: 179.98 }],
    totalAmount: 179.98, soldBy: 'u1', soldByName: 'John Admin', createdAt: '2024-03-14T09:00:00Z',
  },
  {
    _id: 'sl4', saleId: 'INV-00004',
    items: [{ productId: 'p5', productName: 'Monitor Stand', quantity: 3, unitPrice: 49.99, total: 149.97 }],
    totalAmount: 149.97, soldBy: 'u1', soldByName: 'John Admin', createdAt: '2024-03-14T14:30:00Z',
  },
  {
    _id: 'sl5', saleId: 'INV-00005',
    items: [{ productId: 'p2', productName: 'USB-C Cable', quantity: 10, unitPrice: 12.99, total: 129.90 }],
    totalAmount: 129.90, soldBy: 'u1', soldByName: 'John Admin', createdAt: '2024-03-13T16:00:00Z',
  },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { _id: 'po1', supplierId: 's1', supplierName: 'TechParts Inc', items: [{ productId: 'p2', productName: 'USB-C Cable', quantity: 50, unitPrice: 8.99 }, { productId: 'p8', productName: 'Webcam HD', quantity: 20, unitPrice: 42.99 }], status: 'Sent', totalAmount: 1309.30, createdAt: '2024-03-14', updatedAt: '2024-03-14' },
  { _id: 'po2', supplierId: 's2', supplierName: 'Global Supply Co', items: [{ productId: 'p4', productName: 'Ballpoint Pen Pack', quantity: 100, unitPrice: 3.99 }], status: 'Draft', totalAmount: 399.00, createdAt: '2024-03-15', updatedAt: '2024-03-15' },
  { _id: 'po3', supplierId: 's3', supplierName: 'FastShip Ltd', items: [{ productId: 'p6', productName: 'Desk Lamp LED', quantity: 30, unitPrice: 24.99 }], status: 'Received', totalAmount: 749.70, createdAt: '2024-03-10', updatedAt: '2024-03-13' },
];

export const mockSalesChartData = [
  { date: 'Mar 10', sales: 97.35, revenue: 97.35 },
  { date: 'Mar 11', sales: 139.96, revenue: 139.96 },
  { date: 'Mar 12', sales: 239.92, revenue: 239.92 },
  { date: 'Mar 13', sales: 129.90, revenue: 129.90 },
  { date: 'Mar 14', sales: 329.95, revenue: 329.95 },
  { date: 'Mar 15', sales: 249.75, revenue: 249.75 },
];

export const mockTopProducts = [
  { name: 'Notebook A5', sold: 20 },
  { name: 'Ballpoint Pen Pack', sold: 15 },
  { name: 'USB-C Cable', sold: 10 },
  { name: 'Wireless Mouse', sold: 13 },
  { name: 'Desk Lamp LED', sold: 4 },
];
