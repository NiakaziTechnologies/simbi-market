// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

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

export default function EditProductModal({
  open,
  product,
  onOpenChange,
  onSave,
  onDelete,
}: {
  open: boolean;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState<Product | null>(null);

  useEffect(() => {
    if (product) {
      setForm({ ...product });
    } else {
      setForm(null);
    }
  }, [product]);

  if (!form) return null;

  const handleSave = () => {
    if (!form.name || !form.price || form.stock === undefined || form.stock < 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSave(form);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      onDelete(form.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Product</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku || ""}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="Enter SKU"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={form.condition || "NEW"} onValueChange={(value) => setForm({ ...form, condition: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="USED">USED</SelectItem>
                <SelectItem value="REFURBISHED">REFURBISHED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter product description"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}