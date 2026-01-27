"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useSellerAuth } from "@/lib/auth/seller-auth-context"
import {
  Users,
  Calculator,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  FileText,
  Plus,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getStaffMembers,
  getPayrollRuns,
  processPayroll,
  previewPayroll,
  getActivityLogs,
  createStaffMember,
  type StaffMember,
  type PayrollRun,
  type ActivityLog,
  type ProcessPayrollRequest,
  type CreateStaffMemberRequest,
} from "@/lib/api/seller-staff"
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

export default function StaffPage() {
  const router = useRouter()
  const { userType, role } = useSellerAuth()
  const [activeTab, setActiveTab] = useState("staff")
  const { toast } = useToast()

  // Role-based access control: Only sellers and FULL_ACCESS staff can access this page
  useEffect(() => {
    if (userType === 'staff' && role !== 'FULL_ACCESS') {
      router.push('/dashboard/seller')
    }
  }, [userType, role, router])

  // Staff Tab State
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)
  const [staffPage, setStaffPage] = useState(1)
  const [staffTotalPages, setStaffTotalPages] = useState(1)
  const [staffTotal, setStaffTotal] = useState(0)
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false)
  const [isCreatingStaff, setIsCreatingStaff] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<CreateStaffMemberRequest>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "WAREHOUSE",
    role: "STOCK_MANAGER",
    position: "",
    salary: 0,
    hourlyRate: 0,
    startDate: "",
  })

  // Payroll Tab State
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(false)
  const [payrollPage, setPayrollPage] = useState(1)
  const [payrollTotalPages, setPayrollTotalPages] = useState(1)
  const [payrollTotal, setPayrollTotal] = useState(0)
  const [periodType, setPeriodType] = useState<"weekly" | "monthly" | "biweekly">("weekly")
  const [weekStartDate, setWeekStartDate] = useState("")
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false)
  const [isPreviewingPayroll, setIsPreviewingPayroll] = useState(false)
  const [selectedPayrollRun, setSelectedPayrollRun] = useState<PayrollRun | null>(null)
  const [isPayrollDetailOpen, setIsPayrollDetailOpen] = useState(false)

  // Activity Logs Tab State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  const loadStaffMembers = useCallback(async () => {
    try {
      setIsLoadingStaff(true)
      const data = await getStaffMembers(staffPage, 20)
      setStaffMembers(data.staff)
      setStaffTotalPages(data.pagination.pages || 1)
      setStaffTotal(data.pagination.total)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load staff members",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStaff(false)
    }
  }, [staffPage, toast])

  const loadPayrollRuns = useCallback(async () => {
    try {
      setIsLoadingPayroll(true)
      const data = await getPayrollRuns(payrollPage, 20)
      setPayrollRuns(data.payrollRuns)
      setPayrollTotalPages(data.pagination.pages || 1)
      setPayrollTotal(data.pagination.total)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load payroll runs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPayroll(false)
    }
  }, [payrollPage, toast])

  const loadActivityLogs = useCallback(async () => {
    try {
      setIsLoadingLogs(true)
      const data = await getActivityLogs()
      setActivityLogs(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load activity logs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLogs(false)
    }
  }, [toast])

  useEffect(() => {
    if (activeTab === "staff") {
      loadStaffMembers()
    } else if (activeTab === "payroll") {
      loadPayrollRuns()
    } else if (activeTab === "activity-logs") {
      loadActivityLogs()
    }
  }, [activeTab, loadStaffMembers, loadPayrollRuns, loadActivityLogs])

  useEffect(() => {
    if (activeTab === "staff") {
      loadStaffMembers()
    }
  }, [staffPage, activeTab, loadStaffMembers])

  useEffect(() => {
    if (activeTab === "payroll") {
      loadPayrollRuns()
    }
  }, [payrollPage, activeTab, loadPayrollRuns])

  const handlePreviewPayroll = async () => {
    if (periodType === "weekly" && !weekStartDate) {
      toast({
        title: "Error",
        description: "Please select a week start date",
        variant: "destructive",
      })
      return
    }

    if (periodType === "monthly" && (!month || !year)) {
      toast({
        title: "Error",
        description: "Please select a month and year",
        variant: "destructive",
      })
      return
    }

    try {
      setIsPreviewingPayroll(true)
      const request: ProcessPayrollRequest = {
        period: periodType,
        weekStartDate: (periodType === "weekly" || periodType === "biweekly") ? weekStartDate : undefined,
        month: periodType === "monthly" ? month : undefined,
        year: periodType === "monthly" ? year : undefined,
      }
      const preview = await previewPayroll(request)
      toast({
        title: "Preview Generated",
        description: `Preview shows ${preview.staffCount || 0} staff members`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to preview payroll",
        variant: "destructive",
      })
    } finally {
      setIsPreviewingPayroll(false)
    }
  }

  const handleProcessPayroll = async () => {
    if (periodType === "weekly" && !weekStartDate) {
      toast({
        title: "Error",
        description: "Please select a week start date",
        variant: "destructive",
      })
      return
    }

    if (periodType === "biweekly" && !weekStartDate) {
      toast({
        title: "Error",
        description: "Please select a week start date",
        variant: "destructive",
      })
      return
    }

    if (periodType === "monthly" && (!month || !year)) {
      toast({
        title: "Error",
        description: "Please select a month and year",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessingPayroll(true)
      const request: ProcessPayrollRequest = {
        period: periodType,
        weekStartDate: (periodType === "weekly" || periodType === "biweekly") ? weekStartDate : undefined,
        month: periodType === "monthly" ? month : undefined,
        year: periodType === "monthly" ? year : undefined,
      }
      const response = await processPayroll(request)
      toast({
        title: "Success",
        description: `Payroll processed successfully. ${response.payslipsCount || 0} payslip${(response.payslipsCount || 0) !== 1 ? 's' : ''} generated.`,
      })
      setWeekStartDate("")
      setMonth(new Date().getMonth() + 1)
      setYear(new Date().getFullYear())
      await loadPayrollRuns()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to process payroll",
        variant: "destructive",
      })
    } finally {
      setIsProcessingPayroll(false)
    }
  }

  const handleViewPayrollDetails = (run: PayrollRun) => {
    setSelectedPayrollRun(run)
    setIsPayrollDetailOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      "ACTIVE": { label: "Active", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      "INACTIVE": { label: "Inactive", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
      "PROCESSED": { label: "Processed", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      "PENDING": { label: "Pending", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      "FAILED": { label: "Failed", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    }
    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const getActivityTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; className: string }> = {
      "STAFF_CREATED": { label: "Created", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      "STAFF_UPDATED": { label: "Updated", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      "STAFF_DEACTIVATED": { label: "Deactivated", className: "bg-red-500/20 text-red-400 border-red-500/30" },
      "TIME_LOGGED": { label: "Time Logged", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      "OTHER": { label: "Other", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
    }
    const typeInfo = typeMap[type] || { label: type, className: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
    return (
      <Badge variant="outline" className={typeInfo.className}>
        {typeInfo.label}
      </Badge>
    )
  }

  const handleCreateStaff = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Error",
        description: "Please enter first and last name",
        variant: "destructive",
      })
      return
    }

    if (!formData.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      })
      return
    }

    if (!formData.position.trim()) {
      toast({
        title: "Error",
        description: "Please enter a position",
        variant: "destructive",
      })
      return
    }

    if (!formData.salary || formData.salary < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid salary",
        variant: "destructive",
      })
      return
    }

    if (!formData.startDate) {
      toast({
        title: "Error",
        description: "Please select a start date",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreatingStaff(true)
      const requestData: CreateStaffMemberRequest = {
        ...formData,
        hourlyRate: formData.hourlyRate && formData.hourlyRate > 0 ? formData.hourlyRate : undefined,
      }
      const response = await createStaffMember(requestData)
      setTempPassword(response.tempPassword)
      setShowPasswordModal(true)
      setIsAddStaffModalOpen(false)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "WAREHOUSE",
        role: "STOCK_MANAGER",
        position: "",
        salary: 0,
        hourlyRate: 0,
        startDate: "",
      })
      await loadStaffMembers()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create staff member",
        variant: "destructive",
      })
    } finally {
      setIsCreatingStaff(false)
    }
  }

  const handleCopyPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword)
      toast({
        title: "Copied",
        description: "Temporary password copied to clipboard",
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
          Staff
        </h1>
        <p className="text-muted-foreground font-light">
          Manage your staff members, payroll, and activity logs
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger 
            value="staff" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <Users className="h-4 w-4" />
            Staff
          </TabsTrigger>
          <TabsTrigger 
            value="payroll" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <Calculator className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger 
            value="activity-logs" 
            className="flex items-center gap-2 data-[state=inactive]:text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background"
          >
            <Clock className="h-4 w-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-light flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Members
                  </CardTitle>
                  <CardDescription>
                    {staffTotal > 0 ? `${staffTotal} total staff member${staffTotal !== 1 ? 's' : ''}` : "No staff members"}
                  </CardDescription>
                </div>
                <Button
                  className="bg-accent hover:bg-accent/90"
                  onClick={() => setIsAddStaffModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingStaff ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : staffMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No staff members found</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Salary</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="font-medium text-foreground">
                                {member.firstName} {member.lastName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {member.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {member.phone}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{member.department}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-foreground">{member.position}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {member.role.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-foreground font-medium">
                                {formatCurrency(member.salary)}
                              </div>
                              {member.hourlyRate > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  ${member.hourlyRate}/hr
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(member.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {staffTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {staffPage} of {staffTotalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStaffPage(prev => Math.max(1, prev - 1))}
                          disabled={staffPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStaffPage(prev => Math.min(staffTotalPages, prev + 1))}
                          disabled={staffPage === staffTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-6">
          {/* Process Payroll Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Process Payroll
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodType">Period Type</Label>
                  <Select value={periodType} onValueChange={(value: "weekly" | "monthly" | "biweekly") => {
                    setPeriodType(value)
                    // Reset form when changing period type
                    setWeekStartDate("")
                    setMonth(new Date().getMonth() + 1)
                    setYear(new Date().getFullYear())
                  }}>
                    <SelectTrigger id="periodType">
                      <SelectValue placeholder="Select period type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(periodType === "weekly" || periodType === "biweekly") && (
                  <div className="space-y-2">
                    <Label htmlFor="weekStartDate">Week Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="weekStartDate"
                        type="date"
                        value={weekStartDate}
                        onChange={(e) => setWeekStartDate(e.target.value)}
                        placeholder="dd/mm/yyyy"
                      />
                    </div>
                  </div>
                )}
                {periodType === "monthly" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="month">Month</Label>
                      <Select
                        value={month.toString()}
                        onValueChange={(value) => setMonth(parseInt(value))}
                      >
                        <SelectTrigger id="month">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <SelectItem key={m} value={m.toString()}>
                              {new Date(2024, m - 1, 1).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select
                        value={year.toString()}
                        onValueChange={(value) => setYear(parseInt(value))}
                      >
                        <SelectTrigger id="year">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePreviewPayroll}
                  disabled={
                    isPreviewingPayroll ||
                    ((periodType === "weekly" || periodType === "biweekly") && !weekStartDate) ||
                    (periodType === "monthly" && (!month || !year))
                  }
                >
                  {isPreviewingPayroll ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Previewing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Preview
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleProcessPayroll}
                  disabled={
                    isProcessingPayroll ||
                    ((periodType === "weekly" || periodType === "biweekly") && !weekStartDate) ||
                    (periodType === "monthly" && (!month || !year))
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessingPayroll ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Process Payroll
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Runs Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-light flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Payroll Runs
                  </CardTitle>
                  <CardDescription>
                    {payrollTotal > 0 ? `${payrollTotal} total run${payrollTotal !== 1 ? 's' : ''}` : "No payroll runs"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadPayrollRuns}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPayroll ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : payrollRuns.length === 0 ? (
                <div className="text-center py-12">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No payroll runs found</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
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
                              <Badge variant="outline" className="uppercase">
                                {run.period}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-foreground">
                                {format(new Date(run.periodStart), "MM/dd/yyyy")} - {format(new Date(run.periodEnd), "MM/dd/yyyy")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-foreground">{run.staffCount}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium text-foreground">
                                {formatCurrency(run.totalAmount)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(run.status)}
                            </TableCell>
                            <TableCell>
                              {run.processedAt ? (
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(run.processedAt), "MMMM dd, yyyy 'at' h:mm a")}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewPayrollDetails(run)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {payrollTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {payrollPage} of {payrollTotalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPayrollPage(prev => Math.max(1, prev - 1))}
                          disabled={payrollPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPayrollPage(prev => Math.min(payrollTotalPages, prev + 1))}
                          disabled={payrollPage === payrollTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="activity-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity Logs
              </CardTitle>
              <CardDescription>
                {activityLogs.length} total activit{activityLogs.length !== 1 ? 'ies' : 'y'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No activity logs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getActivityTypeBadge(log.activityType)}
                            <span className="text-sm font-medium text-foreground">
                              {log.staff.firstName} {log.staff.lastName}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mb-2">{log.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(log.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                          </div>
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

      {/* Payroll Detail Modal */}
      <Dialog open={isPayrollDetailOpen} onOpenChange={setIsPayrollDetailOpen}>
        <DialogContent className="!max-w-4xl !w-[95vw] max-h-[90vh] overflow-y-auto">
          {selectedPayrollRun && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-light">Payroll Run Details</DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedPayrollRun.periodStart), "MMM dd, yyyy")} - {format(new Date(selectedPayrollRun.periodEnd), "MMM dd, yyyy")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Summary */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="uppercase">
                        {selectedPayrollRun.period}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Staff Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {selectedPayrollRun.staffCount}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {formatCurrency(selectedPayrollRun.totalAmount)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStatusBadge(selectedPayrollRun.status)}
                    </CardContent>
                  </Card>
                </div>

                {/* Payslips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-light">Payslips</CardTitle>
                    <CardDescription>
                      {selectedPayrollRun.payslips.length} payslip{selectedPayrollRun.payslips.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPayrollRun.payslips.map((payslip) => (
                        <div
                          key={payslip.id}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="font-medium text-foreground">
                                {payslip.staff.firstName} {payslip.staff.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {payslip.staff.position} • {payslip.staff.department}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-foreground">
                                {formatCurrency(payslip.netPay)}
                              </div>
                              <div className="text-xs text-muted-foreground">Net Pay</div>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Gross Pay</div>
                              <div className="text-sm font-medium text-foreground">
                                {formatCurrency(payslip.grossPay)}
                              </div>
                            </div>
                            {payslip.salaryForPeriod > 0 && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Salary</div>
                                <div className="text-sm font-medium text-foreground">
                                  {formatCurrency(payslip.salaryForPeriod)}
                                </div>
                              </div>
                            )}
                            {payslip.hourlyPay && payslip.totalHours && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Hours</div>
                                <div className="text-sm font-medium text-foreground">
                                  {payslip.totalHours} hrs × {formatCurrency(payslip.hourlyPay)}
                                </div>
                              </div>
                            )}
                          </div>
                          {payslip.emailSent && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                Email sent {payslip.emailSentAt && format(new Date(payslip.emailSentAt), "MMM dd, yyyy 'at' h:mm a")}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Staff Member Modal */}
      <Dialog open={isAddStaffModalOpen} onOpenChange={setIsAddStaffModalOpen}>
        <DialogContent className="!max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Add Staff Member</DialogTitle>
            <DialogDescription>
              Create a new staff member account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Row 1: First Name, Last Name */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Row 2: Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>

            {/* Row 3: Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>

            {/* Row 4: Department, Role */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                    <SelectItem value="SALES">Sales</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STOCK_MANAGER">Stock Manager</SelectItem>
                    <SelectItem value="FINANCE_VIEW">Finance View</SelectItem>
                    <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                    <SelectItem value="SUPPORT_STAFF">Support Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 5: Position */}
            <div className="space-y-2">
              <Label htmlFor="position">
                Position <span className="text-destructive">*</span>
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Enter position"
              />
            </div>

            {/* Row 6: Salary, Hourly Rate */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">
                  Salary (USD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salary || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Row 7: Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddStaffModalOpen(false)
                  setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    department: "WAREHOUSE",
                    role: "STOCK_MANAGER",
                    position: "",
                    salary: 0,
                    hourlyRate: 0,
                    startDate: "",
                  })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStaff}
                disabled={isCreatingStaff}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isCreatingStaff ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Staff
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Temporary Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="!max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Staff Member Created</DialogTitle>
            <DialogDescription>
              Please save the temporary password for the new staff member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <Label className="text-sm text-muted-foreground mb-2 block">Temporary Password</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground font-mono text-sm">
                  {tempPassword}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPassword}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
              <p className="text-sm text-foreground">
                <strong>Important:</strong> Share this password with the staff member. They will need to change it on first login.
              </p>
            </div>
            <Button
              onClick={() => {
                setShowPasswordModal(false)
                setTempPassword(null)
              }}
              className="w-full bg-accent hover:bg-accent/90"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
