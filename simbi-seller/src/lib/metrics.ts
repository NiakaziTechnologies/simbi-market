// @ts-nocheck

export type PeriodFilter = '7d' | '30d' | '90d' | 'year_to_date';

export interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: any[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
}

// Filter orders by time period
export function filterOrdersByPeriod(orders: Order[], period: PeriodFilter): Order[] {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year_to_date':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return orders.filter(order => new Date(order.date) >= startDate);
}

// Compute key performance indicators
export function computeKPIs(products: Product[], orders: Order[]) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const fulfillmentRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  const totalInventoryValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    fulfillmentRate,
    totalInventoryValue,
    completedOrders
  };
}

// Generate sales over time data
export function salesOverTime(orders: Order[], days: number = 30) {
  const data: Array<{ date: string; sales: number; orders: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayOrders = orders.filter(order =>
      order.date.startsWith(dateStr) && order.status === 'completed'
    );

    const sales = dayOrders.reduce((sum, order) => sum + order.total, 0);

    data.push({
      date: dateStr,
      sales,
      orders: dayOrders.length
    });
  }

  return data;
}

// Generate unfulfilled orders over time data
export function unfulfilledOrdersOverTime(orders: Order[], days: number = 30) {
  const data: Array<{ date: string; unfulfilled: number; count: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayOrders = orders.filter(order =>
      order.date.startsWith(dateStr) && ['pending', 'processing'].includes(order.status)
    );

    const unfulfilled = dayOrders.reduce((sum, order) => sum + order.total, 0);

    data.push({
      date: dateStr,
      unfulfilled,
      count: dayOrders.length
    });
  }

  return data;
}

// Compute ZIM score (seller performance score)
export function computeZimScore(products: Product[], orders: Order[]): number {
  // Simple scoring algorithm based on various metrics
  let score = 50; // Base score

  // Revenue factor
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  if (totalRevenue > 10000) score += 20;
  else if (totalRevenue > 5000) score += 10;

  // Order completion rate
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const completionRate = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;
  score += (completionRate / 10); // Add up to 10 points

  // Inventory health
  const lowStockProducts = products.filter(product => product.stock < 5).length;
  const lowStockPenalty = Math.min(lowStockProducts * 2, 10);
  score -= lowStockPenalty;

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Get low stock products
export function computeLowStockProducts(products: Product[]): Product[] {
  return products.filter(product => product.stock < 5);
}

// Alias for backward compatibility
export const getLowStockProducts = computeLowStockProducts;

// Mock notification function for compatibility
export function addNotification(notification: any) {
  console.log('Notification:', notification);
  // In a real app, this would integrate with a notification system
}

// Mock supplier document functions for compatibility
export function getSupplierDocuments() {
  return [];
}

export function getSupplierDocumentsBySupplier(supplierId: string) {
  return [];
}

export function saveSupplierDocument(document: any) {
  console.log('Saving supplier document:', document);
  return document;
}

export function deleteSupplierDocument(id: string) {
  console.log('Deleting supplier document:', id);
  return true;
}

export function getSupplierComplianceStatus(supplierId: string) {
  return {
    status: 'compliant',
    score: 95,
    isCompliant: true,
    missingDocuments: []
  };
}

export interface DocumentType {
  id: string;
  name: string;
  required: boolean;
}

export function getDocumentTypes(): DocumentType[] {
  return [
    { id: 'tax_certificate', name: 'Tax Certificate', required: true },
    { id: 'business_license', name: 'Business License', required: true },
    { id: 'bank_statement', name: 'Bank Statement', required: false },
    { id: 'id_document', name: 'ID Document', required: true },
    { id: 'other', name: 'Other', required: false }
  ];
}

// Updated SupplierDocument interface to match component usage
export interface SupplierDocument {
  id: string;
  supplierId: string;
  supplierName: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'pending_review';
  description?: string;
}

// Get uncompleted orders
export function getUncompletedOrders(orders: Order[]): Order[] {
  return orders.filter(order => ['pending', 'processing'].includes(order.status));
}

// Compute potential losses from uncompleted orders
export function computePotentialLosses(orders: Order[], products: Product[]) {
  const uncompletedOrders = getUncompletedOrders(orders);
  const totalLosses = uncompletedOrders.reduce((sum, order) => sum + order.total, 0);

  // Group losses by category (simplified)
  const lossesByCategory = [
    { category: 'Unfulfilled Orders', amount: totalLosses * 0.6, count: Math.floor(uncompletedOrders.length * 0.6) },
    { category: 'Cancelled Orders', amount: totalLosses * 0.3, count: Math.floor(uncompletedOrders.length * 0.3) },
    { category: 'Damaged Goods', amount: totalLosses * 0.1, count: Math.floor(uncompletedOrders.length * 0.1) }
  ];

  return {
    totalLosses,
    breakdown: lossesByCategory.map(item => ({
      ...item,
      percentage: totalLosses > 0 ? Math.round((item.amount / totalLosses) * 100) : 0
    }))
  };
}

// Supplier sales computation functions
export function computeSupplierSales(orders: Order[], products: Product[], period?: PeriodFilter) {
  // Mock suppliers data - in real app this would come from database
  const suppliers = [
    { id: 'sup1', name: 'ABC Supplies', zimraTIN: '123456789' },
    { id: 'sup2', name: 'XYZ Distributors', zimraTIN: '987654321' },
    { id: 'sup3', name: 'Global Traders', zimraTIN: null }
  ];

  const filteredOrders = period ? filterOrdersByPeriod(orders, period) : orders;

  return suppliers.map(supplier => {
    const supplierOrders = filteredOrders.filter(order =>
      order.items.some(item => item.supplierId === supplier.id)
    );
    const totalSales = supplierOrders.reduce((sum, order) => sum + order.total, 0);
    const supplierProducts = products.filter(product => product.category === supplier.id);
    const totalOrders = supplierOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const productsSold = supplierProducts.reduce((sum, product) => sum + (product.stock || 0), 0);
    const productIds = supplierProducts.map(product => product.id);

    return {
      supplier: supplier.name,
      supplierId: supplier.id,
      zimraTIN: supplier.zimraTIN,
      totalSales,
      totalOrders,
      averageOrderValue,
      productsSold,
      productIds,
      dateRange: {
        start: period ? new Date(Date.now() - (period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '2024-01-01',
        end: new Date().toISOString().split('T')[0]
      }
    };
  });
}

export function computeTotalSupplierSales(orders: Order[], products: Product[], period?: PeriodFilter) {
  const supplierSales = computeSupplierSales(orders, products, period);
  const totalGrossSales = supplierSales.reduce((sum, supplier) => sum + supplier.totalSales, 0);
  const totalSuppliers = supplierSales.length;
  const averageSalesPerSupplier = totalSuppliers > 0 ? totalGrossSales / totalSuppliers : 0;
  const topSupplier = supplierSales.reduce((top, current) => current.totalSales > top.totalSales ? current : top, supplierSales[0]);

  return {
    totalGrossSales,
    summary: {
      totalSuppliers,
      averageSalesPerSupplier,
      topSupplier: topSupplier?.supplier || 'N/A',
      topSupplierSales: topSupplier?.totalSales || 0
    }
  };
}
