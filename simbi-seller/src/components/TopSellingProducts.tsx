// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD } from "@/lib/currency";
import { apiClient } from "@/lib/apiClient";
import { Package, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";

type Product = {
  inventoryId: string;
  productName: string;
  totalRevenue: number;
  totalQuantity: number;
  orderCount: number;
};

type TopProductsData = {
  summary: {
    totalProducts: number;
    totalRevenue: number;
    totalQuantity: number;
    totalOrders: number;
    avgRevenuePerProduct: number;
    period: {
      startDate: string;
      endDate: string;
    };
  };
  products: Product[];
};

export function TopSellingProducts() {
  const [data, setData] = useState<TopProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.request<{
          success: boolean;
          message: string;
          data?: TopProductsData;
        }>('/api/seller/reports/top-products', {
          method: 'GET',
        });

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to load top products');
        }
      } catch (err: any) {
        console.error("Failed to load top products:", err);
        setError(err?.data?.message || err?.message || 'Failed to load top products');
      } finally {
        setLoading(false);
      }
    };

    loadTopProducts();
  }, []);

  if (loading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading top products...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 mb-2">Error loading data</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.products || data.products.length === 0) {
    return (
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topProducts = data.products.slice(0, 10); // Top 10

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-bold text-gray-900">Top Selling Products</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {data.summary.totalProducts} products • {data.summary.totalOrders} orders
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold">{formatUSD(data.summary.totalRevenue)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Package className="w-4 h-4" />
            <span className="font-semibold">{data.summary.totalQuantity} units</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topProducts.map((product, index) => {
            const percentage = data.summary.totalRevenue > 0 
              ? ((product.totalRevenue / data.summary.totalRevenue) * 100).toFixed(1)
              : '0';
            
            return (
              <div
                key={product.inventoryId || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product.productName || 'Unknown Product'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {product.orderCount} orders
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.totalQuantity} units
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatUSD(product.totalRevenue)}</p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">
                {formatUSD(data.summary.totalRevenue)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total Quantity</p>
              <p className="text-lg font-bold text-gray-900">
                {data.summary.totalQuantity}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total Orders</p>
              <p className="text-lg font-bold text-gray-900">
                {data.summary.totalOrders}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Avg per Product</p>
              <p className="text-lg font-bold text-gray-900">
                {formatUSD(data.summary.avgRevenuePerProduct)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}







