"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getSellerProfile,
  updateSellerProfile,
  type SellerProfile,
  type UpdateSellerProfileRequest,
} from "@/lib/api/seller-profile"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<UpdateSellerProfileRequest>({
    businessName: "",
    tradingName: "",
    businessAddress: "",
    contactNumber: "",
    registrationNumber: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
  })

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getSellerProfile()
      setProfile(data)
      setFormData({
        businessName: data.businessName || "",
        tradingName: data.tradingName || "",
        businessAddress: data.businessAddress || "",
        contactNumber: data.contactNumber || "",
        registrationNumber: data.registrationNumber || "",
        bankAccountName: data.bankAccountName || "",
        bankAccountNumber: data.bankAccountNumber || "",
        bankName: data.bankName || "",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async () => {
    if (!formData.businessName?.trim()) {
      toast({
        title: "Error",
        description: "Business name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.businessAddress?.trim()) {
      toast({
        title: "Error",
        description: "Business address is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.contactNumber?.trim()) {
      toast({
        title: "Error",
        description: "Contact number is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const updatedProfile = await updateSellerProfile(formData)
      setProfile(updatedProfile)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || "",
        tradingName: profile.tradingName || "",
        businessAddress: profile.businessAddress || "",
        contactNumber: profile.contactNumber || "",
        registrationNumber: profile.registrationNumber || "",
        bankAccountName: profile.bankAccountName || "",
        bankAccountNumber: profile.bankAccountNumber || "",
        bankName: profile.bankName || "",
      })
    }
    setIsEditing(false)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      "ACTIVE": { label: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      "SUSPENDED": { label: "Suspended", className: "bg-red-500/20 text-red-400 border-red-500/30" },
      "INACTIVE": { label: "Inactive", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
      "PENDING_VERIFICATION": { label: "Pending Verification", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    }
    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground font-light">
              View and edit your profile information
            </p>
          </div>
          {!isEditing && profile && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Account Status Card */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(profile.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">SRI Score</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-foreground font-medium">{profile.sriScore.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Eligibility</Label>
                  <div className="mt-1">
                    {profile.isEligible ? (
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Eligible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Eligible
                      </Badge>
                    )}
                  </div>
                </div>
                {profile.lastSriCalculation && !isNaN(new Date(profile.lastSriCalculation).getTime()) && (
                  <div>
                    <Label className="text-muted-foreground">Last SRI Calculation</Label>
                    <div className="mt-1 text-sm text-foreground">
                      {format(new Date(profile.lastSriCalculation), "MMM dd, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">MFA Enabled</Label>
                  <div className="mt-1">
                    {profile.mfaEnabled ? (
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Shadow Banned</Label>
                  <div className="mt-1">
                    {profile.isShadowBanned ? (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        No
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">
                        Business Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="Enter business name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tradingName">Trading Name</Label>
                      <Input
                        id="tradingName"
                        value={formData.tradingName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, tradingName: e.target.value || null }))}
                        placeholder="Enter trading name (optional)"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">
                      Business Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="businessAddress"
                      value={formData.businessAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
                      placeholder="Enter business address"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">
                        Contact Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                        placeholder="Enter contact number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value || null }))}
                        placeholder="Enter registration number (optional)"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Business Name</Label>
                      <div className="mt-1 text-foreground font-medium">{profile.businessName}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Trading Name</Label>
                      <div className="mt-1 text-foreground">
                        {profile.tradingName || <span className="text-muted-foreground italic">Not set</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Business Address
                    </Label>
                    <div className="mt-1 text-foreground">{profile.businessAddress}</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Number
                      </Label>
                      <div className="mt-1 text-foreground">{profile.contactNumber}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Registration Number</Label>
                      <div className="mt-1 text-foreground">
                        {profile.registrationNumber || <span className="text-muted-foreground italic">Not set</span>}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Banking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountName">Bank Account Name</Label>
                    <Input
                      id="bankAccountName"
                      value={formData.bankAccountName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankAccountName: e.target.value || null }))}
                      placeholder="Enter bank account name (optional)"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                      <Input
                        id="bankAccountNumber"
                        value={formData.bankAccountNumber || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, bankAccountNumber: e.target.value || null }))}
                        placeholder="Enter account number (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value || null }))}
                        placeholder="Enter bank name (optional)"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Bank Account Name</Label>
                    <div className="text-foreground">
                      {profile.bankAccountName || <span className="text-muted-foreground italic">Not set</span>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Bank Account Number</Label>
                      <div className="mt-1 text-foreground">
                        {profile.bankAccountNumber || <span className="text-muted-foreground italic">Not set</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Bank Name</Label>
                      <div className="mt-1 text-foreground">
                        {profile.bankName || <span className="text-muted-foreground italic">Not set</span>}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Read-Only Information */}
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                This information cannot be changed via the profile page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <div className="mt-1 text-foreground">{profile.email}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tax Identification Number (TIN)</Label>
                  <div className="mt-1 text-foreground font-mono">{profile.tin}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Account Created</Label>
                  <div className="mt-1 text-sm text-foreground">
                    {profile.createdAt && !isNaN(new Date(profile.createdAt).getTime()) 
                      ? format(new Date(profile.createdAt), "MMMM dd, yyyy 'at' h:mm a")
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <div className="mt-1 text-sm text-foreground">
                    {profile.updatedAt && !isNaN(new Date(profile.updatedAt).getTime())
                      ? format(new Date(profile.updatedAt), "MMMM dd, yyyy 'at' h:mm a")
                      : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-accent hover:bg-accent/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Failed to load profile</p>
            <Button onClick={loadProfile} className="mt-4" variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
