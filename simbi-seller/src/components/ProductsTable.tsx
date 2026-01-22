// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddProductModal from "@/components/AddProductModal";
import { formatUSD } from "@/lib/currency";
import EditProductModal from "@/components/EditProductModal";
import { formatDateLong, formatDateShort } from "@/lib/date";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";

type Product = {
  id: string;
  masterId?: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  condition?: string;
  brand?: string;
  partType?: string;
  specialOffer?: boolean;
  make?: string;
  model?: string;
  year?: string;
  description?: string;
  images?: string[];
  status?: "Live" | "Hidden" | "Draft";
  createdAt?: string;
};

// Load products from API
async function loadProducts(accessToken: string | null): Promise<Product[]> {
  if (!accessToken) return [];

  try {
    const data = await apiClient.request<{ success: boolean; message: string; data?: { inventory: any[] } }>(
      '/api/seller/inventory/listings',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (data.success && data.data?.inventory) {
      // Transform API data to match our Product interface
      return data.data.inventory.map((item: any) => ({
        id: item.id,
        masterId: item.masterProductId,
        name: item.masterProduct?.name || 'Unknown Product',
        sku: item.sellerSku,
        price: item.sellerPrice,
        stock: item.quantity,
        condition: item.condition,
        status: item.isActive ? 'Live' : 'Hidden',
        createdAt: item.createdAt,
        // Map other fields as needed
        brand: item.masterProduct?.manufacturer,
        partType: item.masterProduct?.category?.name,
        make: item.masterProduct?.vehicleCompatibility?.make,
        model: item.masterProduct?.vehicleCompatibility?.model,
        year: item.masterProduct?.vehicleCompatibility?.year,
        description: item.masterProduct?.description,
        images: item.masterProduct?.images || []
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// Create new product listing via API
async function createProduct(accessToken: string | null, productData: any): Promise<boolean> {
  if (!accessToken) return false;

  try {
    const data = await apiClient.post<{ success: boolean; message: string }>(
      '/api/seller/inventory/listings',
      productData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    return data.success;
  } catch (error) {
    console.error('Error creating product:', error);
    return false;
  }
}

// Update product via API
async function updateProduct(accessToken: string | null, productId: string, updates: any): Promise<boolean> {
  if (!accessToken) return false;

  try {
    const data = await apiClient.request<{ success: boolean; message: string }>(
      `/api/seller/inventory/listings/${productId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      }
    );
    return data.success;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

// Delete product via API
async function deleteProductAPI(accessToken: string | null, productId: string): Promise<boolean> {
  if (!accessToken) return false;

  try {
    const data = await apiClient.request<{ success: boolean; message: string }>(
      `/api/seller/inventory/listings/${productId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    return data.success;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [threshold, setThreshold] = useState<number>(10);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useSellerAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await loadProducts(accessToken);
      setProducts(data);
      setLoading(false);
    };

    loadData();
  }, [accessToken]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => p.status !== "Hidden");
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q));
    }

    list = list.sort((a, b) => {
      const rev = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name) * rev;
      if (sortBy === "price") return (a.price - b.price) * rev;
      if (sortBy === "stock") return (a.stock - b.stock) * rev;
      if (sortBy === "createdAt") return (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()) * rev;
      return 0;
    });

    return list;
  }, [products, query, sortBy, sortDir]);

  async function toggleHide(id: string) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStatus = product.status === "Hidden";
    const success = await updateProduct(accessToken, id, { isActive: newStatus });

    if (success) {
      const updated = products.map((p) => (p.id === id ? { ...p, status: (newStatus ? "Live" : "Hidden") as "Live" | "Hidden" } : p));
      setProducts(updated);
      toast({ title: "Product visibility updated" });
    } else {
      toast({ title: "Failed to update product visibility", variant: "destructive" });
    }
  }

  async function quickEdit(id: string, field: "price" | "stock", value: number) {
    const updateData: any = {};
    if (field === "price") updateData.sellerPrice = value;
    if (field === "stock") updateData.quantity = value;

    const success = await updateProduct(accessToken, id, updateData);

    if (success) {
      const updated = products.map((p) => (p.id === id ? { ...p, [field]: value } : p));
      setProducts(updated);
      toast({ title: "Product updated" });
    } else {
      toast({ title: "Failed to update product", variant: "destructive" });
    }
  }

  async function saveEdited(product: Product) {
    const updateData = {
      sellerPrice: product.price,
      quantity: product.stock,
      sellerSku: product.sku,
      condition: product.condition,
      isActive: product.status === "Live"
    };

    const success = await updateProduct(accessToken, product.id, updateData);

    if (success) {
      const updated = products.map((p) => (p.id === product.id ? product : p));
      setProducts(updated);
      toast({ title: "Product saved" });
    } else {
      toast({ title: "Failed to save product", variant: "destructive" });
    }
  }

  async function deleteProduct(id: string) {
    const success = await deleteProductAPI(accessToken, id);

    if (success) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      toast({ title: "Product deleted" });
    } else {
      toast({ title: "Failed to delete product", variant: "destructive" });
    }
  }

  function exportCSV() {
    const rows = products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, price: p.price, stock: p.stock, status: p.status }));
    const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clean Header Section - Metis Style */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 sm:flex-initial">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {query && (
                  <button
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setQuery("")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-transparent border-none text-gray-700 focus:outline-none text-sm"
                >
                  <option value="createdAt">Date</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as any)}
                  className="px-3 py-2 bg-transparent border-none text-gray-700 focus:outline-none text-sm"
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <Input
                  type="number"
                  value={String(threshold)}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-16 px-2 py-2 bg-transparent border-none text-center text-gray-700 focus:outline-none text-sm"
                  placeholder="10"
                />
                <span className="text-xs text-gray-600 pr-2">Low stock alert</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={exportCSV}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="premium-card border border-purple-200/50 shadow-2xl overflow-hidden relative">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/5 to-transparent rounded-full blur-2xl"></div>

        <div className="overflow-auto">
          <table className="w-full table-auto">
            <thead className="bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 text-left text-sm">
              <tr>
                <th className="p-4 sm:p-6 font-bold text-slate-800 border-b border-purple-200/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="hidden sm:inline">Product Image</span>
                    <span className="sm:hidden">Image</span>
                  </div>
                </th>
                <th className="p-4 sm:p-6 font-bold text-slate-800 border-b border-purple-200/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <span className="hidden sm:inline">Product Details</span>
                      <span className="sm:hidden">Details</span>
                    </div>
                  </div>
                </th>
                <th className="p-4 sm:p-6 font-bold text-slate-800 border-b border-purple-200/50 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-white font-bold">SKU</span>
                    </div>
                    <span>SKU</span>
                  </div>
                </th>
                <th className="p-4 sm:p-6 font-bold text-slate-800 border-b border-purple-200/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="hidden sm:inline">Price</span>
                    <span className="sm:hidden">Price</span>
                  </div>
                </th>
                <th className="p-4 sm:p-6 font-bold text-slate-800 border-b border-purple-200/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6m-6-4h6" />
                      </svg>
                    </div>
                    <span className="hidden sm:inline">Inventory</span>
                    <span className="sm:hidden">Stock</span>
                  </div>
                </th>
                <th className="p-4 sm:p-6 font-bold text-slate-800 border-b border-purple-200/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="hidden sm:inline">Status</span>
                    <span className="sm:hidden">Status</span>
                  </div>
                </th>
                <th className="p-4 sm:p-6 font-bold text-slate-800 border-b border-purple-200/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="hidden sm:inline">Actions</span>
                    <span className="sm:hidden">Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="py-12">
                      <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="text-xl font-bold text-slate-900 mb-3">No products found</div>
                      <div className="text-slate-600 mb-8 max-w-md mx-auto">Start building your inventory by adding your first premium product. Our platform makes it easy to showcase and sell your auto parts.</div>
                      <Button onClick={() => setAddOpen(true)} className="luxury-button text-white px-8 py-3">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Your First Product
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className={`border-t border-slate-200/50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-blue-50/30 hover:to-indigo-50/30 transition-all duration-300 ${p.stock <= threshold ? "bg-gradient-to-r from-amber-50/50 to-orange-50/50" : ""}`}>
                  <td className="p-4 sm:p-6">
                    {p.images && p.images.length > 0 && (String(p.images[0]).startsWith("blob:") || String(p.images[0]).startsWith("http") || String(p.images[0]).includes("/")) ? (
                      <img src={p.images[0]} alt={p.name} className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-xl shadow-lg border-2 border-white hover:shadow-xl transition-shadow" />
                    ) : (
                      <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-500 border-2 border-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="p-4 sm:p-6 max-w-xs">
                    <div className="font-bold text-slate-900 text-sm sm:text-base mb-2" title={p.name}>
                      <div className="truncate">{p.name}</div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 hidden sm:block">
                      {p.brand && <div className="font-semibold text-purple-600">🏷️ {p.brand}</div>}
                      {p.condition && <div className="text-slate-500">Condition: {p.condition}</div>}
                      {p.partType && <div className="text-slate-500">Type: {p.partType}</div>}
                      {p.specialOffer && (
                        <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs rounded-full font-semibold border border-blue-200">
                          ⭐ Special Offer
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {p.createdAt ? formatDateShort(p.createdAt) : "-"}
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 hidden md:table-cell">
                    <div className="font-mono text-xs sm:text-sm text-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                      {p.sku || "-"}
                    </div>
                  </td>
                  <td className="p-4 sm:p-6">
                    <div className="font-bold text-lg sm:text-xl luxury-gradient-text">
                      {formatUSD(p.price)}
                    </div>
                  </td>
                  <td className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <input
                        type="number"
                        value={String(p.stock)}
                        onChange={(e) => quickEdit(p.id, "stock", Number(e.target.value))}
                        className="w-14 sm:w-20 px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-slate-200 rounded-lg text-center font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base shadow-sm hover:shadow-md transition-shadow"
                      />
                      {p.stock <= threshold && (
                        <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs rounded-full font-semibold border border-amber-200 hidden sm:inline">
                          ⚠️ Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 sm:p-6">
                    <span className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold border-2 transition-all duration-200 ${
                      p.status === 'Live'
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:shadow-lg'
                        : p.status === 'Hidden'
                        ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-200 hover:shadow-lg'
                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:shadow-lg'
                    }`}>
                      {p.status || "Live"}
                    </span>
                  </td>
                  <td className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHide(p.id)}
                        className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 px-3 py-2 transition-all duration-200"
                      >
                        {p.status === "Hidden" ? "👁️ Unhide" : "🙈 Hide"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { navigator.clipboard?.writeText(p.id); toast({ title: "Product ID Copied" }); }}
                        className="bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 px-3 py-2 transition-all duration-200"
                      >
                        📋 Copy ID
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { setEditing(p); setEditOpen(true); }}
                        className="luxury-button text-white px-3 py-2"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => { if (confirm("Are you sure you want to delete this product?")) deleteProduct(p.id); }}
                        className="px-3 py-2"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal open={addOpen} onOpenChange={setAddOpen} />
      <EditProductModal open={editOpen} product={editing} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditing(null); }} onSave={(prod: Product) => { saveEdited(prod); setEditOpen(false); setEditing(null); }} onDelete={(id: string) => { deleteProduct(id); setEditOpen(false); setEditing(null); }} />

      {/* Floating Add Product Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => setAddOpen(true)}
          className="h-16 w-16 luxury-button text-white rounded-full shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 hover:scale-110 group relative overflow-hidden"
        >
          <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-ping opacity-20"></div>
        </Button>
      </div>
    </div>
  );
}
