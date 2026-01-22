"use client";

import React, { useEffect, useMemo, useState } from "react";
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

// Mock formatUSD function
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Mock formatDateWithTime function
const formatDateWithTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getStatusBadge = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "ACTIVE":
      return <Badge className="border-green-500/30 text-green-400 bg-green-500/5">Active</Badge>;
    case "INACTIVE":
      return <Badge className="border-gray-500/30 text-gray-400 bg-gray-500/5">Inactive</Badge>;
    case "ON_LEAVE":
      return <Badge className="border-yellow-500/30 text-yellow-400 bg-yellow-500/5">On Leave</Badge>;
    case "TERMINATED":
      return <Badge className="border-red-500/30 text-red-400 bg-red-500/5">Terminated</Badge>;
    default:
      return <Badge className="border-muted text-muted-foreground bg-muted/30">{status || 'Unknown'}</Badge>;
  }
};

const getRoleBadge = (role: string) => {
  const normalizedRole = role?.toUpperCase() || '';
  switch (normalizedRole) {
    case "STOCK_MANAGER":
      return <Badge className="border-blue-500/30 text-blue-400 bg-blue-500/5">Stock Manager</Badge>;
    case "DISPATCHER":
      return <Badge className="border-purple-500/30 text-purple-400 bg-purple-500/5">Dispatcher</Badge>;
    case "FINANCE_VIEW":
      return <Badge className="border-green-500/30 text-green-400 bg-green-500/5">Finance View</Badge>;
    case "FULL_ACCESS":
      return <Badge className="border-orange-500/30 text-orange-400 bg-orange-500/5">Full Access</Badge>;
    default:
      return <Badge className="border-muted text-muted-foreground bg-muted/30">{role || 'Unknown'}</Badge>;
  }
};

const getDepartmentBadge = (department: string) => {
  const normalizedDept = department?.toUpperCase() || '';
  switch (normalizedDept) {
    case "SALES":
      return <Badge className="border-blue-500/30 text-blue-400 bg-blue-500/5">Sales</Badge>;
    case "WAREHOUSE":
      return <Badge className="border-purple-500/30 text-purple-400 bg-purple-500/5">Warehouse</Badge>;
    case "DELIVERY":
      return <Badge className="border-green-500/30 text-green-400 bg-green-500/5">Delivery</Badge>;
    case "ADMIN":
      return <Badge className="border-orange-500/30 text-orange-400 bg-orange-500/5">Admin</Badge>;
    case "SUPPORT":
      return <Badge className="border-yellow-500/30 text-yellow-400 bg-yellow-500/5">Support</Badge>;
    default:
      return <Badge className="border-muted text-muted-foreground bg-muted/30">{department || 'Unknown'}</Badge>;
  }
};

