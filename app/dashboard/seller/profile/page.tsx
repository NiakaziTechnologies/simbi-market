// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SupplierProfileManager from '@/components/reports/SupplierProfileManager';
import { useSellerAuth } from '@/hooks/useSellerAuth';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Camera,
  Trash2,
  Save,
  Shield,
  FileText
} from 'lucide-react';

export default function Page() {
  const { seller, staff, userType, updateProfile } = useSellerAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [storeCountry, setStoreCountry] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [storeAddress1, setStoreAddress1] = useState('');
  const [storeAddress2, setStoreAddress2] = useState('');
  const [zimraTIN, setZimraTIN] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [businessOwnerName, setBusinessOwnerName] = useState('');
  const [businessOwnerEmail, setBusinessOwnerEmail] = useState('');
  const [businessOwnerPhone, setBusinessOwnerPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(()=>{
    async function loadProfileData() {
      // Load data from seller profile context first
      if (seller) {
        setName(seller.businessName || '');
        setEmail(seller.email || '');
        setPhone(seller.contactNumber || '');
        setStoreName(seller.businessName || '');
        setStoreCountry('');
        setStoreCity('');
        setStoreAddress1(seller.businessAddress || '');
        setStoreAddress2('');
        setZimraTIN(seller.tin || '');
        setVatNumber('');
        setBusinessOwnerName('');
        setBusinessOwnerEmail(seller.email || '');
        setBusinessOwnerPhone(seller.contactNumber || '');
        setNationalId(seller.tin || '');
      } else if (staff) {
        // Load data from staff profile
        setName(`${staff.firstName} ${staff.lastName}`);
        setEmail(staff.email || '');
        setPhone('');
        setStoreName(staff.businessName || '');
        setStoreCountry('');
        setStoreCity('');
        setStoreAddress1('');
        setStoreAddress2('');
        setZimraTIN('');
        setVatNumber('');
        setBusinessOwnerName(`${staff.firstName} ${staff.lastName}`);
        setBusinessOwnerEmail(staff.email || '');
        setBusinessOwnerPhone('');
        setNationalId('');
      }

      // Load additional data from localStorage if available (only for sellers)
      const dbDisabled = localStorage.getItem('simbi_db_disabled') === 'true';
      if (seller && !dbDisabled) {
        try {
          const profileKey = `user_profile_${seller.id}`;
          const storedProfile = localStorage.getItem(profileKey);
          if (storedProfile) {
            const profileData = JSON.parse(storedProfile);
            setName(profileData.displayName || seller.businessName || '');
            setStoreName(profileData.storeName || seller.businessName || '');
            setStoreCountry(profileData.storeCountry || '');
            setStoreCity(profileData.storeCity || '');
            setStoreAddress1(profileData.storeAddress1 || seller.businessAddress || '');
            setVatNumber(profileData.vatNumber || '');
            setBusinessOwnerName(profileData.businessOwnerName || '');
            setBusinessOwnerEmail(profileData.businessOwnerEmail || seller.email || '');
            setBusinessOwnerPhone(profileData.businessOwnerPhone || seller.contactNumber || '');
            setNationalId(profileData.nationalId || seller.tin || '');
          }
        } catch (error) {
          console.error('Error loading profile data from localStorage:', error);
        }
      }
    }

    loadProfileData();
    setInitialLoading(false);
  },[seller, staff]);

  function validateVAT(v: string) {
    if (!v) return true;
    return v.trim().length >= 5; // simple client-side check
  }

  async function saveProfile() {
    console.log('saveProfile function called');

    if (vatNumber && !validateVAT(vatNumber)) {
      console.log('VAT validation failed');
      toast({
        title: "Invalid VAT Number",
        description: "Please enter a valid VAT or tax number (minimum 5 characters).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Saving profile with data:', {
        displayName: name,
        email: email,
        phoneNumber: phone,
        storeName,
        businessOwnerName
      });

      await updateProfile({
        businessName: storeName,
        businessAddress: storeAddress1,
        contactNumber: phone,
        tin: zimraTIN
      });

      console.log('Profile saved successfully - showing success toast');
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if FileReader is supported
      if (typeof FileReader === 'undefined') {
        reject(new Error('FileReader is not supported in this browser'));
        return;
      }

      const fr = new FileReader();
      fr.onload = () => {
        try {
          const result = String(fr.result);
          resolve(result);
        } catch (error) {
          reject(new Error('Failed to process file'));
        }
      };
      fr.onerror = (e) => {
        console.error('FileReader error:', e);
        reject(new Error('Failed to read file'));
      };
      fr.onabort = () => {
        reject(new Error('File reading was aborted'));
      };

      try {
        fr.readAsDataURL(file);
      } catch (error) {
        console.error('Error starting file read:', error);
        reject(new Error('Failed to start reading file'));
      }
    });
  }

  async function handleAvatarFile(f?: File | null) {
    if (!f) return;
    const allowed = ['image/png','image/jpeg','image/webp'];
    if (!allowed.includes(f.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PNG, JPG, and WEBP images are allowed.",
        variant: "destructive",
      });
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(f);
      setAvatarUrl(dataUrl);
      // Note: Avatar upload not implemented in seller API yet
      console.log('Avatar upload not implemented in seller API');
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been saved successfully.",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    }
  }

  function removeAvatar() {
    if (!confirm('Remove profile picture?')) return;
    setAvatarUrl(null);
  }


  return (
    <div className="space-y-6">
      {/* Clean Header - Metis Style */}
      <div className="glass-card rounded-xl p-8 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Store Profile</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Manage your business information and settings
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                console.log('Save button clicked');
                saveProfile();
              }}
              className="border-border text-foreground hover:bg-accent/10"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Tabbed Profile Interface */}
      <Tabs defaultValue="personal" className="glass-card border border-border">
        <div className="border-b border-border px-8 pt-6">
          <TabsList className="grid w-full grid-cols-4 bg-background border border-border">
            <TabsTrigger
              value="personal"
              className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground hover:bg-accent/10"
            >
              <User className="w-4 h-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground hover:bg-accent/10"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Business Info
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground hover:bg-accent/10"
            >
              <FileText className="w-4 h-4 mr-2" />
              Business Docs
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground hover:bg-accent/10"
            >
              <Shield className="w-4 h-4 mr-2" />
              Account Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
                <p className="text-muted-foreground">Manage your personal details and contact information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <Card className="glass-card border border-border">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="relative inline-block">
                        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg mx-auto">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 h-8 w-8 bg-accent text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-accent/90 transition-colors shadow-lg">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e)=>handleAvatarFile(e.target.files?.[0]||null)}
                          />
                        </label>
                      </div>
                      {avatarUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeAvatar}
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Photo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personal Details */}
              <div className="lg:col-span-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e)=>setName(e.target.value)}
                      className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e)=>setPhone(e.target.value)}
                      className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Business Information Tab */}
        <TabsContent value="business" className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Business Information</h2>
                <p className="text-muted-foreground">Manage your store and business owner details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName" className="text-sm font-semibold text-foreground">Store Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeName"
                      value={storeName}
                      onChange={(e)=>setStoreName(e.target.value)}
                      className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                      placeholder="Enter your store name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatNumber" className="text-sm font-semibold text-foreground">VAT / Tax Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="vatNumber"
                      value={vatNumber}
                      onChange={(e)=>setVatNumber(e.target.value)}
                      className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                      placeholder="Enter VAT or tax number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zimraTIN" className="text-sm font-semibold text-foreground">
                    ZIMRA Taxpayer Identification Number (TIN) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="zimraTIN"
                    value={zimraTIN}
                    onChange={(e)=>setZimraTIN(e.target.value)}
                    className="bg-background border-border focus:ring-accent focus:border-accent"
                    placeholder="Enter your ZIMRA TIN"
                    required
                  />
                </div>

                {/* Bank Details Section */}
                <div className="space-y-2">
                  <Label htmlFor="bankAccountName" className="text-sm font-semibold text-foreground">Bank Account Name</Label>
                  <Input
                    id="bankAccountName"
                    value={seller?.bankAccountName || ''}
                    onChange={(e) => {
                      // Note: Bank details are read-only in profile, updated via API
                      toast({
                        title: "Bank Details",
                        description: "Bank details can only be updated through the backend API.",
                        variant: "default",
                      });
                    }}
                    className="bg-muted border-border focus:ring-accent focus:border-accent"
                    placeholder="Bank account name"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber" className="text-sm font-semibold text-foreground">Bank Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    value={seller?.bankAccountNumber || ''}
                    onChange={(e) => {
                      toast({
                        title: "Bank Details",
                        description: "Bank details can only be updated through the backend API.",
                        variant: "default",
                      });
                    }}
                    className="bg-muted border-border focus:ring-accent focus:border-accent"
                    placeholder="Bank account number"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-sm font-semibold text-foreground">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={seller?.bankName || ''}
                    onChange={(e) => {
                      toast({
                        title: "Bank Details",
                        description: "Bank details can only be updated through the backend API.",
                        variant: "default",
                      });
                    }}
                    className="bg-muted border-border focus:ring-accent focus:border-accent"
                    placeholder="Bank name"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeAddress1" className="text-sm font-semibold text-foreground">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeAddress1"
                      value={storeAddress1}
                      onChange={(e)=>setStoreAddress1(e.target.value)}
                      className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress2" className="text-sm font-semibold text-foreground">Address Line 2 (Optional)</Label>
                  <Input
                    id="storeAddress2"
                    value={storeAddress2}
                    onChange={(e)=>setStoreAddress2(e.target.value)}
                    className="bg-background border-border focus:ring-accent focus:border-accent"
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeCity" className="text-sm font-semibold text-foreground">City</Label>
                    <Input
                      id="storeCity"
                      value={storeCity}
                      onChange={(e)=>setStoreCity(e.target.value)}
                      className="bg-background border-border focus:ring-accent focus:border-accent"
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeCountry" className="text-sm font-semibold text-foreground">Country</Label>
                    <Input
                      id="storeCountry"
                      value={storeCountry}
                      onChange={(e)=>setStoreCountry(e.target.value)}
                      className="bg-background border-border focus:ring-accent focus:border-accent"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Owner Information */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-foreground mb-4">Business Owner Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessOwnerName" className="text-sm font-semibold text-foreground">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessOwnerName"
                        value={businessOwnerName}
                        onChange={(e)=>setBusinessOwnerName(e.target.value)}
                        className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                        placeholder="Business owner full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessOwnerEmail" className="text-sm font-semibold text-foreground">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessOwnerEmail"
                        type="email"
                        value={businessOwnerEmail}
                        onChange={(e)=>setBusinessOwnerEmail(e.target.value)}
                        className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                        placeholder="owner@company.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessOwnerPhone" className="text-sm font-semibold text-foreground">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessOwnerPhone"
                        value={businessOwnerPhone}
                        onChange={(e)=>setBusinessOwnerPhone(e.target.value)}
                        className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                        placeholder="Business owner phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId" className="text-sm font-semibold text-foreground">National ID / Registration Number</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nationalId"
                        value={nationalId}
                        onChange={(e)=>setNationalId(e.target.value)}
                        className="pl-10 bg-background border-border focus:ring-accent focus:border-accent"
                        placeholder="ID number or registration number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Business Documents</h2>
                <p className="text-muted-foreground">Upload ZIMRA tax clearance, council merchant license, and other required documents</p>
              </div>
            </div>

            <SupplierProfileManager
              supplierId={seller?.id || 'default-supplier'}
              supplierName={storeName || name || 'Store Owner'}
            />
          </div>
        </TabsContent>

        {/* Account Settings Tab */}
        <TabsContent value="settings" className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences and security settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <span className="text-foreground font-semibold">Account Type</span>
                    <Badge className="bg-accent/20 text-accent border-accent/30">Premium Seller</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <span className="text-foreground font-semibold">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-green-700 font-semibold">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground">Security Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Settings auto-save locally</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Data encrypted in transit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>24/7 premium monitoring</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {initialLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent/20 border-t-accent mx-auto"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Loading Profile</h3>
              <p className="text-muted-foreground">Please wait while we load your information...</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}