// @ts-nocheck
"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated?: () => void; // Callback to refresh products list
};

export default function AddProductModal({ open, onOpenChange, onProductCreated }: Props) {
  const [selected, setSelected] = useState<any | null>(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [condition, setCondition] = useState("NEW");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { } = useSellerAuth();

  const searchProducts = useCallback(async (query: string) => {
    setLoading(true);
    try {
      // Check if user is authenticated before making API call
      const token = typeof window !== 'undefined' ? localStorage.getItem('sellerAccessToken') : null;
      if (!token) {
        console.warn('No authentication token found, skipping product search');
        setFilteredProducts([]);
        return;
      }

      // Build the API URL with search parameter
      const url = query.trim() 
        ? `/api/seller/inventory/catalog?search=${encodeURIComponent(query.trim())}`
        : '/api/seller/inventory/catalog';

      console.log('Searching products from:', url);
      const data = await apiClient.request<any>(url);
      console.log('Products fetched:', data);
      
      // Handle the specific response structure: data.data.products
      let products: any[] = [];
      if (data && data.data && Array.isArray(data.data.products)) {
        products = data.data.products;
      } else if (Array.isArray(data)) {
        products = data;
      } else if (data && Array.isArray(data.products)) {
        products = data.products;
      } else if (data && Array.isArray(data.data)) {
        products = data.data;
      } else if (data && Array.isArray(data.inventory)) {
        products = data.inventory;
      }
      
      console.log('Processed products:', products);
      setFilteredProducts(products);
      } catch (error) {
      console.error('Failed to search products:', error);
      setFilteredProducts([]);
      } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products when modal opens (initial load)
  useEffect(() => {
    if (open) {
      console.log('Modal opened, fetching products...');
      searchProducts('');
    }
  }, [open, searchProducts]);

  // Debounced search when user types
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300); // 300ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchProducts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selected) {
      toast({
        title: "⚠️ Product Required",
        description: "Please select a product from the dropdown.",
        variant: "destructive"
      });
      return;
    }

    if (!price || price.trim() === "") {
      toast({
        title: "💰 Price Required",
        description: "Please enter a valid price for the product.",
        variant: "destructive"
      });
      return;
    }

    if (!quantity || quantity.trim() === "") {
      toast({
        title: "📦 Stock Level Required",
        description: "Please specify the available stock quantity.",
        variant: "destructive"
      });
      return;
    }

    // Validate price format
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "💰 Invalid Price",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive"
      });
      return;
    }

    // Validate quantity format
    const quantityNum = Number(quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      toast({
        title: "📦 Invalid Stock",
        description: "Please enter a valid stock quantity (0 or greater).",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const productData = {
          masterProductId: selected.id,
          sellerPrice: priceNum,
          currency: "USD",
        quantity: quantityNum,
        condition,
          lowStockThreshold: 5,
        reorderPoint: 2,
        sellerSku: `${selected.oemPartNumber}-${Date.now()}`,
        sellerNotes: description || undefined
      };

      console.log('Submitting product data:', productData);

      // Use the correct endpoint for creating inventory listings
      const result = await apiClient.post('/api/seller/inventory/listings', productData);
      
      console.log('Product listing created:', result);
      
        toast({
        title: "✅ Success",
        description: "Product listing created successfully!",
        });

        // Reset form
        setSelected(null);
        setPrice("");
      setQuantity("");
        setCondition("NEW");
        setDescription("");
      setSearchQuery("");
      setFilteredProducts([]);
      onOpenChange(false);

      // Trigger products list refresh
      if (onProductCreated) {
        onProductCreated();
      }
    } catch (error: any) {
      console.error('Failed to create product listing:', error);
      
      toast({
        title: "❌ Error",
        description: error.message || "Failed to create product listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Add New Product
          </DialogTitle>
          <p className="text-slate-600">
            Select a product and add it to your inventory
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Product Selection Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              🔍 Select Product *
            </Label>
            <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDropdown}
                  className="w-full justify-between"
                >
                  {selected ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selected.name}</span>
                      <span className="text-sm text-slate-500">({selected.manufacturer})</span>
                    </div>
                  ) : (
                    "Select product..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {loading ? "Loading products..." : "No products found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                        <CommandItem
                      key={product.id}
                          value={`${product.name} ${product.manufacturer} ${product.oemPartNumber}`}
                          onSelect={() => {
                            setSelected(product);
                            setOpenDropdown(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected?.id === product.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-slate-500">
                              {product.manufacturer} • {product.oemPartNumber}
                </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
              </div>

          {/* Selected Product Display */}
          {selected && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                <span className="font-semibold text-emerald-800">Selected Product</span>
                        </div>
              <div className="text-sm text-emerald-700">
                <p className="font-medium">{selected.name}</p>
                <p className="text-xs mt-1">OEM: {selected.oemPartNumber} • Manufacturer: {selected.manufacturer}</p>
                      </div>
                    </div>
          )}

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold text-slate-700">
                💰 Your Price *
              </Label>
                <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="border-2 border-slate-200 focus:border-emerald-500 rounded-xl"
                required
                />
              </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700">
                📦 Stock Quantity *
              </Label>
                <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                className="border-2 border-slate-200 focus:border-emerald-500 rounded-xl"
                required
              />
          </div>

            <div className="space-y-2">
              <Label htmlFor="condition" className="text-sm font-semibold text-slate-700">
                🏷️ Condition *
              </Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="border-2 border-slate-200 focus:border-emerald-500 rounded-xl">
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
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                📝 Description *
              </Label>
                <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                className="border-2 border-slate-200 focus:border-emerald-500 rounded-xl"
                required
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="px-6 py-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selected}
              className="px-8 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Listing...
                </div>
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