export default function Page() {
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

  // Mock data for staff
  const mockStaff = [
    {
      id: "1",
      firstName: "John",
      lastName: "Smith",
      email: "john@company.com",
      phone: "+1-555-0123",
      department: "WAREHOUSE",
      position: "Stock Manager",
      role: "STOCK_MANAGER",
      salary: 45000,
      hourlyRate: 25,
      status: "ACTIVE",
      startDate: "2023-01-15",
      lastActive: "2024-01-20T10:30:00Z"
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@company.com",
      phone: "+1-555-0124",
      department: "DELIVERY",
      position: "Dispatcher",
      role: "DISPATCHER",
      salary: 42000,
      hourlyRate: 23,
      status: "ACTIVE",
      startDate: "2023-03-10",
      lastActive: "2024-01-20T09:15:00Z"
    },
    {
      id: "3",
      firstName: "Mike",
      lastName: "Davis",
      email: "mike@company.com",
      phone: "+1-555-0125",
      department: "SALES",
      position: "Sales Associate",
      role: "FULL_ACCESS",
      salary: 38000,
      hourlyRate: 20,
      status: "ON_LEAVE",
      startDate: "2023-06-01",
      lastActive: "2024-01-18T16:45:00Z"
    },
    {
      id: "4",
      firstName: "Lisa",
      lastName: "Brown",
      email: "lisa@company.com",
      phone: "+1-555-0126",
      department: "ADMIN",
      position: "Administrator",
      role: "FINANCE_VIEW",
      salary: 50000,
      hourlyRate: 28,
      status: "ACTIVE",
      startDate: "2022-11-20",
      lastActive: "2024-01-20T11:00:00Z"
    }
  ];

  // Mock data for time logs
  const mockTimeLogs = [
    {
      id: "1",
      staffId: "1",
      staff: { firstName: "John", lastName: "Smith" },
      clockIn: "2024-01-20T09:00:00Z",
      clockOut: "2024-01-20T17:30:00Z",
      hoursWorked: 8.5,
      date: "2024-01-20"
    },
    {
      id: "2",
      staffId: "2",
      staff: { firstName: "Sarah", lastName: "Johnson" },
      clockIn: "2024-01-20T08:30:00Z",
      clockOut: "2024-01-20T16:45:00Z",
      hoursWorked: 8.25,
      date: "2024-01-20"
    }
  ];

  // Mock data for activity logs
  const mockActivityLogs = [
    {
      id: "1",
      staffId: "1",
      staff: { firstName: "John", lastName: "Smith" },
      activityType: "LOGIN",
      description: "Logged into the system",
      createdAt: "2024-01-20T09:00:00Z"
    },
    {
      id: "2",
      staffId: "1",
      staff: { firstName: "John", lastName: "Smith" },
      activityType: "INVENTORY_UPDATE",
      description: "Updated inventory for Toyota Camry Brake Pads",
      createdAt: "2024-01-20T10:15:00Z"
    },
    {
      id: "3",
      staffId: "2",
      staff: { firstName: "Sarah", lastName: "Johnson" },
      activityType: "ORDER_DISPATCH",
      description: "Dispatched order ORD-001 for delivery",
      createdAt: "2024-01-20T11:30:00Z"
    }
  ];

  // Mock data for payroll
  const mockPayrollData = {
    period: "Weekly - Jan 15-21, 2024",
    startDate: "2024-01-15",
    endDate: "2024-01-21",
    staff: [
      {
        staffId: "1",
        firstName: "John",
        lastName: "Smith",
        department: "WAREHOUSE",
        totalHours: 40,
        hourlyPay: 25,
        salaryForPeriod: 1000,
        totalPay: 2000
      },
      {
        staffId: "2",
        firstName: "Sarah",
        lastName: "Johnson",
        department: "DELIVERY",
        totalHours: 38,
        hourlyPay: 23,
        salaryForPeriod: 874,
        totalPay: 1874
      }
    ],
    grandTotal: 3874
  };

  // Mock data for payroll runs
  const mockPayrollRuns = [
    {
      id: "1",
      period: "WEEKLY",
      periodStart: "2024-01-15",
      periodEnd: "2024-01-21",
      staffCount: 4,
      totalAmount: 12500,
      status: "PROCESSED",
      processedAt: "2024-01-22T10:00:00Z"
    },
    {
      id: "2",
      period: "MONTHLY",
      periodStart: "2023-12-01",
      periodEnd: "2023-12-31",
      staffCount: 4,
      totalAmount: 52000,
      status: "PROCESSED",
      processedAt: "2024-01-01T10:00:00Z"
    }
  ];

  // Load staff data
  const loadStaff = async () => {
    setLoading(true);
    setTimeout(() => {
      setStaff(mockStaff);
      setLoading(false);
    }, 500);
  };

  // Load time logs
  const loadTimeLogs = async () => {
    setTimeout(() => {
      setTimeLogs(mockTimeLogs);
    }, 300);
  };

  // Load activity logs
  const loadActivityLogs = async () => {
    setTimeout(() => {
      setActivityLogs(mockActivityLogs);
    }, 300);
  };

  // Load payroll summary
  const loadPayroll = async () => {
    setTimeout(() => {
      setPayrollData(mockPayrollData);
    }, 500);
  };

  // Load payroll runs
  const loadPayrollRuns = async () => {
    setPayrollLoading(true);
    setTimeout(() => {
      setPayrollRuns(mockPayrollRuns);
      setPayrollLoading(false);
    }, 500);
  };

  // Load payroll run details
  const loadPayrollRunDetails = async (runId: string) => {
    setPayrollLoading(true);
    setTimeout(() => {
      const run = mockPayrollRuns.find(r => r.id === runId);
      if (run) {
        setSelectedPayrollRun({
          ...run,
          payslips: mockPayrollData.staff.map(staff => ({
            id: `${run.id}-${staff.staffId}`,
            staff,
            totalHours: staff.totalHours,
            grossPay: staff.totalPay,
            netPay: staff.totalPay * 0.85, // Mock tax deduction
            emailSent: true
          }))
        });
      }
      setPayrollLoading(false);
    }, 500);
  };

  // Process payroll
  const processPayroll = async () => {
    setProcessingPayroll(true);
    setTimeout(() => {
      setProcessingPayroll(false);
      loadPayrollRuns();
      loadPayroll();
    }, 2000);
  };

  useEffect(() => {
    loadStaff();
    loadTimeLogs();
    if (activeTab === 'payroll') {
      loadPayrollRuns();
    }
    if (activeTab === 'activity') {
      loadActivityLogs();
    }
  }, [activeTab]);

  // Create staff member
  const createStaff = async () => {
    setCreatingStaff(true);
    setTimeout(() => {
      setCreatingStaff(false);
      const newStaff = {
        ...selectedStaff,
        id: Date.now().toString(),
        status: "ACTIVE",
        lastActive: new Date().toISOString()
      };
      setStaff([...staff, newStaff]);
      setAddStaffOpen(false);
      resetForm();
    }, 1000);
  };

  // Update staff member
  const updateStaff = async () => {
    setUpdatingStaff(true);
    setTimeout(() => {
      setUpdatingStaff(false);
      const updatedStaff = staff.map(member =>
        member.id === selectedStaff.id ? selectedStaff : member
      );
      setStaff(updatedStaff);
      setEditStaffOpen(false);
      resetForm();
    }, 1000);
  };

  // Deactivate staff member
  const deactivateStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) {
      return;
    }

    const updatedStaff = staff.map(member =>
      member.id === staffId ? { ...member, status: 'INACTIVE' } : member
    );
    setStaff(updatedStaff);
  };

  // View staff details
  const viewStaffDetails = async (staffId: string) => {
    const member = staff.find(s => s.id === staffId);
    if (member) {
      setSelectedStaff(member);
      setViewStaffOpen(true);
    }
  };

  // Edit staff - load details first
  const editStaff = async (staffId: string) => {
    const member = staff.find(s => s.id === staffId);
    if (member) {
      setSelectedStaff({
        ...member,
        startDate: member.startDate ? member.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      setEditStaffOpen(true);
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
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
              <p className="text-muted-foreground">Loading staff data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-4">
              <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              Staff Management
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Manage team members, roles, and track productivity
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/30 border border-border p-1">
          <TabsTrigger value="staff" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="payroll" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            <Calculator className="w-4 h-4 mr-2" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-accent data-[state=active]:text-white">
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
              className="border-border text-foreground hover:bg-accent/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setAddStaffOpen(true);
              }}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </div>

          {/* Filters */}
          <div className="glass-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-accent focus:border-accent bg-background text-foreground"
              >
                <option value="all">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>

              <label className="text-sm font-medium text-foreground ml-4">Department:</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-accent focus:border-accent bg-background text-foreground"
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
          <Card className="glass-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <UserCog className="w-5 h-5 text-accent" />
                Team Members ({staff.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staff.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No staff members found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {staff.map((member) => (
                        <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-foreground">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">{member.position}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">{member.email}</td>
                          <td className="px-4 py-4">{getDepartmentBadge(member.department)}</td>
                          <td className="px-4 py-4">{getRoleBadge(member.role)}</td>
                          <td className="px-4 py-4">{getStatusBadge(member.status)}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewStaffDetails(member.id)}
                                className="h-8 w-8 p-0 hover:bg-accent/10"
                              >
                                <Eye className="h-4 w-4 text-accent" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editStaff(member.id)}
                                className="h-8 w-8 p-0 hover:bg-accent/10"
                              >
                                <Edit className="h-4 w-4 text-accent" />
                              </Button>
                              {member.status === 'ACTIVE' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deactivateStaff(member.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
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
          <Card className="glass-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calculator className="w-5 h-5" />
                Process Payroll
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Period Type</Label>
                  <Select value={payrollPeriod} onValueChange={(value: 'weekly' | 'monthly') => setPayrollPeriod(value)}>
                    <SelectTrigger className="border-border bg-background text-foreground">
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
                    <Label className="text-foreground">Week Start Date</Label>
                    <Input
                      type="date"
                      value={payrollWeekStart}
                      onChange={(e) => setPayrollWeekStart(e.target.value)}
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-foreground">Month</Label>
                      <Select value={payrollMonth.toString()} onValueChange={(value) => setPayrollMonth(parseInt(value))}>
                        <SelectTrigger className="border-border bg-background text-foreground">
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
                      <Label className="text-foreground">Year</Label>
                      <Input
                        type="number"
                        value={payrollYear}
                        onChange={(e) => setPayrollYear(parseInt(e.target.value))}
                        className="border-border bg-background text-foreground"
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
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${payrollLoading ? 'animate-spin' : ''}`} />
                  Preview
                </Button>
                <Button
                  onClick={processPayroll}
                  disabled={processingPayroll}
                  className="bg-accent hover:bg-accent/90 text-white"
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
                <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2 text-foreground">Preview Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Period: {payrollData.period}</p>
                    <p className="text-muted-foreground">Start: {payrollData.startDate ? new Date(payrollData.startDate).toLocaleDateString() : '-'}</p>
                    <p className="text-muted-foreground">End: {payrollData.endDate ? new Date(payrollData.endDate).toLocaleDateString() : '-'}</p>
                    <p className="text-muted-foreground">Staff Count: {payrollData.staff?.length || 0}</p>
                    <p className="font-semibold text-accent">Grand Total: {formatUSD(payrollData.grandTotal || 0)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payroll Runs History */}
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5" />
                  Payroll Runs
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPayrollRuns}
                  disabled={payrollLoading}
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${payrollLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payrollLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : payrollRuns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payroll runs found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Period</TableHead>
                      <TableHead className="text-foreground">Date Range</TableHead>
                      <TableHead className="text-foreground">Staff Count</TableHead>
                      <TableHead className="text-foreground">Total Amount</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Processed At</TableHead>
                      <TableHead className="text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {run.period?.toUpperCase() || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {run.periodStart && run.periodEnd ? (
                            <div className="text-sm text-muted-foreground">
                              {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-foreground">{run.staffCount || 0}</TableCell>
                        <TableCell className="font-semibold text-foreground">{formatUSD(run.totalAmount || 0)}</TableCell>
                        <TableCell>
                          {run.status === 'PROCESSED' ? (
                            <Badge className="bg-accent/20 text-accent border-accent/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Processed
                            </Badge>
                          ) : run.status === 'PENDING' ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
                          ) : (
                            <Badge className="bg-muted/30 text-muted-foreground border-muted/50">{run.status || 'Unknown'}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
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
                            className="hover:bg-accent/10"
                          >
                            <Eye className="w-4 h-4 mr-1 text-accent" />
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
          <Card className="glass-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="w-5 h-5 text-accent" />
                  Activity Logs
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadActivityLogs}
                  disabled={loading}
                  className="border-border text-foreground hover:bg-accent/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No activity logs found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{log.description || log.activityType}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {log.staff?.firstName} {log.staff?.lastName}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">First Name *</Label>
                <Input
                  value={selectedStaff.firstName}
                  onChange={(e) => setSelectedStaff({...selectedStaff, firstName: e.target.value})}
                  className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <Label className="text-foreground">Last Name *</Label>
                <Input
                  value={selectedStaff.lastName}
                  onChange={(e) => setSelectedStaff({...selectedStaff, lastName: e.target.value})}
                  className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground">Email *</Label>
              <Input
                type="email"
                value={selectedStaff.email}
                onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})}
                className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
              />
            </div>

            <div>
              <Label className="text-foreground">Phone *</Label>
              <Input
                value={selectedStaff.phone}
                onChange={(e) => setSelectedStaff({...selectedStaff, phone: e.target.value})}
                className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Department *</Label>
                <select
                  value={selectedStaff.department}
                  onChange={(e) => setSelectedStaff({...selectedStaff, department: e.target.value})}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-accent focus:border-accent"
                >
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="SALES">Sales</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
              <div>
                <Label className="text-foreground">Role *</Label>
                <select
                  value={selectedStaff.role}
                  onChange={(e) => setSelectedStaff({...selectedStaff, role: e.target.value})}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-accent focus:border-accent"
                >
                  <option value="STOCK_MANAGER">Stock Manager</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="FINANCE_VIEW">Finance View</option>
                  <option value="FULL_ACCESS">Full Access</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-foreground">Position *</Label>
              <Input
                value={selectedStaff.position}
                onChange={(e) => setSelectedStaff({...selectedStaff, position: e.target.value})}
                className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Salary (USD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedStaff.salary}
                  onChange={(e) => setSelectedStaff({...selectedStaff, salary: e.target.value})}
                  className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <Label className="text-foreground">Hourly Rate (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedStaff.hourlyRate}
                  onChange={(e) => setSelectedStaff({...selectedStaff, hourlyRate: e.target.value})}
                  className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground">Start Date *</Label>
              <Input
                type="date"
                value={selectedStaff.startDate}
                onChange={(e) => setSelectedStaff({...selectedStaff, startDate: e.target.value})}
                className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddStaffOpen(false)}
                disabled={creatingStaff}
                className="border-border text-foreground hover:bg-accent/10"
              >
                Cancel
              </Button>
              <Button
                onClick={createStaff}
                className="bg-accent hover:bg-accent/90 text-white"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">First Name</Label>
                <Input
                  value={selectedStaff.firstName || ''}
                  onChange={(e) => setSelectedStaff({...selectedStaff, firstName: e.target.value})}
                  className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <Label className="text-foreground">Last Name</Label>
                <Input
                  value={selectedStaff.lastName || ''}
                  onChange={(e) => setSelectedStaff({...selectedStaff, lastName: e.target.value})}
                  className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground">Email</Label>
              <Input
                type="email"
                value={selectedStaff.email || ''}
                onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})}
                className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
              />
            </div>

            <div>
              <Label className="text-foreground">Phone</Label>
              <Input
                value={selectedStaff.phone || ''}
                onChange={(e) => setSelectedStaff({...selectedStaff, phone: e.target.value})}
                className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Department</Label>
                <select
                  value={selectedStaff.department || 'SALES'}
                  onChange={(e) => setSelectedStaff({...selectedStaff, department: e.target.value})}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-accent focus:border-accent"
                >
                  <option value="SALES">Sales</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
              <div>
                <Label className="text-foreground">Role</Label>
                <select
                  value={selectedStaff.role || 'STOCK_MANAGER'}
                  onChange={(e) => setSelectedStaff({...selectedStaff, role: e.target.value})}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-accent focus:border-accent"
                >
                  <option value="STOCK_MANAGER">Stock Manager</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="FINANCE_VIEW">Finance View</option>
                  <option value="FULL_ACCESS">Full Access</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-foreground">Position</Label>
              <Input
                value={selectedStaff.position || ''}
                onChange={(e) => setSelectedStaff({...selectedStaff, position: e.target.value})}
                className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Salary (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedStaff.salary || 0}
                  onChange={(e) => setSelectedStaff({...selectedStaff, salary: e.target.value})}
                  className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <Label className="text-foreground">Hourly Rate (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedStaff.hourlyRate || 0}
                  onChange={(e) => setSelectedStaff({...selectedStaff, hourlyRate: e.target.value})}
                  className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditStaffOpen(false)}
                disabled={updatingStaff}
                className="border-border text-foreground hover:bg-accent/10"
              >
                Cancel
              </Button>
              <Button
                onClick={updateStaff}
                className="bg-accent hover:bg-accent/90 text-white"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Staff Member Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && selectedStaff.id && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm font-medium text-foreground">{selectedStaff.firstName} {selectedStaff.lastName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm text-foreground">{selectedStaff.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="text-sm text-foreground">{selectedStaff.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Position</Label>
                  <p className="text-sm text-foreground">{selectedStaff.position}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <div className="mt-1">{getDepartmentBadge(selectedStaff.department)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <div className="mt-1">{getRoleBadge(selectedStaff.role)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedStaff.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <p className="text-sm text-foreground">{selectedStaff.startDate ? new Date(selectedStaff.startDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Salary</Label>
                  <p className="text-sm font-medium text-foreground">{formatUSD(selectedStaff.salary || 0)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Hourly Rate</Label>
                  <p className="text-sm font-medium text-foreground">{formatUSD(selectedStaff.hourlyRate || 0)}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setViewStaffOpen(false)} className="border-border text-foreground hover:bg-accent/10">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payroll Modal */}
      <Dialog open={payrollModalOpen} onOpenChange={setPayrollModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Payroll Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Period</Label>
                <select
                  value={payrollPeriod}
                  onChange={(e) => {
                    setPayrollPeriod(e.target.value as 'weekly' | 'monthly');
                    loadPayroll();
                  }}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-accent focus:border-accent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {payrollPeriod === 'weekly' ? (
                <div>
                  <Label className="text-foreground">Week Start Date</Label>
                  <Input
                    type="date"
                    value={payrollWeekStart}
                    onChange={(e) => {
                      setPayrollWeekStart(e.target.value);
                      loadPayroll();
                    }}
                    className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-foreground">Month</Label>
                    <select
                      value={payrollMonth}
                      onChange={(e) => {
                        setPayrollMonth(parseInt(e.target.value));
                        loadPayroll();
                      }}
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-accent focus:border-accent"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>{new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-foreground">Year</Label>
                    <Input
                      type="number"
                      value={payrollYear}
                      onChange={(e) => {
                        setPayrollYear(parseInt(e.target.value));
                        loadPayroll();
                      }}
                      className="border-border bg-background text-foreground focus:ring-accent focus:border-accent"
                    />
                  </div>
                </>
              )}
            </div>

            {payrollData && (
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Grand Total:</span>
                    <span className="text-2xl font-bold text-accent">{formatUSD(payrollData.grandTotal || 0)}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Staff</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Department</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Hours</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Hourly Pay</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Salary</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payrollData.staff?.map((staffMember: any) => (
                        <tr key={staffMember.staffId}>
                          <td className="px-4 py-2 text-foreground">{staffMember.firstName} {staffMember.lastName}</td>
                          <td className="px-4 py-2 text-foreground">{staffMember.department}</td>
                          <td className="px-4 py-2 text-foreground">{staffMember.totalHours || 0}</td>
                          <td className="px-4 py-2 text-foreground">{formatUSD(staffMember.hourlyPay || 0)}</td>
                          <td className="px-4 py-2 text-foreground">{formatUSD(staffMember.salaryForPeriod || 0)}</td>
                          <td className="px-4 py-2 font-semibold text-foreground">{formatUSD(staffMember.totalPay || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setPayrollModalOpen(false)} className="border-border text-foreground hover:bg-accent/10">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payroll Run Details Modal */}
      <Dialog open={payrollRunDetailsOpen} onOpenChange={setPayrollRunDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Payroll Run Details</DialogTitle>
            {selectedPayrollRun && (
              <DialogDescription className="text-muted-foreground">
                {selectedPayrollRun.period?.toUpperCase()} Payroll - {selectedPayrollRun.periodStart && selectedPayrollRun.periodEnd ? (
                  `${new Date(selectedPayrollRun.periodStart).toLocaleDateString()} to ${new Date(selectedPayrollRun.periodEnd).toLocaleDateString()}`
                ) : 'N/A'}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedPayrollRun && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Amount</Label>
                  <p className="text-lg font-semibold text-foreground">{formatUSD(selectedPayrollRun.totalAmount || 0)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Staff Count</Label>
                  <p className="text-lg font-semibold text-foreground">{selectedPayrollRun.staffCount || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payslips</Label>
                  <p className="text-lg font-semibold text-foreground">{selectedPayrollRun.payslipsCount || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {selectedPayrollRun.status === 'PROCESSED' ? (
                      <Badge className="bg-accent/20 text-accent border-accent/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Processed
                      </Badge>
                    ) : (
                      <Badge className="bg-muted/30 text-muted-foreground border-muted/50">{selectedPayrollRun.status || 'Unknown'}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {selectedPayrollRun.payslips && selectedPayrollRun.payslips.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Payslips</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground">Staff Member</TableHead>
                        <TableHead className="text-foreground">Department</TableHead>
                        <TableHead className="text-foreground">Hours</TableHead>
                        <TableHead className="text-foreground">Gross Pay</TableHead>
                        <TableHead className="text-foreground">Net Pay</TableHead>
                        <TableHead className="text-foreground">Email Sent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPayrollRun.payslips.map((payslip: any) => (
                        <TableRow key={payslip.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">
                                {payslip.staff?.firstName} {payslip.staff?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{payslip.staff?.position}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {payslip.staff?.department ? getDepartmentBadge(payslip.staff.department) : '-'}
                          </TableCell>
                          <TableCell className="text-foreground">{payslip.totalHours ? `${payslip.totalHours.toFixed(2)} hrs` : '-'}</TableCell>
                          <TableCell className="font-semibold text-foreground">{formatUSD(payslip.grossPay || 0)}</TableCell>
                          <TableCell className="font-semibold text-accent">{formatUSD(payslip.netPay || 0)}</TableCell>
                          <TableCell>
                            {payslip.emailSent ? (
                              <Badge className="bg-accent/20 text-accent border-accent/30">
                                <Mail className="w-3 h-3 mr-1" />
                                Sent
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
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
                <div className="text-center py-8 text-muted-foreground">
                  No payslips found for this payroll run
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setPayrollRunDetailsOpen(false)} className="border-border text-foreground hover:bg-accent/10">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}