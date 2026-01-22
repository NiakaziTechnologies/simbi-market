// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Search, Filter, Plus, Edit, Trash2, Eye, EyeOff, Copy, Download, Upload, FileText, AlertCircle } from "lucide-react";
import { formatUSD } from "@/lib/currency";
import AddProductModal from "@/components/AddProductModal";
import EditProductModal from "@/components/EditProductModal";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";

type Product = {
  id: string;
  masterId?: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
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

function readProducts(): Product[] {
  try {
    const raw = localStorage.getItem("simbi_products");
    if (!raw) return [];
    return JSON.parse(raw) as Product[];
  } catch (e) {
    return [];
  }
}

function saveProducts(products: Product[]) {
  localStorage.setItem("simbi_products", JSON.stringify(products));
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Live" | "Hidden" | "Draft">("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [masterSearchOpen, setMasterSearchOpen] = useState(false);
  const [masterSearchQuery, setMasterSearchQuery] = useState("");
  const [masterSearchResults, setMasterSearchResults] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<{
    totalValue: number;
    categories: Array<{
      name: string;
      value: number;
      count: number;
      percentage: number;
    }>;
  } | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const { accessToken } = useSellerAuth();

  // Add loading state for navigation
  const [navigating, setNavigating] = useState(false);

  // Function to fetch inventory value by category
  const fetchCategoryData = async () => {
    if (!accessToken) return;

    try {
      setLoadingCategories(true);
      const data = await apiClient.request<{
        success: boolean;
        message: string;
        data?: {
          totalValue: number;
          categories: Array<{
            name: string;
            value: number;
            count: number;
            percentage: number;
          }>;
        };
      }>('/api/seller/inventory/value-by-category', {
        method: 'GET',
      });

      if (data.success && data.data) {
        setCategoryData(data.data);
      }
    } catch (err) {
      console.error("Category data loading error:", err);
      // Don't show error to user, just use empty state
      setCategoryData(null);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Function to refresh products list
  const refreshProducts = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.request<{ success: boolean; message: string; data?: { inventory: any[] } }>('/api/seller/inventory/listings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (data.success && data.data) {
        // Transform API response to match Product type
        const transformedProducts: Product[] = data.data.inventory.map((item: any) => {
          const images = item.sellerImages?.length > 0 ? item.sellerImages : item.masterProduct?.imageUrls || [];
          console.log('Product images for', item.masterProduct?.name, ':', images);
          
          return {
            id: item.id,
            masterId: item.masterProductId,
            name: item.masterProduct?.name || 'Unknown Product',
            sku: item.sellerSku,
            price: item.sellerPrice,
            stock: item.quantity,
            lowStockThreshold: item.lowStockThreshold || 10,
            reorderPoint: item.reorderPoint || 5,
            condition: item.condition,
            brand: item.masterProduct?.manufacturer,
            partType: item.masterProduct?.category?.name,
            make: item.masterProduct?.vehicleCompatibility?.make,
            model: item.masterProduct?.vehicleCompatibility?.model,
            year: item.masterProduct?.vehicleCompatibility?.year,
            description: item.masterProduct?.description,
            images: images,
            status: item.isActive ? "Live" : "Hidden",
            createdAt: item.createdAt,
          };
        });
        setProducts(transformedProducts);
        // Refresh category data after products load
        fetchCategoryData();
      } else {
        setError(data.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Products loading error:", err);
      setError("Failed to load products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      refreshProducts();
      // Also fetch category data independently
      fetchCategoryData();
    }
  }, [accessToken]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

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
  }, [products, query, statusFilter, sortBy, sortDir]);

  // Color palette for categories
  const categoryColors = [
    "#3498DB", // Blue
    "#2ECC71", // Green
    "#F39C12", // Orange
    "#E74C3C", // Red
    "#9B59B6", // Purple
    "#34495E", // Dark Gray
    "#1ABC9C", // Teal
    "#E67E22", // Dark Orange
  ];

  function toggleHide(id: string) {
    const updated = products.map((p) => (p.id === id ? { ...p, status: p.status === "Hidden" ? "Live" as const : "Hidden" as const } : p));
    setProducts(updated);
    saveProducts(updated);
  }

  function deleteProduct(id: string) {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
  }

  function formatImageUrlsForExport(images: string[]): string {
    if (!images || images.length === 0) return '';

    // Limit to first 3 images to prevent field from becoming too large
    const limitedImages = images.slice(0, 3);

    // Truncate each URL if it's longer than 100 characters
    const formattedImages = limitedImages.map(url => {
      if (url.length > 100) {
        return url.substring(0, 97) + '...';
      }
      return url;
    });

    return formattedImages.join(';');
  }

  function exportCSV() {
    // Create properly formatted CSV with all fields
    const headers = [
      'SKU', 'Product Name', 'Price (USD)', 'Stock', 'Condition', 'Brand',
      'Part Type', 'Make', 'Model', 'Year', 'Description', 'Image URLs',
      'Status', 'Special Offer', 'Internal ID', 'Master ID', 'Created Date'
    ];

    const rows = products.map((p) => {
      // Properly escape CSV fields
      const escapeCsvField = (field: string) => {
        if (!field) return '';
        const stringField = String(field);
        // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      return [
        escapeCsvField(p.sku || ''),
        escapeCsvField(p.name || ''),
        p.price || '',
        p.stock || '',
        escapeCsvField(p.condition || 'New'),
        escapeCsvField(p.brand || ''),
        escapeCsvField(p.partType || ''),
        escapeCsvField(p.make || ''),
        escapeCsvField(p.model || ''),
        escapeCsvField(p.year || ''),
        escapeCsvField(p.description || ''),
        escapeCsvField(formatImageUrlsForExport(p.images || [])),
        escapeCsvField(p.status || 'Live'),
        p.specialOffer || false,
        escapeCsvField(p.id || ''),
        escapeCsvField(p.masterId || ''),
        escapeCsvField(p.createdAt || '')
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_full_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadTemplate() {
    const template = [
      'SKU,Product Name,Price (USD),Stock,Condition,Brand,Part Type,Make,Model,Year,Description,Image URLs,Status,Special Offer',
      'SKU001,Toyota Camry Brake Pads,89.99,50,New,Toyota,Genuine Parts,Toyota,Camry,2020-2023,"High quality ceramic brake pads for Toyota Camry models",https://example.com/image1.jpg;https://example.com/image2.jpg,Live,true',
      'SKU002,Honda Civic Air Filter,25.50,100,New,Honda,Replacement Parts,Honda,Civic,2019-2021,"OEM equivalent air filter for Honda Civic",https://example.com/civic-filter.jpg,Live,false',
      'SKU003,Ford Ranger Oil Filter,15.75,75,New,Ford,Motorcraft,Ford,Ranger,2018-2022,"Synthetic oil filter for Ford Ranger trucks",https://example.com/ranger-filter.jpg,Live,false',
      '',
      'INSTRUCTIONS:',
      '1. Fill in your product details in the rows above',
      '2. Do not change the header row (first row)',
      '3. For multiple images, separate URLs with semicolons (;) - max 3 images exported',
      '4. Image URLs must start with http:// or https://',
      '5. Long URLs (>100 chars) will be truncated in exports',
      '5. Condition options: New, Used, Refurbished',
      '6. Status options: Live, Hidden, Draft',
      '7. Special Offer: true or false',
      '8. Save as CSV and upload using Bulk Upload'
    ].join('\n');

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Master Dataset Search - US-S-205
  async function searchMasterDataset(query: string) {
    if (!query.trim()) {
      setMasterSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/seller/inventory/catalog?search=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMasterSearchResults(data.data.products);
        } else {
          setMasterSearchResults([]);
        }
      } else {
        setMasterSearchResults([]);
      }
    } catch (error) {
      console.error("Master dataset search failed:", error);
      setMasterSearchResults([]);
    }
  }

  // Bulk Upload - US-S-206
  async function handleBulkUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      alert('Please select a CSV file only.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/seller/inventory/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Upload successful! Processing ${data.data.totalRows} rows in background.`);
        // Refresh products list after successful upload
        window.location.reload();
      } else {
        alert(`❌ Upload failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('❌ Error uploading file. Please try again.');
    }

    // Clear the file input
    event.target.value = '';
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Clean Header Section - Metis Style */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                Products
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Manage your product inventory and listings
              </p>
            </div>

            <div className="flex items-center gap-3">
               <Button
                 onClick={() => setAddOpen(true)}
                 className="bg-[#3498DB] hover:bg-[#2980B9] text-white"
               >
                 <Plus className="w-4 h-4 mr-2" />
                 Add Product
               </Button>
               <Button
                 variant="outline"
                 onClick={exportCSV}
                 className="border-gray-300 text-gray-700 hover:bg-gray-50"
               >
                 <Download className="w-4 h-4 mr-2" />
                 Export
               </Button>
             </div>
          </div>
        </div>

        {/* Inventory Value by Category Chart - US-S-207 */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Inventory Value by Category</h2>
              <p className="text-gray-600">Capital allocation and risk assessment</p>
            </div>
          </div>

          {loadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading category data...</span>
              </div>
            </div>
          ) : categoryData && categoryData.categories.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart Visualization */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Dynamic pie chart using real data */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      let currentOffset = 0;
                      return categoryData.categories.map((category, index) => {
                        const dashArray = `${category.percentage} ${100}`;
                        const dashOffset = currentOffset;
                        currentOffset -= category.percentage;
                        const color = categoryColors[index % categoryColors.length];
                        
                        return (
                          <circle
                            key={category.name}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={color}
                            strokeWidth="20"
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            className={index === 0 ? "animate-pulse" : ""}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{formatUSD(categoryData.totalValue)}</p>
                      <p className="text-sm text-gray-500">Total Value</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {categoryData.categories.map((category, index) => {
                  const color = categoryColors[index % categoryColors.length];
                  return (
                    <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: color }}
                        ></div>
                        <div>
                          <span className="font-medium text-gray-900 block">{category.name}</span>
                          <span className="text-xs text-gray-500">{category.count} items</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatUSD(category.value)}</p>
                        <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No category data available</p>
            </div>
          )}
        </div>

        {/* Clean Filters Section */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-transparent border-none text-gray-700 focus:outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="Live">Live</option>
                  <option value="Hidden">Hidden</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

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
            </div>
          </div>
        </div>

        {/* Products Grid - Metis Style */}
        <div className="bg-white border border-gray-200 shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex items-center justify-center gap-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-gray-600 font-medium">Loading your products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-xl font-bold text-gray-900 mb-3">Error Loading Products</div>
              <div className="text-gray-600 mb-8 max-w-md mx-auto">{error}</div>
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
                Try Again
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-xl font-bold text-gray-900 mb-3">No products found</div>
              <div className="text-gray-600 mb-8 max-w-md mx-auto">
                {query || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Start building your inventory by adding your first product."
                }
              </div>
              <Button onClick={() => setAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <Card key={product.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Product Image */}
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].startsWith('//') ? `https:${product.images[0]}` : product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                // Fallback to package icon if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Package className="w-8 h-8 text-gray-400" style={{ display: product.images && product.images.length > 0 ? 'none' : 'block' }} />
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h3>

                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-blue-600">{formatUSD(product.price)}</span>
                            <Badge variant={product.status === "Live" ? "default" : "secondary"}>
                              {product.status || "Live"}
                            </Badge>
                          </div>

                          {/* Inventory Level Display */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Inventory Level:</span>
                              </div>
                              {(() => {
                                const threshold = product.lowStockThreshold || 10;
                                const reorderPoint = product.reorderPoint || 5;
                                const stockStatus = 
                                  product.stock === 0 
                                    ? { label: "Out of Stock", color: "border-red-300 text-red-700 bg-red-50", barColor: "bg-red-500" }
                                    : product.stock <= reorderPoint
                                    ? { label: "Critical", color: "border-red-300 text-red-700 bg-red-50", barColor: "bg-red-500" }
                                    : product.stock <= threshold
                                    ? { label: "Low Stock", color: "border-orange-300 text-orange-700 bg-orange-50", barColor: "bg-orange-500" }
                                    : product.stock <= (threshold * 3)
                                    ? { label: "Medium Stock", color: "border-yellow-300 text-yellow-700 bg-yellow-50", barColor: "bg-yellow-500" }
                                    : { label: "In Stock", color: "border-green-300 text-green-700 bg-green-50", barColor: "bg-green-500" };
                                
                                return (
                                  <Badge variant="outline" className={stockStatus.color}>
                                    {stockStatus.label}
                                  </Badge>
                                );
                              })()}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-gray-900">{product.stock}</span>
                                <span className="text-sm text-gray-500">units available</span>
                              </div>
                              {product.sku && (
                                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                  SKU: {product.sku}
                                </span>
                              )}
                            </div>
                            {/* Stock Level Progress Bar */}
                            {(() => {
                              const threshold = product.lowStockThreshold || 10;
                              const maxStock = Math.max(threshold * 5, product.stock, 100); // Dynamic max based on threshold
                              const stockPercentage = Math.min((product.stock / maxStock) * 100, 100);
                              const stockStatus = 
                                product.stock === 0 
                                  ? "bg-red-500" 
                                  : product.stock <= (product.reorderPoint || 5)
                                  ? "bg-red-500"
                                  : product.stock <= threshold
                                  ? "bg-orange-500"
                                  : product.stock <= (threshold * 3)
                                  ? "bg-yellow-500"
                                  : "bg-green-500";
                              
                              return (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${stockStatus}`}
                                    style={{ width: `${stockPercentage}%` }}
                                  />
                                </div>
                              );
                            })()}
                            {/* Threshold Info */}
                            {(product.lowStockThreshold || product.reorderPoint) && (
                              <div className="text-xs text-gray-500 flex items-center gap-3">
                                {product.reorderPoint && (
                                  <span>Reorder: {product.reorderPoint}</span>
                                )}
                                {product.lowStockThreshold && (
                                  <span>Low Threshold: {product.lowStockThreshold}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {product.brand && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-purple-600">Brand:</span> {product.brand}
                            </div>
                          )}

                          {product.specialOffer && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Special Offer
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNavigating(true);
                              toggleHide(product.id);
                              setTimeout(() => setNavigating(false), 100);
                            }}
                            disabled={navigating}
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            {product.status === "Hidden" ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                            {product.status === "Hidden" ? "Show" : "Hide"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { navigator.clipboard?.writeText(product.id); }}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => { setEditing(product); setEditOpen(true); }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddProductModal open={addOpen} onOpenChange={setAddOpen} onProductCreated={refreshProducts} />
      <EditProductModal
        open={editOpen}
        product={editing}
        onOpenChange={(o) => { setEditOpen(o); if (!o) setEditing(null); }}
        onSave={(prod: Product) => {
          const updated = products.map((p) => (p.id === prod.id ? prod : p));
          setProducts(updated);
          saveProducts(updated);
          setEditOpen(false);
          setEditing(null);
        }}
        onDelete={(id: string) => {
          deleteProduct(id);
          setEditOpen(false);
          setEditing(null);
        }}
      />

      {/* Bulk Upload Dialog - US-S-206 */}
      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#3498DB]" />
              Bulk Upload Products
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-2">CSV Format Requirements:</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• <strong>Download template</strong> for correct format with sample data</li>
                    <li>• <strong>✅ Image URLs supported:</strong> Use semicolon (;) to separate multiple image URLs</li>
                    <li>• <strong>Image URL format:</strong> https://example.com/image.jpg;https://example.com/image2.jpg</li>
                    <li>• Maximum 500 products per upload</li>
                    <li>• Price must be greater than 0</li>
                    <li>• Stock must be 0 or greater</li>
                    <li>• <strong>Vehicle compatibility:</strong> Make, Model, and Year fields auto-populate compatibility</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Select a CSV file to upload</p>
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleBulkUpload}
                  className="hidden"
                  id="bulk-upload"
                />
                <label htmlFor="bulk-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    className="bg-[#3498DB] hover:bg-[#2980B9] text-white"
                    onClick={() => {
                      // Ensure the input click is triggered
                      const input = document.getElementById('bulk-upload') as HTMLInputElement;
                      if (input) {
                        input.click();
                      }
                    }}
                  >
                    Choose CSV File
                  </Button>
                </label>
                <p className="text-xs text-gray-500">
                  Or drag and drop your CSV file here
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setBulkUploadOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Master Dataset Search Dialog - US-S-205 */}
      <Dialog open={masterSearchOpen} onOpenChange={setMasterSearchOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-[#3498DB]" />
              Master Auto-Parts Dataset Search
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Search by Part Number, Make, Model..."
                value={masterSearchQuery}
                onChange={(e) => {
                  setMasterSearchQuery(e.target.value);
                  searchMasterDataset(e.target.value);
                }}
                className="flex-1 border-gray-300 focus:ring-[#3498DB] focus:border-[#3498DB]"
              />
              <Button
                onClick={() => searchMasterDataset(masterSearchQuery)}
                className="bg-[#3498DB] hover:bg-[#2980B9] text-white"
              >
                Search
              </Button>
            </div>

            {masterSearchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-600">
                    Found {masterSearchResults.length} parts. Click "Use Part" to auto-fill product details.
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {masterSearchResults.map((part) => (
                    <div key={part.id || part.slug || Math.random()} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">ID</p>
                              <p className="text-gray-600">{String(part.id || '-')}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Name</p>
                              <p className="text-gray-600">{String(part.name || '-')}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Slug</p>
                              <p className="text-gray-600">{String(part.slug || '-')}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Part Number</p>
                              <p className="text-gray-600">{String(part.partNumber || part.id || '-')}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {String(part.description || part.name || '-')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#2ECC71] hover:bg-[#27AE60] text-white ml-4"
                          onClick={() => {
                            // Auto-fill product form with master data
                            setMasterSearchOpen(false);
                            setAddOpen(true);
                            // Pass the master data to the add modal (would need to modify AddProductModal)
                          }}
                        >
                          Use Part
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {masterSearchQuery && masterSearchResults.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No parts found</p>
                <p className="text-sm text-gray-400">
                  Please verify the part number or contact support to add to Master Dataset.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setMasterSearchOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
