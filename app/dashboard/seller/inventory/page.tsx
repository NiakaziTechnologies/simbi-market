"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Plus, Edit, Trash2, Eye, EyeOff, Copy, Download, Upload, FileText, AlertCircle, TrendingUp, CheckCircle } from "lucide-react";

// Mock formatUSD function
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Mock components - proper AddProductModal based on simbi-seller
const AddProductModal = ({ open, onOpenChange, onProductCreated }: any) => {
  const [selected, setSelected] = React.useState<any | null>(null);
  const [price, setPrice] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [condition, setCondition] = React.useState("NEW");
  const [description, setDescription] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Mock product search results
  const mockProducts = [
    { id: "1", name: "Toyota Camry Brake Pad Set", manufacturer: "Toyota", oemPartNumber: "04465-0D110" },
    { id: "2", name: "Honda Civic Air Filter", manufacturer: "Honda", oemPartNumber: "17220-R40-A01" },
    { id: "3", name: "Ford Ranger Oil Filter", manufacturer: "Ford", oemPartNumber: "FL-400S" },
    { id: "4", name: "BMW X5 Spark Plugs", manufacturer: "BMW", oemPartNumber: "12120037650" },
    { id: "5", name: "Chevrolet Silverado Brake Rotors", manufacturer: "Chevrolet", oemPartNumber: "15941549" }
  ];

  const [filteredProducts, setFilteredProducts] = React.useState(mockProducts);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setFilteredProducts(mockProducts);
    }
  }, [open]);

  React.useEffect(() => {
    const filtered = mockProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.oemPartNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selected) {
      alert("Please select a product from the dropdown.");
      return;
    }

    if (!price || !quantity) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    // Mock submission
    setTimeout(() => {
      setSubmitting(false);
      setSelected(null);
      setPrice("");
      setQuantity("");
      setCondition("NEW");
      setDescription("");
      setSearchQuery("");
      onOpenChange(false);
      onProductCreated();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Plus className="w-6 h-6 text-accent" />
            </div>
            Add New Product
          </DialogTitle>
          <p className="text-muted-foreground">
            Select a product and add it to your inventory
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              🔍 Select Product *
            </Label>
            <div className="relative">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-border"
              />
              <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 hover:bg-muted/30 cursor-pointer border-b border-border/50 last:border-b-0 ${
                      selected?.id === product.id ? 'bg-accent/10' : ''
                    }`}
                    onClick={() => setSelected(product)}
                  >
                    <div className="font-medium text-foreground">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.manufacturer} • {product.oemPartNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Product Display */}
          {selected && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span className="font-semibold text-accent">Selected Product</span>
              </div>
              <div className="text-sm text-foreground">
                <p className="font-medium">{selected.name}</p>
                <p className="text-xs mt-1 text-muted-foreground">OEM: {selected.oemPartNumber} • Manufacturer: {selected.manufacturer}</p>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                💰 Your Price *
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-background border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                📦 Stock Quantity *
              </Label>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="bg-background border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                🏷️ Condition *
              </Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">🆕 NEW</SelectItem>
                  <SelectItem value="USED">🔧 USED</SelectItem>
                  <SelectItem value="REFURBISHED">♻️ REFURBISHED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                📝 Description *
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                className="bg-background border-border"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="border-border text-foreground hover:bg-accent/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selected}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Product...
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EditProductModal = ({ open, product, onOpenChange, onSave, onDelete }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-card border-border">
      <DialogHeader>
        <DialogTitle className="text-foreground">Edit Product</DialogTitle>
      </DialogHeader>
      <div className="p-4">
        <p className="text-muted-foreground">Edit Product Modal - Mock Implementation</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => { onSave(product); onOpenChange(false); }} className="bg-accent hover:bg-accent/90">
            Save Changes
          </Button>
          <Button variant="destructive" onClick={() => { onDelete(product.id); onOpenChange(false); }}>
            Delete
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

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

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Toyota Camry Brake Pads",
    sku: "SKU001",
    price: 89.99,
    stock: 50,
    lowStockThreshold: 10,
    reorderPoint: 5,
    condition: "New",
    brand: "Toyota",
    partType: "Brake System",
    make: "Toyota",
    model: "Camry",
    year: "2020-2023",
    description: "High quality ceramic brake pads for Toyota Camry models",
    images: ["/placeholder.jpg"],
    status: "Live",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Honda Civic Air Filter",
    sku: "SKU002",
    price: 25.50,
    stock: 100,
    lowStockThreshold: 15,
    reorderPoint: 8,
    condition: "New",
    brand: "Honda",
    partType: "Air Intake",
    make: "Honda",
    model: "Civic",
    year: "2019-2021",
    description: "OEM equivalent air filter for Honda Civic",
    images: ["/placeholder.jpg"],
    status: "Live",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Ford Ranger Oil Filter",
    sku: "SKU003",
    price: 15.75,
    stock: 3,
    lowStockThreshold: 10,
    reorderPoint: 5,
    condition: "New",
    brand: "Ford",
    partType: "Engine",
    make: "Ford",
    model: "Ranger",
    year: "2018-2022",
    description: "Synthetic oil filter for Ford Ranger trucks",
    images: ["/placeholder.jpg"],
    status: "Live",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "BMW X5 Spark Plugs",
    sku: "SKU004",
    price: 45.99,
    stock: 25,
    lowStockThreshold: 8,
    reorderPoint: 4,
    condition: "New",
    brand: "BMW",
    partType: "Ignition",
    make: "BMW",
    model: "X5",
    year: "2019-2023",
    description: "Premium iridium spark plugs for BMW X5",
    images: ["/placeholder.jpg"],
    status: "Hidden",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Chevrolet Silverado Brake Rotors",
    sku: "SKU005",
    price: 120.00,
    stock: 0,
    lowStockThreshold: 5,
    reorderPoint: 2,
    condition: "New",
    brand: "Chevrolet",
    partType: "Brake System",
    make: "Chevrolet",
    model: "Silverado",
    year: "2020-2024",
    description: "High-performance brake rotors for Chevrolet Silverado",
    images: ["/placeholder.jpg"],
    status: "Live",
    createdAt: new Date().toISOString(),
  },
];

function readProducts(): Product[] {
  try {
    const raw = localStorage.getItem("simbi_products");
    if (!raw) return mockProducts;
    return JSON.parse(raw) as Product[];
  } catch (e) {
    return mockProducts;
  }
}

function saveProducts(products: Product[]) {
  localStorage.setItem("simbi_products", JSON.stringify(products));
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Add loading state for navigation
  const [navigating, setNavigating] = useState(false);

  // Mock category data
  const mockCategoryData = {
    totalValue: 15750.00,
    categories: [
      { name: "Brake System", value: 8500.00, count: 150, percentage: 54 },
      { name: "Engine", value: 4200.00, count: 80, percentage: 27 },
      { name: "Air Intake", value: 2050.00, count: 45, percentage: 13 },
      { name: "Ignition", value: 1000.00, count: 25, percentage: 6 },
    ]
  };

  // Function to fetch inventory value by category
  const fetchCategoryData = async () => {
    try {
      setLoadingCategories(true);
      // Mock API call
      setTimeout(() => {
        setCategoryData(mockCategoryData);
        setLoadingCategories(false);
      }, 500);
    } catch (err) {
      console.error("Category data loading error:", err);
      setCategoryData(null);
      setLoadingCategories(false);
    }
  };

  // Function to refresh products list
  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock API call
      setTimeout(() => {
        const data = readProducts();
        setProducts(data);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Products loading error:", err);
      setError("Failed to load products. Please refresh the page.");
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
    fetchCategoryData();
  }, []);

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

  // Color palette for categories - updated to match dark theme
  const categoryColors = [
    "#007aff", // Precision Blue
    "#6c757d", // Medium Grey
    "#f1f3f4", // Light Grey
    "#dc3545", // Destructive Red
    "#28a745", // Success Green
    "#ffc107", // Warning Yellow
    "#17a2b8", // Info Cyan
    "#6f42c1", // Purple
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
    const link = document.createElement("a");
    link.href = url;
    link.download = "product_upload_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Master Dataset Search - Mock implementation
  async function searchMasterDataset(query: string) {
    if (!query.trim()) {
      setMasterSearchResults([]);
      return;
    }

    // Mock search results
    const mockResults = [
      { id: "M001", name: "Toyota Brake Pad Set", partNumber: "04465-0D110", description: "Front brake pads for Toyota Camry" },
      { id: "M002", name: "Honda Air Filter", partNumber: "17220-R40-A01", description: "Engine air filter for Honda Civic" },
    ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.partNumber.includes(query));

    setMasterSearchResults(mockResults);
  }

  // Bulk Upload - Mock implementation
  async function handleBulkUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file only.');
      return;
    }

    // Mock successful upload
    alert('✅ Mock upload successful! Products would be processed in background.');
    event.target.value = '';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your product inventory and listings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setAddOpen(true)} className="bg-accent hover:bg-accent/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button variant="outline" onClick={exportCSV} className="border-border text-foreground hover:bg-accent/10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Inventory Value by Category Chart */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Inventory Value by Category</h2>
          <p className="text-muted-foreground">Capital allocation and risk assessment</p>
          <div className="mt-4">
            <p className="text-4xl font-bold text-accent">{loadingCategories ? '...' : (categoryData ? formatUSD(categoryData.totalValue) : '$0')}</p>
            <p className="text-sm text-muted-foreground">Total Inventory Value</p>
          </div>
        </div>

        {loadingCategories ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Loading category data...</span>
            </div>
          </div>
        ) : categoryData && categoryData.categories.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart Visualization */}
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {(() => {
                    let currentAngle = 0;
                    return categoryData.categories.map((category, index) => {
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + (category.percentage / 100) * 360;
                      currentAngle = endAngle;

                      const startAngleRad = (startAngle * Math.PI) / 180;
                      const endAngleRad = (endAngle * Math.PI) / 180;

                      const x1 = 50 + 40 * Math.cos(startAngleRad);
                      const y1 = 50 + 40 * Math.sin(startAngleRad);
                      const x2 = 50 + 40 * Math.cos(endAngleRad);
                      const y2 = 50 + 40 * Math.sin(endAngleRad);

                      const largeArcFlag = category.percentage > 50 ? 1 : 0;

                      const pathData = [
                        `M 50 50`,
                        `L ${x1} ${y1}`,
                        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        `Z`
                      ].join(' ');

                      const color = categoryColors[index % categoryColors.length];

                      return (
                        <path
                          key={category.name}
                          d={pathData}
                          fill={color}
                          stroke="#1a1a1a"
                          strokeWidth="0.5"
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      );
                    });
                  })()}
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {categoryData.categories.map((category, index) => {
                const color = categoryColors[index % categoryColors.length];
                return (
                  <div key={category.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                      <div>
                        <span className="font-medium text-foreground block">{category.name}</span>
                        <span className="text-xs text-muted-foreground">{category.count} items</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatUSD(category.value)}</p>
                      <p className="text-sm text-accent">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No category data available</p>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 border-border focus:ring-accent focus:border-accent bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-48 bg-muted/30 border-border">
                <SelectValue placeholder="All Product Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Product Status</SelectItem>
                <SelectItem value="Live">Live Products</SelectItem>
                <SelectItem value="Hidden">Hidden Products</SelectItem>
                <SelectItem value="Draft">Draft Products</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-48 bg-muted/30 border-border">
                <SelectValue placeholder="Sort by Date Added" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Sort by Date Added</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="price">Sort by Price</SelectItem>
                <SelectItem value="stock">Sort by Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortDir} onValueChange={(value) => setSortDir(value as any)}>
              <SelectTrigger className="w-40 bg-muted/30 border-border">
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="glass-card rounded-xl border border-border">
        {loading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-muted-foreground font-medium">Loading your products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-xl font-bold text-foreground mb-3">Error Loading Products</div>
            <div className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</div>
            <Button onClick={() => window.location.reload()} className="bg-accent hover:bg-accent/90">
              Try Again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold text-foreground mb-3">No products found</div>
            <div className="text-muted-foreground mb-8 max-w-md mx-auto">
              {query || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start building your inventory by adding your first product."
              }
            </div>
            <Button onClick={() => setAddOpen(true)} className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <Card key={product.id} className="glass-card border border-border hover:shadow-lg transition-shadow bg-card/50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].startsWith('//') ? `https:${product.images[0]}` : product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Package className="w-8 h-8 text-muted-foreground" style={{ display: product.images && product.images.length > 0 ? 'none' : 'block' }} />
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-foreground text-lg leading-tight">{product.name}</h3>

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-accent">
                            {formatUSD(product.price)}
                          </span>
                          <Badge variant={product.status === "Live" ? "default" : "secondary"} className={product.status === "Live" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-muted text-muted-foreground"}>
                            {product.status || "Live"}
                          </Badge>
                        </div>

                        {/* Inventory Level Display */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Inventory Level:</span>
                            </div>
                            {(() => {
                              const threshold = product.lowStockThreshold || 10;
                              const reorderPoint = product.reorderPoint || 5;
                              const stockStatus =
                                product.stock === 0
                                  ? { label: "Out of Stock", color: "border-red-500/30 text-red-400 bg-red-500/5" }
                                  : product.stock <= reorderPoint
                                  ? { label: "Critical", color: "border-red-500/30 text-red-400 bg-red-500/5" }
                                  : product.stock <= threshold
                                  ? { label: "Low Stock", color: "border-orange-500/30 text-orange-400 bg-orange-500/5" }
                                  : product.stock <= (threshold * 3)
                                  ? { label: "Medium Stock", color: "border-yellow-500/30 text-yellow-400 bg-yellow-500/5" }
                                  : { label: "In Stock", color: "border-green-500/30 text-green-400 bg-green-500/5" };

                              return (
                                <Badge variant="outline" className={stockStatus.color}>
                                  {stockStatus.label}
                                </Badge>
                              );
                            })()}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-foreground">{product.stock}</span>
                              <span className="text-sm text-muted-foreground">units available</span>
                            </div>
                            {product.sku && (
                              <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                                SKU: {product.sku}
                              </span>
                            )}
                          </div>
                          {/* Stock Level Progress Bar */}
                          {(() => {
                            const threshold = product.lowStockThreshold || 10;
                            const maxStock = Math.max(threshold * 5, product.stock, 100);
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
                              <div className="w-full bg-muted/30 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${stockStatus}`}
                                  style={{ width: `${stockPercentage}%` }}
                                />
                              </div>
                            );
                          })()}
                          {/* Threshold Info */}
                          {(product.lowStockThreshold || product.reorderPoint) && (
                            <div className="text-xs text-muted-foreground flex items-center gap-3">
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
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-accent">Brand:</span> {product.brand}
                          </div>
                        )}

                        {product.specialOffer && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
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
                          className="flex-1 border-border text-foreground hover:bg-accent/10"
                        >
                          {product.status === "Hidden" ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                          {product.status === "Hidden" ? "Show" : "Hide"}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { navigator.clipboard?.writeText(product.id); }}
                          className="border-border text-foreground hover:bg-accent/10"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => { setEditing(product); setEditOpen(true); }}
                          className="flex-1 bg-accent hover:bg-accent/90 text-white"
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

      <AddProductModal open={addOpen} onOpenChange={setAddOpen} onProductCreated={refreshProducts} />
      <EditProductModal
        open={editOpen}
        product={editing}
        onOpenChange={(o: boolean) => { setEditOpen(o); if (!o) setEditing(null); }}
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

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Upload className="w-5 h-5 text-accent" />
              Bulk Upload Products
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent mb-2">CSV Format Requirements:</p>
                  <ul className="text-muted-foreground space-y-1">
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

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Select a CSV file to upload</p>
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
                    className="bg-accent hover:bg-accent/90 text-white"
                    onClick={() => {
                      const input = document.getElementById('bulk-upload') as HTMLInputElement;
                      if (input) input.click();
                    }}
                  >
                    Choose CSV File
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground">
                  Or drag and drop your CSV file here
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="border-border text-foreground hover:bg-accent/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setBulkUploadOpen(false)}
                className="border-border text-foreground hover:bg-accent/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Master Dataset Search Dialog */}
      <Dialog open={masterSearchOpen} onOpenChange={setMasterSearchOpen}>
        <DialogContent className="max-w-4xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Search className="w-5 h-5 text-accent" />
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
                className="flex-1 border-border focus:ring-accent focus:border-accent bg-background"
              />
              <Button
                onClick={() => searchMasterDataset(masterSearchQuery)}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                Search
              </Button>
            </div>

            {masterSearchResults.length > 0 && (
              <div className="border border-border rounded-lg max-h-96 overflow-y-auto">
                <div className="p-4 bg-muted/30 border-b border-border">
                  <p className="text-sm text-muted-foreground">
                    Found {masterSearchResults.length} parts. Click "Use Part" to auto-fill product details.
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {masterSearchResults.map((part) => (
                    <div key={part.id || part.slug || Math.random()} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-foreground">ID</p>
                              <p className="text-muted-foreground">{String(part.id || '-')}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Name</p>
                              <p className="text-muted-foreground">{String(part.name || '-')}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Part Number</p>
                              <p className="text-muted-foreground">{String(part.partNumber || part.id || '-')}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Description</p>
                              <p className="text-muted-foreground">{String(part.description || part.name || '-')}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 ml-4"
                          onClick={() => {
                            setMasterSearchOpen(false);
                            setAddOpen(true);
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
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No parts found</p>
                <p className="text-sm text-muted-foreground">
                  Please verify the part number or contact support to add to Master Dataset.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setMasterSearchOpen(false)}
                className="border-border text-foreground hover:bg-accent/10"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
