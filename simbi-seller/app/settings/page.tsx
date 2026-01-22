// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Bell,
  Shield,
  Database,
  AlertTriangle,
  Save,
  RefreshCw,
  Mail,
  BarChart3,
  Lock,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';

export default function Page() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [paymentNotifications, setPaymentNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Business Settings
  const [taxSettings, setTaxSettings] = useState('inclusive');
  const [autoBackup, setAutoBackup] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem('simbi_settings');
      if (raw) {
        try {
          const s = JSON.parse(raw);
          setEmailNotifications(typeof s.emailNotifications === 'boolean' ? s.emailNotifications : true);
          setPushNotifications(typeof s.pushNotifications === 'boolean' ? s.pushNotifications : true);
          setOrderNotifications(typeof s.orderNotifications === 'boolean' ? s.orderNotifications : true);
          setPaymentNotifications(typeof s.paymentNotifications === 'boolean' ? s.paymentNotifications : true);
          setMarketingEmails(typeof s.marketingEmails === 'boolean' ? s.marketingEmails : false);
          setTwoFactorAuth(typeof s.twoFactorAuth === 'boolean' ? s.twoFactorAuth : false);
          setSessionTimeout(s.sessionTimeout || '30');
          setTaxSettings(s.taxSettings || 'inclusive');
          setAutoBackup(typeof s.autoBackup === 'boolean' ? s.autoBackup : true);
          setAnalyticsEnabled(typeof s.analyticsEnabled === 'boolean' ? s.analyticsEnabled : true);
        } catch (parseError) {
          console.error('Error parsing settings from localStorage:', parseError);
          localStorage.removeItem('simbi_settings');
        }
      }
    } catch (storageError) {
      console.error('Error accessing localStorage:', storageError);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const settings = {
        emailNotifications,
        pushNotifications,
        orderNotifications,
        paymentNotifications,
        marketingEmails,
        twoFactorAuth,
        sessionTimeout,
        taxSettings,
        autoBackup,
        analyticsEnabled,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('simbi_settings', JSON.stringify(settings));

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const clearDemoData = () => {
    if (confirm('Clear all demo data? This will remove all local data and cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Clean Header - Metis Style */}
        <div className="bg-white border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                Settings
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Manage your notification preferences, security settings, and account configuration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={loadSettings}
                disabled={loading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={saveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabbed Settings Interface */}
        <Tabs defaultValue="notifications" className="bg-white border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-8 pt-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Business
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
              >
                <Settings className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-gray-600">Manage your notification preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-gray-700">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-gray-700">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-gray-700">Order Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified when orders are placed</p>
                  </div>
                  <Switch
                    checked={orderNotifications}
                    onCheckedChange={setOrderNotifications}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-gray-700">Payment Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified about payment status updates</p>
                  </div>
                  <Switch
                    checked={paymentNotifications}
                    onCheckedChange={setPaymentNotifications}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-gray-700">Marketing Communications</Label>
                    <p className="text-sm text-gray-600">Receive exclusive offers and updates</p>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Security & Privacy</h2>
                  <p className="text-gray-600">Manage your account security and privacy settings</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-gray-700">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">Session Timeout</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="w-64 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Business Settings</h2>
                  <p className="text-gray-600">Configure your business preferences and settings</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">Tax Configuration</Label>
                  <Select value={taxSettings} onValueChange={setTaxSettings}>
                    <SelectTrigger className="w-64 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                      <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                      <SelectItem value="none">No Tax</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">How taxes are calculated and displayed in your store</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-gray-700">Auto Backup</Label>
                    <p className="text-sm text-gray-600">Automatically backup your data daily</p>
                  </div>
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-gray-700">Analytics</Label>
                    <p className="text-sm text-gray-600">Help improve the platform with anonymous usage data</p>
                  </div>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={setAnalyticsEnabled}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                  <p className="text-gray-600">Manage your account preferences and status</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-900">Account Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-700 font-semibold">Account Type</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Seller</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-700 font-semibold">Status</span>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-green-700 font-semibold">Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-900">Security Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 text-sm text-gray-600">
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
                        <span>24/7 monitoring</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Danger Zone */}
              <Card className="bg-white border-2 border-red-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-red-700 flex items-center gap-3">
                    <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Irreversible actions that affect your account
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={clearDemoData}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
