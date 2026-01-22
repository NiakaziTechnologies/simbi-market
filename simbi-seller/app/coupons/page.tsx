// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Ticket, Plus, Edit, Trash2, Eye, RefreshCw, Filter, TrendingUp, Copy, CheckCircle2, XCircle, Calendar, Users, DollarSign } from "lucide-react";
import { formatDateWithTime } from "@/lib/date";
import { formatUSD } from "@/lib/currency";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

const getStatusBadge = (isActive: boolean, validUntil: string) => {
  const now = new Date();
  const expiry = new Date(validUntil);
  const isExpired = expiry < now;

  if (isExpired) {
    return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Expired</Badge>;
  }
  if (isActive) {
    return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Active</Badge>;
  }
  return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Inactive</Badge>;
};

export default function Page() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const { accessToken } = useSellerAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountValue: '',
    productId: '',
    minimumOrderAmount: '',
    maximumDiscount: '',
    isActive: true,
    usageLimit: '',
    userUsageLimit: '',
    validFrom: '',
    validUntil: ''
  });

  // Load products for dropdown
  const loadProducts = async () => {
    if (!accessToken) return;

    try {
      setProductsLoading(true);
      const response = await apiClient.request<{ success: boolean; data?: { inventory: any[] } }>(
        '/api/seller/inventory/listings',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.success && response.data) {
        setProducts(response.data.inventory || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load coupons
  const loadCoupons = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (isActiveFilter !== 'all') {
        params.append('isActive', isActiveFilter);
      }

      const response = await apiClient.request<{
        success: boolean;
        data?: {
          coupons: any[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
      }>(`/api/seller/coupons?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.success && response.data) {
        setCoupons(response.data.coupons || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error("Failed to load coupons:", err);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load coupon statistics
  const loadStats = async (couponId?: string) => {
    if (!accessToken) return;

    try {
      setLoadingStats(true);
      const url = couponId 
        ? `/api/seller/coupons/stats?couponId=${couponId}`
        : '/api/seller/coupons/stats';

      const response = await apiClient.request<{
        success: boolean;
        data?: {
          totalUsages: number;
          totalDiscountGiven: number;
          recentUsages: any[];
        };
      }>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.success && response.data) {
        setStatsData(response.data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load coupon details
  const loadCouponDetails = async (couponId: string) => {
    if (!accessToken) return;

    try {
      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/coupons/${couponId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.success && response.data) {
        setSelectedCoupon(response.data);
      }
    } catch (err) {
      console.error("Failed to load coupon details:", err);
      toast({
        title: "Error",
        description: "Failed to load coupon details",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadCoupons();
      loadProducts();
    }
  }, [accessToken, page, isActiveFilter]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountValue: '',
      productId: '',
      minimumOrderAmount: '',
      maximumDiscount: '',
      isActive: true,
      usageLimit: '',
      userUsageLimit: '',
      validFrom: '',
      validUntil: ''
    });
  };

  // Open create modal
  const handleCreateClick = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  // Open edit modal
  const handleEditClick = (coupon: any) => {
    const productId = coupon.applicableProducts?.[0] || '';
    setFormData({
      name: coupon.name || '',
      description: coupon.description || '',
      discountValue: coupon.discountValue?.toString() || '',
      productId: productId,
      minimumOrderAmount: coupon.minimumOrderAmount?.toString() || '',
      maximumDiscount: coupon.maximumDiscount?.toString() || '',
      isActive: coupon.isActive ?? true,
      usageLimit: coupon.usageLimit?.toString() || '',
      userUsageLimit: coupon.userUsageLimit?.toString() || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : ''
    });
    setSelectedCoupon(coupon);
    setEditModalOpen(true);
  };

  // Open view modal
  const handleViewClick = (couponId: string) => {
    loadCouponDetails(couponId);
    setViewModalOpen(true);
  };

  // Create coupon
  const handleCreate = async () => {
    if (!accessToken) return;

    try {
      const payload: any = {
        name: formData.name,
        discountValue: Number(formData.discountValue),
        productId: formData.productId,
        validUntil: new Date(formData.validUntil).toISOString(),
        isActive: formData.isActive,
      };

      if (formData.description) payload.description = formData.description;
      if (formData.minimumOrderAmount) payload.minimumOrderAmount = Number(formData.minimumOrderAmount);
      if (formData.maximumDiscount) payload.maximumDiscount = Number(formData.maximumDiscount);
      if (formData.usageLimit) payload.usageLimit = Number(formData.usageLimit);
      if (formData.userUsageLimit) payload.userUsageLimit = Number(formData.userUsageLimit);
      if (formData.validFrom) payload.validFrom = new Date(formData.validFrom).toISOString();

      const response = await apiClient.request<{ success: boolean; message: string; data?: any }>(
        '/api/seller/coupons',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Coupon created successfully",
        });
        setCreateModalOpen(false);
        resetForm();
        loadCoupons();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create coupon",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Failed to create coupon:", err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to create coupon",
        variant: "destructive",
      });
    }
  };

  // Update coupon
  const handleUpdate = async () => {
    if (!accessToken || !selectedCoupon) return;

    try {
      const payload: any = {};

      if (formData.name) payload.name = formData.name;
      if (formData.description !== undefined) payload.description = formData.description;
      if (formData.discountValue) payload.discountValue = Number(formData.discountValue);
      if (formData.productId) payload.productId = formData.productId;
      if (formData.minimumOrderAmount) payload.minimumOrderAmount = Number(formData.minimumOrderAmount);
      if (formData.maximumDiscount) payload.maximumDiscount = Number(formData.maximumDiscount);
      if (formData.isActive !== undefined) payload.isActive = formData.isActive;
      if (formData.usageLimit) payload.usageLimit = Number(formData.usageLimit);
      if (formData.userUsageLimit) payload.userUsageLimit = Number(formData.userUsageLimit);
      if (formData.validFrom) payload.validFrom = new Date(formData.validFrom).toISOString();
      if (formData.validUntil) payload.validUntil = new Date(formData.validUntil).toISOString();

      const response = await apiClient.request<{ success: boolean; message: string; data?: any }>(
        `/api/seller/coupons/${selectedCoupon.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Coupon updated successfully",
        });
        setEditModalOpen(false);
        setSelectedCoupon(null);
        resetForm();
        loadCoupons();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update coupon",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Failed to update coupon:", err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to update coupon",
        variant: "destructive",
      });
    }
  };

  // Delete coupon
  const handleDelete = async () => {
    if (!accessToken || !selectedCoupon) return;

    try {
      const response = await apiClient.request<{ success: boolean; message: string }>(
        `/api/seller/coupons/${selectedCoupon.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Coupon deleted successfully",
        });
        setDeleteModalOpen(false);
        setSelectedCoupon(null);
        loadCoupons();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete coupon",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Failed to delete coupon:", err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  // Copy coupon code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Coupon code copied to clipboard",
    });
  };

  if (loading && coupons.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
                <p className="text-gray-600">Loading your coupons...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                Coupons
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Manage product-specific coupons and track their usage
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  loadStats();
                  setStatsModalOpen(true);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Stats
              </Button>
              <Button
                onClick={handleCreateClick}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCoupons}
              className="ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Coupons List */}
        <div className="bg-white border border-gray-200 shadow-sm">
          {coupons.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-xl font-bold text-gray-900 mb-3">No coupons found</div>
              <div className="text-gray-600 mb-8">
                {isActiveFilter !== 'all'
                  ? "Try adjusting your filter criteria."
                  : "Create your first coupon to get started."
                }
              </div>
              <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Discount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Usage</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Valid Until</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-gray-900 font-mono">{coupon.code}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(coupon.code)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{coupon.name}</div>
                          {coupon.description && (
                            <div className="text-xs text-gray-500 mt-1">{coupon.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {coupon.discountValue}%
                          </div>
                          {coupon.maximumDiscount && (
                            <div className="text-xs text-gray-500">Max: {formatUSD(coupon.maximumDiscount)}</div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {products.find(p => p.id === coupon.applicableProducts?.[0])?.masterProduct?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(coupon.isActive, coupon.validUntil)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDateWithTime(coupon.validUntil)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewClick(coupon.id)}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(coupon)}
                              className="h-8 w-8 p-0 hover:bg-green-100"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCoupon(coupon);
                                setDeleteModalOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Coupon Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Create a product-specific coupon. The coupon code will be auto-generated.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 20% Off Engine Part"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountValue">Discount Value (%) *</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productId">Product *</Label>
                  <select
                    id="productId"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={productsLoading}
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.masterProduct?.name || 'Unknown'} - {formatUSD(product.sellerPrice)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimumOrderAmount">Minimum Order Amount</Label>
                  <Input
                    id="minimumOrderAmount"
                    type="number"
                    min="0"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="maximumDiscount">Maximum Discount ($)</Label>
                  <Input
                    id="maximumDiscount"
                    type="number"
                    min="0"
                    value={formData.maximumDiscount}
                    onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="userUsageLimit">Per-User Usage Limit</Label>
                  <Input
                    id="userUsageLimit"
                    type="number"
                    min="0"
                    value={formData.userUsageLimit}
                    onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.name || !formData.discountValue || !formData.productId || !formData.validUntil}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Coupon
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Coupon Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Coupon</DialogTitle>
              <DialogDescription>
                Update coupon details. The coupon code cannot be changed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {selectedCoupon && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Coupon Code:</div>
                  <div className="text-lg font-mono font-bold text-gray-900">{selectedCoupon.code}</div>
                </div>
              )}
              <div>
                <Label htmlFor="edit-name">Coupon Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 20% Off Engine Part"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-discountValue">Discount Value (%)</Label>
                  <Input
                    id="edit-discountValue"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-productId">Product</Label>
                  <select
                    id="edit-productId"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={productsLoading}
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.masterProduct?.name || 'Unknown'} - {formatUSD(product.sellerPrice)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-minimumOrderAmount">Minimum Order Amount</Label>
                  <Input
                    id="edit-minimumOrderAmount"
                    type="number"
                    min="0"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maximumDiscount">Maximum Discount ($)</Label>
                  <Input
                    id="edit-maximumDiscount"
                    type="number"
                    min="0"
                    value={formData.maximumDiscount}
                    onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-usageLimit">Total Usage Limit</Label>
                  <Input
                    id="edit-usageLimit"
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-userUsageLimit">Per-User Usage Limit</Label>
                  <Input
                    id="edit-userUsageLimit"
                    type="number"
                    min="0"
                    value={formData.userUsageLimit}
                    onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-validFrom">Valid From</Label>
                  <Input
                    id="edit-validFrom"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-validUntil">Valid Until</Label>
                  <Input
                    id="edit-validUntil"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="edit-isActive" className="cursor-pointer">Active</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Coupon
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Coupon Details Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Coupon Details</DialogTitle>
            </DialogHeader>
            {selectedCoupon && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Coupon Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-mono font-bold text-gray-900">{selectedCoupon.code}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(selectedCoupon.code)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStatusBadge(selectedCoupon.isActive, selectedCoupon.validUntil)}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Coupon Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Name</div>
                      <div className="text-sm font-medium text-gray-900">{selectedCoupon.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Discount</div>
                      <div className="text-sm font-medium text-gray-900">{selectedCoupon.discountValue}%</div>
                    </div>
                    {selectedCoupon.description && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Description</div>
                        <div className="text-sm text-gray-900">{selectedCoupon.description}</div>
                      </div>
                    )}
                    {selectedCoupon.minimumOrderAmount && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Minimum Order</div>
                        <div className="text-sm font-medium text-gray-900">{formatUSD(selectedCoupon.minimumOrderAmount)}</div>
                      </div>
                    )}
                    {selectedCoupon.maximumDiscount && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Maximum Discount</div>
                        <div className="text-sm font-medium text-gray-900">{formatUSD(selectedCoupon.maximumDiscount)}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Usage</div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedCoupon.usageCount || 0} / {selectedCoupon.usageLimit || '∞'}
                      </div>
                    </div>
                    {selectedCoupon.userUsageLimit && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Per-User Limit</div>
                        <div className="text-sm font-medium text-gray-900">{selectedCoupon.userUsageLimit}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Valid From</div>
                      <div className="text-sm text-gray-900">{formatDateWithTime(selectedCoupon.validFrom)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Valid Until</div>
                      <div className="text-sm text-gray-900">{formatDateWithTime(selectedCoupon.validUntil)}</div>
                    </div>
                  </div>
                </div>

                {selectedCoupon.usages && selectedCoupon.usages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Usage</h3>
                    <div className="space-y-2">
                      {selectedCoupon.usages.slice(0, 5).map((usage: any) => (
                        <div key={usage.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Order #{usage.order?.orderNumber}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {usage.buyer?.firstName} {usage.buyer?.lastName} ({usage.buyer?.email})
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-emerald-600">
                                -{formatUSD(usage.discountAmount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDateWithTime(usage.usedAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Coupon</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this coupon? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedCoupon && (
              <div className="mt-4">
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-sm font-medium text-gray-700">Coupon Code:</div>
                  <div className="text-lg font-mono font-bold text-gray-900">{selectedCoupon.code}</div>
                  <div className="text-sm text-gray-600 mt-1">{selectedCoupon.name}</div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Statistics Modal */}
        <Dialog open={statsModalOpen} onOpenChange={setStatsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Coupon Statistics</DialogTitle>
              <DialogDescription>
                View overall coupon usage statistics
              </DialogDescription>
            </DialogHeader>
            {loadingStats ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : statsData ? (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Usages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{statsData.totalUsages || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Discount Given</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatUSD(statsData.totalDiscountGiven || 0)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {statsData.recentUsages && statsData.recentUsages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Usages</h3>
                    <div className="space-y-2">
                      {statsData.recentUsages.map((usage: any) => (
                        <div key={usage.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {usage.coupon?.name} ({usage.coupon?.code})
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Order #{usage.order?.orderNumber} • {usage.buyer?.firstName} {usage.buyer?.lastName}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-emerald-600">
                                -{formatUSD(usage.discountAmount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDateWithTime(usage.usedAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No statistics available</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

