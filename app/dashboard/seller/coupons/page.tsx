"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Copy,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  DollarSign,
  Percent
} from "lucide-react";

// Mock formatUSD function
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Mock coupons data
const mockCoupons = [
  {
    id: "COUP-001",
    name: "Welcome Discount",
    description: "10% off your first order",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderAmount: 50,
    maximumDiscount: null,
    isActive: true,
    usageLimit: 100,
    usedCount: 23,
    validFrom: "2024-01-01T00:00:00Z",
    validUntil: "2024-12-31T23:59:59Z",
    code: "WELCOME10"
  },
  {
    id: "COUP-002",
    name: "Flash Sale",
    description: "$25 off orders over $200",
    discountType: "fixed",
    discountValue: 25,
    minimumOrderAmount: 200,
    maximumDiscount: null,
    isActive: true,
    usageLimit: 50,
    usedCount: 12,
    validFrom: "2024-01-15T00:00:00Z",
    validUntil: "2024-01-31T23:59:59Z",
    code: "FLASH25"
  },
  {
    id: "COUP-003",
    name: "Loyalty Reward",
    description: "15% off for returning customers",
    discountType: "percentage",
    discountValue: 15,
    minimumOrderAmount: 75,
    maximumDiscount: 50,
    isActive: false,
    usageLimit: 200,
    usedCount: 89,
    validFrom: "2024-01-01T00:00:00Z",
    validUntil: "2024-06-30T23:59:59Z",
    code: "LOYALTY15"
  }
];

const getStatusBadge = (isActive: boolean, validUntil: string) => {
  const now = new Date();
  const expiry = new Date(validUntil);
  const isExpired = expiry < now;

  if (isExpired) {
    return <Badge className="border-gray-500/30 text-gray-400 bg-gray-500/5">Expired</Badge>;
  }
  if (isActive) {
    return <Badge className="border-green-500/30 text-green-400 bg-green-500/5">Active</Badge>;
  }
  return <Badge className="border-yellow-500/30 text-yellow-400 bg-yellow-500/5">Inactive</Badge>;
};

export default function Page() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscount: '',
    isActive: true,
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    code: ''
  });

  // Load coupons
  const loadCoupons = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setCoupons(mockCoupons);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = () => {
    const newCoupon = {
      ...formData,
      id: `COUP-${Date.now()}`,
      usedCount: 0,
      discountValue: parseFloat(formData.discountValue),
      minimumOrderAmount: parseFloat(formData.minimumOrderAmount) || 0,
      maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
      usageLimit: parseInt(formData.usageLimit) || null
    };
    setCoupons([...coupons, newCoupon]);
    setCreateModalOpen(false);
    resetForm();
  };

  const handleEditCoupon = () => {
    const updatedCoupons = coupons.map(coupon =>
      coupon.id === selectedCoupon.id ? { ...selectedCoupon, ...formData } : coupon
    );
    setCoupons(updatedCoupons);
    setEditModalOpen(false);
    resetForm();
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(coupons.filter(coupon => coupon.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: '',
      maximumDiscount: '',
      isActive: true,
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      code: ''
    });
  };

  const openEditModal = (coupon: any) => {
    setSelectedCoupon(coupon);
    setFormData({
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumOrderAmount: coupon.minimumOrderAmount?.toString() || '',
      maximumDiscount: coupon.maximumDiscount?.toString() || '',
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit?.toString() || '',
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      code: coupon.code
    });
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-4">
              <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              Coupon Management
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Create and manage discount coupons for your customers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
            <Button
              variant="outline"
              onClick={loadCoupons}
              disabled={loading}
              className="border-border text-foreground hover:bg-accent/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card border border-border">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : coupons.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No coupons yet</h3>
            <p className="text-muted-foreground mb-6">Create your first coupon to start offering discounts</p>
            <Button onClick={() => setCreateModalOpen(true)} className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </div>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="glass-card border border-border hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">{coupon.name}</CardTitle>
                  {getStatusBadge(coupon.isActive, coupon.validUntil)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-accent" />
                    <span className="font-mono text-sm bg-muted/30 px-2 py-1 rounded">{coupon.code}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{coupon.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-semibold text-accent">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : formatUSD(coupon.discountValue)
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Min. Order:</span>
                    <span className="font-medium text-foreground">
                      {coupon.minimumOrderAmount ? formatUSD(coupon.minimumOrderAmount) : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Usage:</span>
                    <span className="font-medium text-foreground">
                      {coupon.usedCount}/{coupon.usageLimit || '∞'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-medium text-foreground">
                      {new Date(coupon.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCoupon(coupon);
                      setViewModalOpen(true);
                    }}
                    className="flex-1 border-border text-foreground hover:bg-accent/10"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(coupon)}
                    className="flex-1 border-border text-foreground hover:bg-accent/10"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="border-border text-foreground hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Coupon Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Coupon</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Coupon Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-background border-border"
                placeholder="e.g., Welcome Discount"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Coupon Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="bg-background border-border font-mono"
                placeholder="e.g., WELCOME10"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-foreground">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-background border-border"
                placeholder="Describe the coupon offer"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Discount Type</Label>
              <Select value={formData.discountType} onValueChange={(value) => setFormData({...formData, discountType: value})}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Discount Value</Label>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                className="bg-background border-border"
                placeholder={formData.discountType === 'percentage' ? '10' : '25.00'}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Minimum Order Amount</Label>
              <Input
                type="number"
                value={formData.minimumOrderAmount}
                onChange={(e) => setFormData({...formData, minimumOrderAmount: e.target.value})}
                className="bg-background border-border"
                placeholder="50.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Usage Limit</Label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                className="bg-background border-border"
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Valid From</Label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Valid Until</Label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                className="bg-background border-border"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="border-border text-foreground">
              Cancel
            </Button>
            <Button onClick={handleCreateCoupon} className="bg-accent hover:bg-accent/90">
              Create Coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Coupon</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Coupon Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Coupon Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="bg-background border-border font-mono"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-foreground">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Discount Type</Label>
              <Select value={formData.discountType} onValueChange={(value) => setFormData({...formData, discountType: value})}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Discount Value</Label>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Minimum Order Amount</Label>
              <Input
                type="number"
                value={formData.minimumOrderAmount}
                onChange={(e) => setFormData({...formData, minimumOrderAmount: e.target.value})}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Usage Limit</Label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Valid From</Label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Valid Until</Label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                className="bg-background border-border"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setEditModalOpen(false)} className="border-border text-foreground">
              Cancel
            </Button>
            <Button onClick={handleEditCoupon} className="bg-accent hover:bg-accent/90">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Coupon Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Coupon Details</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg mb-4">
                  <Ticket className="w-5 h-5 text-accent" />
                  <span className="font-mono text-lg font-bold text-accent">{selectedCoupon.code}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{selectedCoupon.name}</h3>
                <p className="text-muted-foreground">{selectedCoupon.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {selectedCoupon.discountType === 'percentage'
                      ? `${selectedCoupon.discountValue}%`
                      : formatUSD(selectedCoupon.discountValue)
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Discount</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {selectedCoupon.usedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Times Used</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{getStatusBadge(selectedCoupon.isActive, selectedCoupon.validUntil)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min. Order:</span>
                  <span className="font-medium">{selectedCoupon.minimumOrderAmount ? formatUSD(selectedCoupon.minimumOrderAmount) : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usage Limit:</span>
                  <span className="font-medium">{selectedCoupon.usageLimit || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid Until:</span>
                  <span className="font-medium">{new Date(selectedCoupon.validUntil).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}