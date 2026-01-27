"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Save, User, Building2, MapPin, Mail, Phone, Globe, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getBuyerProfile, updateBuyerProfile, type BuyerProfile, type UpdateBuyerProfileRequest } from "@/lib/api/buyer-profile"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<BuyerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<UpdateBuyerProfileRequest>({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const data = await getBuyerProfile()
      setProfile(data)
      // Initialize form data with current profile values
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        companyName: data.companyName,
        registrationNumber: data.registrationNumber,
        taxId: data.taxId,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        creditLimit: data.creditLimit,
        paymentTermDays: data.paymentTermDays,
        currency: data.currency,
        monthlySpendingLimit: data.monthlySpendingLimit,
        businessType: data.businessType,
        industry: data.industry,
        website: data.website,
        description: data.description,
        numberOfEmployees: data.numberOfEmployees,
        establishedYear: data.establishedYear,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        country: data.country,
        preferredContactMethod: data.preferredContactMethod,
        marketingConsent: data.marketingConsent,
        termsAccepted: data.termsAccepted,
      })
    } catch (error: any) {
      console.error("Error loading profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to load profile",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updatedProfile = await updateBuyerProfile(formData)
      setProfile(updatedProfile)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to update profile",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = <K extends keyof UpdateBuyerProfileRequest>(
    field: K,
    value: UpdateBuyerProfileRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="glass-card rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    )
  }

  const isCommercial = profile.buyerType === 'COMMERCIAL'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Account Settings
        </h1>
        <p className="text-muted-foreground font-light">
          Manage your profile information and preferences
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-light text-foreground">Personal Information</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName || ""}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName || ""}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={(e) => updateField("phoneNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>
        </motion.div>

        {/* Commercial Buyer Fields */}
        {isCommercial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-light text-foreground">Company Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ""}
                  onChange={(e) => updateField("companyName", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber || ""}
                  onChange={(e) => updateField("registrationNumber", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId || ""}
                  onChange={(e) => updateField("taxId", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={(e) => updateField("contactEmail", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone || ""}
                  onChange={(e) => updateField("contactPhone", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => updateField("website", e.target.value || null)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value || null)}
                  className="min-h-24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  value={formData.businessType || ""}
                  onChange={(e) => updateField("businessType", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry || ""}
                  onChange={(e) => updateField("industry", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfEmployees">Number of Employees</Label>
                <Input
                  id="numberOfEmployees"
                  type="number"
                  value={formData.numberOfEmployees || ""}
                  onChange={(e) => updateField("numberOfEmployees", e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishedYear">Established Year</Label>
                <Input
                  id="establishedYear"
                  type="number"
                  value={formData.establishedYear || ""}
                  onChange={(e) => updateField("establishedYear", e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Commercial Buyer Financial Fields */}
        {isCommercial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-light text-foreground">Financial Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  value={formData.billingAddress || ""}
                  onChange={(e) => updateField("billingAddress", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Input
                  id="shippingAddress"
                  value={formData.shippingAddress || ""}
                  onChange={(e) => updateField("shippingAddress", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={formData.creditLimit || ""}
                  onChange={(e) => updateField("creditLimit", e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTermDays">Payment Term Days</Label>
                <Input
                  id="paymentTermDays"
                  type="number"
                  value={formData.paymentTermDays || ""}
                  onChange={(e) => updateField("paymentTermDays", e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency || ""}
                  onChange={(e) => updateField("currency", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlySpendingLimit">Monthly Spending Limit</Label>
                <Input
                  id="monthlySpendingLimit"
                  type="number"
                  value={formData.monthlySpendingLimit || ""}
                  onChange={(e) => updateField("monthlySpendingLimit", e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Address Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-light text-foreground">Address Information</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1 || ""}
                onChange={(e) => updateField("addressLine1", e.target.value || null)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2 || ""}
                onChange={(e) => updateField("addressLine2", e.target.value || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => updateField("city", e.target.value || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province/State</Label>
              <Input
                id="province"
                value={formData.province || ""}
                onChange={(e) => updateField("province", e.target.value || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode || ""}
                onChange={(e) => updateField("postalCode", e.target.value || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ""}
                onChange={(e) => updateField("country", e.target.value || null)}
              />
            </div>
          </div>
        </motion.div>

        {/* Contact Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Mail className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-light text-foreground">Contact Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select
                value={formData.preferredContactMethod || "NONE"}
                onValueChange={(value) => updateField("preferredContactMethod", value === "NONE" ? null : value as 'EMAIL' | 'PHONE' | 'SMS')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketingConsent">Marketing Consent</Label>
                <p className="text-sm text-muted-foreground">
                  Allow us to send you marketing communications
                </p>
              </div>
              <Switch
                id="marketingConsent"
                checked={formData.marketingConsent ?? false}
                onCheckedChange={(checked) => updateField("marketingConsent", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="termsAccepted">Terms Accepted</Label>
                <p className="text-sm text-muted-foreground">
                  I accept the terms and conditions
                </p>
              </div>
              <Switch
                id="termsAccepted"
                checked={formData.termsAccepted ?? false}
                onCheckedChange={(checked) => updateField("termsAccepted", checked)}
              />
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-end gap-4"
        >
          <Button type="submit" disabled={isSaving}>
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
        </motion.div>
      </form>
    </div>
  )
}
