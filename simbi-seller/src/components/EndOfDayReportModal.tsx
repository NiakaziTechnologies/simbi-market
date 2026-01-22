// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Clock, Package, TrendingDown, CheckCircle, XCircle, AlertCircle, Calendar, DollarSign, TrendingUp, Settings } from "lucide-react";
// Simple frontend-only types and functions
interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  priority?: string;
  daysOld?: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface EndOfDayNotificationSettings {
  enabled: boolean;
  notificationTime: number;
  includeEmail: boolean;
  includeInApp: boolean;
  emailAddress: string;
}

function generateEndOfDayReport(orders: Order[], products: Product[]) {
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const uncompletedOrders = totalOrders - completedOrders;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;

  const uncompletedOrderDetails = orders
    .filter(o => o.status !== 'completed')
    .map(order => ({
      ...order,
      daysOld: order.daysOld || 1,
      priority: order.priority || 'normal'
    }));

  const criticalOrders = uncompletedOrderDetails.filter(o => o.daysOld >= 7).length;
  const highPriorityOrders = uncompletedOrderDetails.filter(o => o.priority === 'high').length;

  const averageOrderAge = uncompletedOrderDetails.length > 0
    ? Math.round(uncompletedOrderDetails.reduce((sum, order) => sum + order.daysOld, 0) / uncompletedOrderDetails.length)
    : 0;

  const oldestOrderAge = uncompletedOrderDetails.length > 0
    ? Math.max(...uncompletedOrderDetails.map(o => o.daysOld))
    : 0;

  const potentialLosses = uncompletedOrderDetails.reduce((sum, order) => sum + order.total, 0);

  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const topUncompletedProducts = uncompletedOrderDetails
    .flatMap(order => order.items)
    .reduce((acc: any[], item) => {
      const existing = acc.find(p => p.name === item.productName);
      if (existing) {
        existing.count += item.quantity;
        existing.totalValue += item.price * item.quantity;
      } else {
        acc.push({
          name: item.productName,
          count: item.quantity,
          totalValue: item.price * item.quantity
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  return {
    summary: {
      totalOrders,
      completedOrders,
      uncompletedOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      criticalOrders,
      highPriorityOrders,
      averageOrderAge,
      oldestOrderAge,
      potentialLosses
    },
    uncompletedOrderDetails,
    insights: {
      completionRate,
      averageFulfillmentTime: 24,
      topUncompletedProducts
    },
    recommendations: [
      'Focus on completing orders older than 3 days',
      'Review high-priority items first',
      'Consider bulk processing for similar items'
    ]
  };
}

function getEndOfDayNotificationSettings(): EndOfDayNotificationSettings {
  const stored = localStorage.getItem('endOfDayNotificationSettings');
  return stored ? JSON.parse(stored) : {
    enabled: true,
    notificationTime: 18,
    includeEmail: false,
    includeInApp: true,
    emailAddress: ''
  };
}

function saveEndOfDayNotificationSettings(settings: EndOfDayNotificationSettings): void {
  localStorage.setItem('endOfDayNotificationSettings', JSON.stringify(settings));
}
import { formatUSD } from "@/lib/currency";
import { formatDateWithTime } from "@/lib/date";

interface EndOfDayReportModalProps {
  children: React.ReactNode;
  orders: Order[];
  products: Product[];
}

export function EndOfDayReportModal({ children, orders, products }: EndOfDayReportModalProps) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<EndOfDayNotificationSettings>({
    enabled: true,
    notificationTime: 18,
    includeEmail: false,
    includeInApp: true,
    emailAddress: ''
  });

  useEffect(() => {
    if (open && orders.length > 0) {
      const reportData = generateEndOfDayReport(orders, products);
      setReport(reportData);
    }
  }, [open, orders, products]);

  useEffect(() => {
    // Load notification settings
    const settings = getEndOfDayNotificationSettings();
    setNotificationSettings(settings);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-slate-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-amber-500" />;
      case 'shipped':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
      case 'processing':
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700";
      case 'shipped':
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
      default:
        return "bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const getUrgencyLevel = (daysOld: number) => {
    if (daysOld >= 7) return { level: 'critical', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-700' };
    if (daysOld >= 3) return { level: 'high', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-700' };
    return { level: 'normal', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-700' };
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
    }
  };

  if (!report) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">Generating end-of-day report...</p>
            </div>
          </div>
        </DialogContent>
  
        {/* Notification Settings Modal */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Settings className="w-5 h-5" />
                End-of-Day Notification Settings
              </DialogTitle>
            </DialogHeader>
  
            <div className="space-y-6">
              {/* Enable/Disable Notifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Enable Notifications
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Receive daily reports on uncompleted orders
                    </p>
                  </div>
                  <Button
                    variant={notificationSettings.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newSettings = {
                        ...notificationSettings,
                        enabled: !notificationSettings.enabled
                      };
                      setNotificationSettings(newSettings);
                      saveEndOfDayNotificationSettings(newSettings);
                    }}
                    className={notificationSettings.enabled
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : ""
                    }
                  >
                    {notificationSettings.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
  
              {/* Notification Time */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notification Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[9, 12, 15, 18, 20, 22].map((hour) => (
                    <Button
                      key={hour}
                      variant={notificationSettings.notificationTime === hour ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newSettings = {
                          ...notificationSettings,
                          notificationTime: hour
                        };
                        setNotificationSettings(newSettings);
                        saveEndOfDayNotificationSettings(newSettings);
                      }}
                      className={`text-xs ${
                        notificationSettings.notificationTime === hour
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : ""
                      }`}
                    >
                      {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current setting: {notificationSettings.notificationTime > 12
                    ? `${notificationSettings.notificationTime - 12} PM`
                    : `${notificationSettings.notificationTime} AM`}
                </p>
              </div>
  
              {/* Notification Methods */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notification Methods
                </label>
  
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">In-App Notifications</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Show notifications in the dashboard</p>
                    </div>
                    <Button
                      variant={notificationSettings.includeInApp ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newSettings = {
                          ...notificationSettings,
                          includeInApp: !notificationSettings.includeInApp
                        };
                        setNotificationSettings(newSettings);
                        saveEndOfDayNotificationSettings(newSettings);
                      }}
                      className={notificationSettings.includeInApp
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : ""
                      }
                    >
                      {notificationSettings.includeInApp ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">Email Notifications</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Send reports via email</p>
                    </div>
                    <Button
                      variant={notificationSettings.includeEmail ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newSettings = {
                          ...notificationSettings,
                          includeEmail: !notificationSettings.includeEmail
                        };
                        setNotificationSettings(newSettings);
                        saveEndOfDayNotificationSettings(newSettings);
                      }}
                      className={notificationSettings.includeEmail
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : ""
                      }
                    >
                      {notificationSettings.includeEmail ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </div>
  
              {/* Email Address (if email notifications are enabled) */}
              {notificationSettings.includeEmail && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={notificationSettings.emailAddress}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        emailAddress: e.target.value
                      };
                      setNotificationSettings(newSettings);
                      saveEndOfDayNotificationSettings(newSettings);
                    }}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm"
                  />
                </div>
              )}
  
              {/* Save Settings */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setSettingsOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Calendar className="w-5 h-5" />
              End of Day Report - {new Date().toLocaleDateString()}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{report.summary.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Uncompleted</p>
                    <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{report.summary.uncompletedOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${
              report.summary.criticalOrders > 0
                ? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    report.summary.criticalOrders > 0
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-emerald-100 dark:bg-emerald-900/30'
                  }`}>
                    {report.summary.criticalOrders > 0 ? (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      report.summary.criticalOrders > 0
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {report.summary.criticalOrders > 0 ? 'Critical Orders' : 'Completed'}
                    </p>
                    <p className={`text-2xl font-bold ${
                      report.summary.criticalOrders > 0
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-emerald-800 dark:text-emerald-200'
                    }`}>
                      {report.summary.criticalOrders > 0 ? report.summary.criticalOrders : report.summary.completedOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Order Age</p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{report.summary.averageOrderAge} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Summary Cards for High Priority and Potential Loss */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`${
              report.summary.highPriorityOrders > 0
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700'
                : 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-700'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    report.summary.highPriorityOrders > 0
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-slate-100 dark:bg-slate-900/30'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      report.summary.highPriorityOrders > 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      report.summary.highPriorityOrders > 0
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      High Priority
                    </p>
                    <p className={`text-2xl font-bold ${
                      report.summary.highPriorityOrders > 0
                        ? 'text-blue-800 dark:text-blue-200'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {report.summary.highPriorityOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Completion Rate</p>
                    <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{report.insights.completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Potential Loss</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-200">{formatUSD(report.summary.potentialLosses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pending Orders</span>
                    <Badge className={getStatusColor('pending')}>
                      {report.summary.pendingOrders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Processing Orders</span>
                    <Badge className={getStatusColor('processing')}>
                      {report.summary.processingOrders}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Shipped Orders</span>
                    <Badge className={getStatusColor('shipped')}>
                      {report.summary.shippedOrders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Completion Rate</span>
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                      {report.summary.totalOrders > 0 ? Math.round((report.summary.completedOrders / report.summary.totalOrders) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg. Order Age</span>
                    <Badge className="bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200">
                      {report.uncompletedOrderDetails.length > 0
                        ? Math.round(report.uncompletedOrderDetails.reduce((sum, order) => sum + order.daysOld, 0) / report.uncompletedOrderDetails.length)
                        : 0} days
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Uncompleted Orders */}
          {report.uncompletedOrderDetails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Uncompleted Orders Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.uncompletedOrderDetails.map((order: any) => {
                    const urgency = getUrgencyLevel(order.daysOld);

                    return (
                      <div key={order.id} className={`p-4 rounded-lg border ${urgency.bgColor} ${urgency.borderColor}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className="font-semibold">Order #{order.id}</span>
                            <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityBadgeColor(order.priority)}`}>
                              {order.priority.toUpperCase()} PRIORITY
                            </Badge>
                            <Badge className={`text-xs ${urgency.level === 'critical' ? 'bg-red-100 text-red-800' : urgency.level === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                              {order.daysOld} day{order.daysOld !== 1 ? 's' : ''} old
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatUSD(order.total)}</div>
                            <div className="text-xs text-slate-500">
                              {formatDateWithTime(order.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Items:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 rounded p-2">
                                <span className="text-sm">{item.productName}</span>
                                <span className="text-sm font-medium">
                                  {item.quantity} × {formatUSD(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.daysOld > 2 && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                              <AlertTriangle className="w-4 h-4" />
                              <span>This order is {order.daysOld} days old and needs immediate attention</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Recommendations for Tomorrow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.recommendations.map((recommendation: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Performance Insights */}
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800 dark:text-purple-200 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Completion Rate</span>
                    <Badge className={`${
                      report.insights.completionRate >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.insights.completionRate >= 60
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.insights.completionRate}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Fulfillment Time</span>
                    <Badge className={`${
                      report.insights.averageFulfillmentTime <= 24
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.insights.averageFulfillmentTime <= 48
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.insights.averageFulfillmentTime}h
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Oldest Order</span>
                    <Badge className={`${
                      report.summary.oldestOrderAge <= 2
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.summary.oldestOrderAge <= 7
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.summary.oldestOrderAge} days
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Uncompleted Products */}
          {report.insights.topUncompletedProducts.length > 0 && (
            <Card className="bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Top Products in Uncompleted Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.insights.topUncompletedProducts.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{product.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{product.count} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{formatUSD(product.totalValue)}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Uncompleted Orders Message */}
          {report.uncompletedOrderDetails.length === 0 && (
            <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                  Excellent! All Orders Completed
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300">
                  All orders have been processed and completed. Great job maintaining efficiency!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}