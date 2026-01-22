// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Package, TrendingUp, Plus, Minus } from "lucide-react";
import { Product, getLowStockProducts, addNotification } from "@/lib/metrics";

// Define Product interface locally if not available
interface LocalProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  initialStock?: number;
  sku?: string;
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
}
import { formatUSD } from "@/lib/currency";

interface LowStockModalProps {
  children: React.ReactNode;
  products: LocalProduct[];
  onRestock?: () => void;
}

export function LowStockModal({ children, products, onRestock }: LowStockModalProps) {
  const [open, setOpen] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<LocalProduct[]>([]);
  const [restockQuantities, setRestockQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open && products.length > 0) {
      const lowStockItems = getLowStockProducts(products);
      setLowStockProducts(lowStockItems);

      // Initialize restock quantities
      const quantities: Record<string, number> = {};
      lowStockItems.forEach(product => {
        quantities[product.id] = 0;
      });
      setRestockQuantities(quantities);
    }
  }, [open, products]);

  const handleRestockQuantityChange = (productId: string, quantity: number) => {
    setRestockQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }));
  };

  const handleRestock = (product: LocalProduct) => {
    const quantity = restockQuantities[product.id];
    if (quantity > 0) {
      // Update product stock in localStorage
      const currentProducts = JSON.parse(localStorage.getItem('simbi_products') || '[]');
      const productIndex = currentProducts.findIndex((p: Product) => p.id === product.id);

      if (productIndex !== -1) {
        currentProducts[productIndex].stock += quantity;

        // Update initialStock if this is the first restock
        if (!currentProducts[productIndex].initialStock) {
          currentProducts[productIndex].initialStock = currentProducts[productIndex].stock;
        }

        localStorage.setItem('simbi_products', JSON.stringify(currentProducts));

        // Create notification
        addNotification({
          title: "Inventory Restocked",
          body: `Added ${quantity} units to ${product.name}. New stock level: ${currentProducts[productIndex].stock} units.`,
          type: 'order'
        });

        // Refresh low stock products
        const updatedLowStock = getLowStockProducts(currentProducts);
        setLowStockProducts(updatedLowStock);

        // Reset quantity for this product
        setRestockQuantities(prev => ({
          ...prev,
          [product.id]: 0
        }));

        // Show success message
        alert(`Successfully restocked ${product.name} with ${quantity} units!`);

        // Call the onRestock callback to refresh the Dashboard
        if (onRestock) {
          onRestock();
        }
      }
    }
  };

  const getStockPercentage = (product: LocalProduct) => {
    const initial = (product as any).initialStock || product.stock || 100;
    return Math.round((product.stock / initial) * 100);
  };

  const getStockColor = (percentage: number) => {
    if (percentage <= 25) return "text-red-600 bg-red-100 dark:bg-red-900/20";
    if (percentage <= 50) return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
    return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <AlertTriangle className="w-5 h-5" />
            Low Stock Inventory Alert
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                All Products Well Stocked!
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                No products are currently below the 25% stock threshold.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold text-orange-800 dark:text-orange-200">
                    {lowStockProducts.length} Product{lowStockProducts.length !== 1 ? 's' : ''} Below 25% Stock Level
                  </span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  These products need immediate attention to prevent stockouts and lost sales.
                </p>
              </div>

              <div className="grid gap-4">
                {lowStockProducts.map((product, index) => {
                  const percentage = getStockPercentage(product);
                  const initial = product.initialStock || product.stock || 100;
                  const threshold = initial * 0.25;

                  return (
                    <Card key={product.id} className="border-orange-200 dark:border-orange-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {product.name}
                            {product.sku && (
                              <Badge variant="outline" className="text-xs">
                                {product.sku}
                              </Badge>
                            )}
                          </CardTitle>
                          <Badge className={getStockColor(percentage)}>
                            {percentage}% Stock
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-300">Current Stock:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {product.stock} units
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-300">Initial Stock:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {initial} units
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-300">Threshold (25%):</span>
                              <span className="font-semibold text-red-600">
                                {Math.round(threshold)} units
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-300">Unit Price:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {formatUSD(product.price)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-300">Total Value:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {formatUSD(product.price * product.stock)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`restock-${product.id}`} className="text-sm font-medium">
                              Restock Quantity:
                            </Label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestockQuantityChange(product.id, restockQuantities[product.id] - 1)}
                                disabled={restockQuantities[product.id] <= 0}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Input
                                id={`restock-${product.id}`}
                                type="number"
                                min="0"
                                value={restockQuantities[product.id]}
                                onChange={(e) => handleRestockQuantityChange(product.id, parseInt(e.target.value) || 0)}
                                className="w-20 text-center"
                                placeholder="0"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestockQuantityChange(product.id, restockQuantities[product.id] + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-300">Stock Level:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {percentage}% of initial stock
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>0%</span>
                            <span>Threshold (25%)</span>
                            <span>100%</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {product.stock <= threshold ? (
                              <span className="text-red-600 font-medium">
                                ⚠️ Critical: Below threshold
                              </span>
                            ) : (
                              <span className="text-orange-600 font-medium">
                                ⚡ Low: Approaching threshold
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={() => handleRestock(product)}
                            disabled={restockQuantities[product.id] <= 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Restock ({restockQuantities[product.id]} units)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  💡 Restocking Recommendations:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Restock to at least 50% of initial inventory levels</li>
                  <li>• Consider demand patterns when determining restock quantities</li>
                  <li>• Monitor sales velocity to optimize reorder points</li>
                  <li>• Set up automatic reordering for high-turnover items</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}