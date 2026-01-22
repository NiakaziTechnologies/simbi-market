// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  UserCog,
  Plus,
  Clock,
  Eye,
  Edit,
  Trash2,
  Timer,
  UserCheck,
  Shield,
  Package,
  Truck,
  Calculator,
  Filter,
  RefreshCw,
  Activity,
  DollarSign,
  FileText,
  Mail,
  CheckCircle2,
  XCircle,
  Calendar
} from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { formatDateWithTime } from "@/lib/date";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

const getStatusBadge = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "ACTIVE":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case "INACTIVE":
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
    case "ON_LEAVE":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">On Leave</Badge>;
    case "TERMINATED":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Terminated</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">{status || 'Unknown'}</Badge>;
  }
};

const getRoleBadge = (role: string) => {
  const normalizedRole = role?.toUpperCase() || '';
  switch (normalizedRole) {
    case "STOCK_MANAGER":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Stock Manager</Badge>;
    case "DISPATCHER":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Dispatcher</Badge>;
    case "FINANCE_VIEW":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Finance View</Badge>;
    case "FULL_ACCESS":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Full Access</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">{role || 'Unknown'}</Badge>;
  }
};

const getDepartmentBadge = (department: string) => {
  const normalizedDept = department?.toUpperCase() || '';
  switch (normalizedDept) {
    case "SALES":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sales</Badge>;
    case "WAREHOUSE":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Warehouse</Badge>;
    case "DELIVERY":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Delivery</Badge>;
    case "ADMIN":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Admin</Badge>;
    case "SUPPORT":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Support</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">{department || 'Unknown'}</Badge>;
  }
};

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<string>('staff');
  const [staff, setStaff] = useState<any[]>([]);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [payrollData, setPayrollData] = useState<any>(null);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [selectedPayrollRun, setSelectedPayrollRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [processingPayroll, setProcessingPayroll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [updatingStaff, setUpdatingStaff] = useState(false);
  
  // Modals
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [editStaffOpen, setEditStaffOpen] = useState(false);
  const [viewStaffOpen, setViewStaffOpen] = useState(false);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [payrollRunDetailsOpen, setPayrollRunDetailsOpen] = useState(false);
  
  // Form state
  const [selectedStaff, setSelectedStaff] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "WAREHOUSE",
    position: "",
    role: "STOCK_MANAGER",
    salary: 0,
    hourlyRate: 0,
    startDate: new Date().toISOString().split('T')[0]
  });
  
  // Payroll filters
  const [payrollPeriod, setPayrollPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [payrollWeekStart, setPayrollWeekStart] = useState<string>('');
  const [payrollMonth, setPayrollMonth] = useState<number>(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState<number>(new Date().getFullYear());

  const { accessToken } = useSellerAuth();
  const { toast } = useToast();

  // Load staff data
  const loadStaff = async () => {
    if (!accessToken) return;

      try {
        setLoading(true);
        setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (departmentFilter !== 'all') {
        params.append('department', departmentFilter);
      }

      const response = await apiClient.request<{
        success: boolean;
        data?: {
          staff: any[];
          pagination?: any;
        };
      }>(`/api/seller/staff?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
      });

      if (response.success && response.data) {
        setStaff(response.data.staff || []);
      }
    } catch (err: any) {
      console.error('Failed to load staff:', err);
        setError('Failed to load staff data');
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load staff",
        variant: "destructive",
      });
      } finally {
        setLoading(false);
      }
    };

  // Load time logs
  const loadTimeLogs = async () => {
    if (!accessToken) return;

    try {
      const response = await apiClient.request<{
        success: boolean;
        data?: any[];
      }>(`/api/seller/staff/time-logs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.success && response.data) {
        setTimeLogs(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Failed to load time logs:', err);
    }
  };

  // Load activity logs
  const loadActivityLogs = async () => {
    if (!accessToken) return;

    try {
      const response = await apiClient.request<{
        success: boolean;
        data?: any[];
      }>(`/api/seller/staff/activity-logs`, {
        method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
      });

      if (response.success && response.data) {
        setActivityLogs(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    }
  };

  // Load payroll summary
  const loadPayroll = async () => {
    if (!accessToken) return;

    try {
      const params = new URLSearchParams();
      params.append('period', payrollPeriod);
      
      if (payrollPeriod === 'weekly') {
        if (!payrollWeekStart) {
          // Default to current week start (Monday)
          const today = new Date();
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(today.setDate(diff));
          setPayrollWeekStart(monday.toISOString().split('T')[0]);
          params.append('weekStart', monday.toISOString().split('T')[0]);
        } else {
          params.append('weekStart', payrollWeekStart);
        }
      } else {
        params.append('month', payrollMonth.toString());
        params.append('year', payrollYear.toString());
      }

      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/staff/payroll?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
      });

      if (response.success && response.data) {
        setPayrollData(response.data);
      }
    } catch (err) {
      console.error('Failed to load payroll:', err);
      toast({
        title: "Error",
        description: "Failed to load payroll summary",
        variant: "destructive",
      });
    }
  };

  // Load payroll runs
  const loadPayrollRuns = async () => {
    if (!accessToken) return;

    try {
      setPayrollLoading(true);
      const response = await apiClient.request<{
        success: boolean;
        data?: {
          payrollRuns?: any[];
          pagination?: any;
        };
      }>('/api/seller/staff/payroll/runs', {
        method: 'GET',
      });

      if (response.success && response.data) {
        setPayrollRuns(Array.isArray(response.data.payrollRuns) ? response.data.payrollRuns : []);
      }
    } catch (err: any) {
      console.error('Failed to load payroll runs:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load payroll runs",
        variant: "destructive",
      });
    } finally {
      setPayrollLoading(false);
    }
  };

  // Load single payroll run details
  const loadPayrollRunDetails = async (runId: string) => {
    if (!accessToken) return;

    try {
      setPayrollLoading(true);
      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/staff/payroll/runs/${runId}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setSelectedPayrollRun(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load payroll run details:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load payroll run details",
        variant: "destructive",
      });
    } finally {
      setPayrollLoading(false);
    }
  };

  // Process payroll
  const processPayroll = async () => {
    if (!accessToken) return;

    if (!payrollPeriod) {
      toast({
        title: "Error",
        description: "Please select a payroll period",
        variant: "destructive",
      });
      return;
    }

    if (payrollPeriod === 'weekly' && !payrollWeekStart) {
      toast({
        title: "Error",
        description: "Please select a week start date",
        variant: "destructive",
      });
      return;
    }

    if (payrollPeriod === 'monthly' && (!payrollMonth || !payrollYear)) {
      toast({
        title: "Error",
        description: "Please select month and year",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingPayroll(true);
      const body: any = {
        period: payrollPeriod,
      };

      if (payrollPeriod === 'weekly') {
        body.weekStart = payrollWeekStart;
      } else {
        body.month = payrollMonth;
        body.year = payrollYear;
      }

      const response = await apiClient.request<{
        success: boolean;
        message?: string;
        data?: {
          payrollRun?: any;
          payslipsCount?: number;
          totalAmount?: number;
        };
      }>('/api/seller/staff/payroll/process', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Payroll processed successfully",
        });
        await loadPayrollRuns();
        await loadPayroll();
      } else {
        throw new Error(response.message || "Failed to process payroll");
      }
    } catch (err: any) {
      console.error('Failed to process payroll:', err);
      toast({
        title: "Error",
        description: err?.data?.message || err?.message || "Failed to process payroll",
        variant: "destructive",
      });
    } finally {
      setProcessingPayroll(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadStaff();
      loadTimeLogs();
      if (activeTab === 'payroll') {
        loadPayrollRuns();
      }
      if (activeTab === 'activity') {
        loadActivityLogs();
      }
    }
  }, [accessToken, statusFilter, departmentFilter, activeTab]);

  // Create staff member
  const createStaff = async () => {
    if (!accessToken) return;

    // Validate required fields
    if (!selectedStaff.firstName || !selectedStaff.lastName || !selectedStaff.email || 
        !selectedStaff.phone || !selectedStaff.department || !selectedStaff.position || 
        !selectedStaff.role || !selectedStaff.salary || !selectedStaff.startDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingStaff(true);
      const response = await apiClient.request<{
        success: boolean;
        message: string;
        data?: {
          staff: any;
          tempPassword?: string;
        };
      }>('/api/seller/staff', {
        method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: selectedStaff.firstName,
          lastName: selectedStaff.lastName,
          email: selectedStaff.email,
          phone: selectedStaff.phone,
          department: selectedStaff.department,
          position: selectedStaff.position,
          role: selectedStaff.role,
          salary: parseFloat(selectedStaff.salary) || 0,
          hourlyRate: parseFloat(selectedStaff.hourlyRate) || 0,
          startDate: selectedStaff.startDate,
        }),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Staff member created successfully",
        });
        setAddStaffOpen(false);
        resetForm();
        loadStaff();
        loadActivityLogs();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create staff member",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Failed to create staff:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to create staff member",
        variant: "destructive",
      });
    } finally {
      setCreatingStaff(false);
    }
  };

  // Update staff member
  const updateStaff = async () => {
    if (!accessToken || !selectedStaff.id) return;

    try {
      setUpdatingStaff(true);
      const updateData: any = {};
      if (selectedStaff.firstName) updateData.firstName = selectedStaff.firstName;
      if (selectedStaff.lastName) updateData.lastName = selectedStaff.lastName;
      if (selectedStaff.email) updateData.email = selectedStaff.email;
      if (selectedStaff.phone) updateData.phone = selectedStaff.phone;
      if (selectedStaff.department) updateData.department = selectedStaff.department;
      if (selectedStaff.position) updateData.position = selectedStaff.position;
      if (selectedStaff.role) updateData.role = selectedStaff.role;
      if (selectedStaff.salary !== undefined) updateData.salary = parseFloat(selectedStaff.salary) || 0;
      if (selectedStaff.hourlyRate !== undefined) updateData.hourlyRate = parseFloat(selectedStaff.hourlyRate) || 0;

      const response = await apiClient.request<{
        success: boolean;
        message: string;
        data?: any;
      }>(`/api/seller/staff/${selectedStaff.id}`, {
        method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Staff member updated successfully",
        });
        setEditStaffOpen(false);
        resetForm();
        loadStaff();
        loadActivityLogs();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update staff member",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Failed to update staff:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to update staff member",
        variant: "destructive",
      });
    } finally {
      setUpdatingStaff(false);
    }
  };

  // Deactivate staff member
  const deactivateStaff = async (staffId: string) => {
    if (!accessToken) return;

    if (!confirm('Are you sure you want to deactivate this staff member?')) {
      return;
    }

    try {
      const response = await apiClient.request<{
        success: boolean;
        message: string;
      }>(`/api/seller/staff/${staffId}/deactivate`, {
        method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Staff member deactivated successfully",
        });
        loadStaff();
        loadActivityLogs();
        } else {
        toast({
          title: "Error",
          description: response.message || "Failed to deactivate staff member",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Failed to deactivate staff:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to deactivate staff member",
        variant: "destructive",
      });
    }
  };

  // View staff details
  const viewStaffDetails = async (staffId: string) => {
    if (!accessToken) return;

    try {
      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/staff/${staffId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.success && response.data) {
        setSelectedStaff(response.data);
        setViewStaffOpen(true);
      }
    } catch (err: any) {
      console.error('Failed to load staff details:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load staff details",
        variant: "destructive",
      });
    }
  };

  // Edit staff - load details first
  const editStaff = async (staffId: string) => {
    if (!accessToken) return;

    try {
      const response = await apiClient.request<{
        success: boolean;
        data?: any;
      }>(`/api/seller/staff/${staffId}`, {
        method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
      });

      if (response.success && response.data) {
        setSelectedStaff({
          ...response.data,
          startDate: response.data.startDate ? response.data.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setEditStaffOpen(true);
      }
    } catch (err: any) {
      console.error('Failed to load staff details:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load staff details",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
        setSelectedStaff({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          department: "WAREHOUSE",
          position: "",
      role: "STOCK_MANAGER",
          salary: 0,
          hourlyRate: 0,
          startDate: new Date().toISOString().split('T')[0]
        });
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeStaff = staff.filter(s => s.status === 'ACTIVE').length;
    const totalHours = timeLogs.reduce((sum, log) => sum + (log.hoursWorked || 0), 0);
    const totalPayroll = payrollData?.grandTotal || 0;
    
    return {
      activeStaff,
      totalHours: totalHours.toFixed(1),
      totalPayroll,
    };
  }, [staff, timeLogs, payrollData]);

  const formatTimeDisplay = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}min`;
    }
    return `${hours.toFixed(1)}h`;
  };

  if (loading && staff.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-[#2ECC71] rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-600">Loading staff data...</p>
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
        {/* Header */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-[#2ECC71] rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Staff Management
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Manage team members, roles, and track productivity
              </p>
            </div>
          </div>
            </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="staff" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="payroll" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Payroll
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6 mt-6">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={loadStaff}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setAddStaffOpen(true);
                }}
                className="bg-[#2ECC71] hover:bg-[#27AE60] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </div>

            {/* Filters */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>
            
            <label className="text-sm font-medium text-gray-700 ml-4">Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="SALES">Sales</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="DELIVERY">Delivery</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPPORT">Support</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-[#3498DB]" />
              Team Members ({staff.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
            {staff.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No staff members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                {staff.map((member) => (
                      <tr key={member.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                      </div>
                          <div className="text-xs text-gray-500">{member.position}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{member.email}</td>
                        <td className="px-4 py-4">{getDepartmentBadge(member.department)}</td>
                        <td className="px-4 py-4">{getRoleBadge(member.role)}</td>
                        <td className="px-4 py-4">{getStatusBadge(member.status)}</td>
                        <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                              <Button
                              variant="ghost"
                                size="sm"
                              onClick={() => viewStaffDetails(member.id)}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                              >
                              <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                              variant="ghost"
                                size="sm"
                              onClick={() => editStaff(member.id)}
                              className="h-8 w-8 p-0 hover:bg-green-100"
                              >
                              <Edit className="h-4 w-4 text-green-600" />
                              </Button>
                            {member.status === 'ACTIVE' && (
                      <Button
                                variant="ghost"
                        size="sm"
                                onClick={() => deactivateStaff(member.id)}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                                <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                            )}
                    </div>
                        </td>
                      </tr>
                ))}
                  </tbody>
                </table>
              </div>
            )}
            </CardContent>
          </Card>

          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6 mt-6">
            {/* Process Payroll Section */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Process Payroll
              </CardTitle>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Period Type</Label>
                    <Select value={payrollPeriod} onValueChange={(value: 'weekly' | 'monthly') => setPayrollPeriod(value)}>
                      <SelectTrigger className="border border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {payrollPeriod === 'weekly' ? (
                      <div>
                      <Label>Week Start Date</Label>
                      <Input
                        type="date"
                        value={payrollWeekStart}
                        onChange={(e) => setPayrollWeekStart(e.target.value)}
                        className="border border-gray-300"
                      />
                      </div>
                  ) : (
                    <>
                      <div>
                        <Label>Month</Label>
                        <Select value={payrollMonth.toString()} onValueChange={(value) => setPayrollMonth(parseInt(value))}>
                          <SelectTrigger className="border border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Year</Label>
                        <Input
                          type="number"
                          value={payrollYear}
                          onChange={(e) => setPayrollYear(parseInt(e.target.value))}
                          className="border border-gray-300"
                          min={2020}
                          max={2100}
                        />
                    </div>
                    </>
                  )}
              </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={loadPayroll}
                    disabled={payrollLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${payrollLoading ? 'animate-spin' : ''}`} />
                    Preview
                  </Button>
                  <Button
                    onClick={processPayroll}
                    disabled={processingPayroll}
                    className="bg-[#2ECC71] hover:bg-[#27AE60] text-white"
                  >
                    {processingPayroll ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Process Payroll
                      </>
                    )}
                  </Button>
                </div>

                {payrollData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Preview Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p>Period: {payrollData.period}</p>
                      <p>Start: {payrollData.startDate ? new Date(payrollData.startDate).toLocaleDateString() : '-'}</p>
                      <p>End: {payrollData.endDate ? new Date(payrollData.endDate).toLocaleDateString() : '-'}</p>
                      <p>Staff Count: {payrollData.staff?.length || 0}</p>
                      <p className="font-semibold">Grand Total: {formatUSD(payrollData.grandTotal || 0)}</p>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

            {/* Payroll Runs History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Payroll Runs
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadPayrollRuns}
                    disabled={payrollLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${payrollLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
        </div>
              </CardHeader>
              <CardContent>
                {payrollLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : payrollRuns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No payroll runs found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Date Range</TableHead>
                        <TableHead>Staff Count</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processed At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollRuns.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">
                              {run.period?.toUpperCase() || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {run.periodStart && run.periodEnd ? (
                              <div className="text-sm">
                                {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{run.staffCount || 0}</TableCell>
                          <TableCell className="font-semibold">{formatUSD(run.totalAmount || 0)}</TableCell>
                          <TableCell>
                            {run.status === 'PROCESSED' ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Processed
                              </Badge>
                            ) : run.status === 'PENDING' ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">{run.status || 'Unknown'}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {run.processedAt ? formatDateWithTime(run.processedAt) : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                await loadPayrollRunDetails(run.id);
                                setPayrollRunDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity" className="space-y-6 mt-6">
            <Card>
          <CardHeader>
                <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#3498DB]" />
                    Activity Logs
            </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadActivityLogs}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
          </CardHeader>
          <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No activity logs found</p>
                    </div>
                ) : (
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{log.description || log.activityType}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500">
                              {log.staff?.firstName} {log.staff?.lastName}
                            </p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">
                              {formatDateWithTime(log.createdAt)}
                            </p>
                    </div>
                  </div>
            </div>
                    ))}
                  </div>
                )}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>

        {/* Add Staff Modal */}
        <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
              <div>
                  <Label>First Name *</Label>
                <Input
                    value={selectedStaff.firstName}
                  onChange={(e) => setSelectedStaff({...selectedStaff, firstName: e.target.value})}
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                  <Label>Last Name *</Label>
                <Input
                    value={selectedStaff.lastName}
                  onChange={(e) => setSelectedStaff({...selectedStaff, lastName: e.target.value})}
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                </div>
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={selectedStaff.email}
                  onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})}
                  className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <Label>Phone *</Label>
                <Input
                  value={selectedStaff.phone}
                  onChange={(e) => setSelectedStaff({...selectedStaff, phone: e.target.value})}
                  className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
              <div>
                  <Label>Department *</Label>
                <select
                    value={selectedStaff.department}
                  onChange={(e) => setSelectedStaff({...selectedStaff, department: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="WAREHOUSE">Warehouse</option>
                </select>
                </div>
                <div>
                  <Label>Role *</Label>
                  <select
                    value={selectedStaff.role}
                    onChange={(e) => setSelectedStaff({...selectedStaff, role: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="STOCK_MANAGER">Stock Manager</option>
                    <option value="FINANCE_VIEW">Finance View</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Position *</Label>
                <Input
                  value={selectedStaff.position}
                  onChange={(e) => setSelectedStaff({...selectedStaff, position: e.target.value})}
                  className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
              <div>
                  <Label>Salary (USD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                    value={selectedStaff.salary}
                    onChange={(e) => setSelectedStaff({...selectedStaff, salary: e.target.value})}
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                  <Label>Hourly Rate (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                    value={selectedStaff.hourlyRate}
                    onChange={(e) => setSelectedStaff({...selectedStaff, hourlyRate: e.target.value})}
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={selectedStaff.startDate}
                  onChange={(e) => setSelectedStaff({...selectedStaff, startDate: e.target.value})}
                  className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setAddStaffOpen(false)}
                  disabled={creatingStaff}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createStaff} 
                  className="bg-[#2ECC71] hover:bg-[#27AE60] text-white"
                  disabled={creatingStaff}
                >
                  {creatingStaff ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Staff'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Staff Modal */}
        <Dialog open={editStaffOpen} onOpenChange={setEditStaffOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={selectedStaff.firstName || ''}
                    onChange={(e) => setSelectedStaff({...selectedStaff, firstName: e.target.value})}
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={selectedStaff.lastName || ''}
                    onChange={(e) => setSelectedStaff({...selectedStaff, lastName: e.target.value})}
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={selectedStaff.email || ''}
                  onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})}
                  className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <Label>Phone</Label>
                <Input
                  value={selectedStaff.phone || ''}
                  onChange={(e) => setSelectedStaff({...selectedStaff, phone: e.target.value})}
                  className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <select
                    value={selectedStaff.department || 'SALES'}
                    onChange={(e) => setSelectedStaff({...selectedStaff, department: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="SALES">Sales</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>
                <div>
                  <Label>Role</Label>
                  <select
                    value={selectedStaff.role || 'STOCK_MANAGER'}
                    onChange={(e) => setSelectedStaff({...selectedStaff, role: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="STOCK_MANAGER">Stock Manager</option>
                    <option value="DISPATCHER">Dispatcher</option>
                    <option value="FINANCE_VIEW">Finance View</option>
                    <option value="FULL_ACCESS">Full Access</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label>Position</Label>
                <Input
                  value={selectedStaff.position || ''}
                  onChange={(e) => setSelectedStaff({...selectedStaff, position: e.target.value})}
                  className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Salary (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedStaff.salary || 0}
                    onChange={(e) => setSelectedStaff({...selectedStaff, salary: e.target.value})}
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label>Hourly Rate (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedStaff.hourlyRate || 0}
                    onChange={(e) => setSelectedStaff({...selectedStaff, hourlyRate: e.target.value})}
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditStaffOpen(false)}
                  disabled={updatingStaff}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={updateStaff} 
                  className="bg-[#3498DB] hover:bg-[#2980B9] text-white"
                  disabled={updatingStaff}
                >
                  {updatingStaff ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Staff'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Staff Details Modal */}
        <Dialog open={viewStaffOpen} onOpenChange={setViewStaffOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Staff Member Details</DialogTitle>
            </DialogHeader>
            {selectedStaff && selectedStaff.id && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Name</Label>
                    <p className="text-sm font-medium">{selectedStaff.firstName} {selectedStaff.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <p className="text-sm">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Phone</Label>
                    <p className="text-sm">{selectedStaff.phone}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Position</Label>
                    <p className="text-sm">{selectedStaff.position}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Department</Label>
                    <div className="mt-1">{getDepartmentBadge(selectedStaff.department)}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Role</Label>
                    <div className="mt-1">{getRoleBadge(selectedStaff.role)}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedStaff.status)}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Start Date</Label>
                    <p className="text-sm">{selectedStaff.startDate ? new Date(selectedStaff.startDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Salary</Label>
                    <p className="text-sm font-medium">{formatUSD(selectedStaff.salary || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Hourly Rate</Label>
                    <p className="text-sm font-medium">{formatUSD(selectedStaff.hourlyRate || 0)}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={() => setViewStaffOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payroll Modal */}
        <Dialog open={payrollModalOpen} onOpenChange={setPayrollModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payroll Summary</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Period</Label>
                  <select
                    value={payrollPeriod}
                    onChange={(e) => {
                      setPayrollPeriod(e.target.value as 'weekly' | 'monthly');
                      loadPayroll();
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {payrollPeriod === 'weekly' ? (
                  <div>
                    <Label>Week Start Date</Label>
                    <Input
                      type="date"
                      value={payrollWeekStart}
                      onChange={(e) => {
                        setPayrollWeekStart(e.target.value);
                        loadPayroll();
                      }}
                      className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label>Month</Label>
                      <select
                        value={payrollMonth}
                        onChange={(e) => {
                          setPayrollMonth(parseInt(e.target.value));
                          loadPayroll();
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>{new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={payrollYear}
                        onChange={(e) => {
                          setPayrollYear(parseInt(e.target.value));
                          loadPayroll();
                        }}
                        className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
              
              {payrollData && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Grand Total:</span>
                      <span className="text-2xl font-bold text-green-600">{formatUSD(payrollData.grandTotal || 0)}</span>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold">Staff</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold">Department</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold">Hours</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold">Hourly Pay</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold">Salary</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payrollData.staff?.map((staffMember: any) => (
                          <tr key={staffMember.staffId}>
                            <td className="px-4 py-2">{staffMember.firstName} {staffMember.lastName}</td>
                            <td className="px-4 py-2">{staffMember.department}</td>
                            <td className="px-4 py-2">{staffMember.totalHours || 0}</td>
                            <td className="px-4 py-2">{formatUSD(staffMember.hourlyPay || 0)}</td>
                            <td className="px-4 py-2">{formatUSD(staffMember.salaryForPeriod || 0)}</td>
                            <td className="px-4 py-2 font-semibold">{formatUSD(staffMember.totalPay || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setPayrollModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payroll Run Details Modal */}
        <Dialog open={payrollRunDetailsOpen} onOpenChange={setPayrollRunDetailsOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payroll Run Details</DialogTitle>
              {selectedPayrollRun && (
                <DialogDescription>
                  {selectedPayrollRun.period?.toUpperCase()} Payroll - {selectedPayrollRun.periodStart && selectedPayrollRun.periodEnd ? (
                    `${new Date(selectedPayrollRun.periodStart).toLocaleDateString()} to ${new Date(selectedPayrollRun.periodEnd).toLocaleDateString()}`
                  ) : 'N/A'}
                </DialogDescription>
              )}
            </DialogHeader>
            {selectedPayrollRun && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Total Amount</Label>
                    <p className="text-lg font-semibold">{formatUSD(selectedPayrollRun.totalAmount || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Staff Count</Label>
                    <p className="text-lg font-semibold">{selectedPayrollRun.staffCount || 0}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Payslips</Label>
                    <p className="text-lg font-semibold">{selectedPayrollRun.payslipsCount || 0}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <div className="mt-1">
                      {selectedPayrollRun.status === 'PROCESSED' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Processed
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">{selectedPayrollRun.status || 'Unknown'}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {selectedPayrollRun.payslips && selectedPayrollRun.payslips.length > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-3">Payslips</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff Member</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Gross Pay</TableHead>
                          <TableHead>Net Pay</TableHead>
                          <TableHead>Email Sent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPayrollRun.payslips.map((payslip: any) => (
                          <TableRow key={payslip.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {payslip.staff?.firstName} {payslip.staff?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{payslip.staff?.position}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {payslip.staff?.department ? getDepartmentBadge(payslip.staff.department) : '-'}
                            </TableCell>
                            <TableCell>{payslip.totalHours ? `${payslip.totalHours.toFixed(2)} hrs` : '-'}</TableCell>
                            <TableCell className="font-semibold">{formatUSD(payslip.grossPay || 0)}</TableCell>
                            <TableCell className="font-semibold text-green-600">{formatUSD(payslip.netPay || 0)}</TableCell>
                            <TableCell>
                              {payslip.emailSent ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Sent
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Not Sent
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No payslips found for this payroll run
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setPayrollRunDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
