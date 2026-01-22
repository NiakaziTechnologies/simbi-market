// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Clock,
  LogIn,
  LogOut,
  Timer,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { formatDateWithTime } from "@/lib/date";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

export default function TimeTrackingPage() {
  const { accessToken, userType } = useSellerAuth();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<any>(null);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [timeLogsSummary, setTimeLogsSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [currentHours, setCurrentHours] = useState(0);
  
  // Modal states
  const [clockInDialogOpen, setClockInDialogOpen] = useState(false);
  const [clockOutDialogOpen, setClockOutDialogOpen] = useState(false);
  const [clockInNotes, setClockInNotes] = useState("");
  const [clockOutNotes, setClockOutNotes] = useState("");
  
  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Check status on load and periodically
  const checkStatus = async () => {
    if (!accessToken || userType !== 'staff') return;

    try {
      const response = await apiClient.request<{
        success: boolean;
        data?: {
          isClockedIn: boolean;
          currentShift?: any;
          currentHours?: number;
          message?: string;
        };
      }>('/api/staff/time-logs/status', {
        method: 'GET',
      });

      if (response.success && response.data) {
        setStatus(response.data);
        if (response.data.currentHours) {
          setCurrentHours(response.data.currentHours);
        }
      }
    } catch (err: any) {
      console.error('Failed to check status:', err);
    }
  };

  // Load time logs
  const loadTimeLogs = async () => {
    if (!accessToken || userType !== 'staff') return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', '50');

      const response = await apiClient.request<{
        success: boolean;
        data?: {
          timeLogs?: any[];
          summary?: {
            totalHours?: number;
            totalDays?: number;
            averageHoursPerDay?: number;
          };
        };
      }>(`/api/staff/time-logs?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success && response.data) {
        setTimeLogs(Array.isArray(response.data.timeLogs) ? response.data.timeLogs : []);
        setTimeLogsSummary(response.data.summary || null);
      }
    } catch (err: any) {
      console.error('Failed to load time logs:', err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to load time logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clock in
  const handleClockIn = async () => {
    if (!accessToken) return;

    try {
      setClockingIn(true);
      const response = await apiClient.request<{
        success: boolean;
        message?: string;
        data?: any;
      }>('/api/staff/time-logs/clock-in', {
        method: 'POST',
        body: JSON.stringify({
          notes: clockInNotes || undefined
        }),
      });

      if (response.success) {
        toast({
          title: "Clocked In",
          description: response.message || "You have successfully clocked in",
        });
        setClockInDialogOpen(false);
        setClockInNotes("");
        await checkStatus();
        await loadTimeLogs();
      } else {
        throw new Error(response.message || "Failed to clock in");
      }
    } catch (err: any) {
      console.error('Failed to clock in:', err);
      toast({
        title: "Error",
        description: err?.data?.message || err?.message || "Failed to clock in",
        variant: "destructive",
      });
    } finally {
      setClockingIn(false);
    }
  };

  // Clock out
  const handleClockOut = async () => {
    if (!accessToken) return;

    try {
      setClockingOut(true);
      const response = await apiClient.request<{
        success: boolean;
        message?: string;
        data?: any;
      }>('/api/staff/time-logs/clock-out', {
        method: 'POST',
        body: JSON.stringify({
          notes: clockOutNotes || undefined
        }),
      });

      if (response.success) {
        toast({
          title: "Clocked Out",
          description: response.message || "You have successfully clocked out",
        });
        setClockOutDialogOpen(false);
        setClockOutNotes("");
        await checkStatus();
        await loadTimeLogs();
      } else {
        throw new Error(response.message || "Failed to clock out");
      }
    } catch (err: any) {
      console.error('Failed to clock out:', err);
      toast({
        title: "Error",
        description: err?.data?.message || err?.message || "Failed to clock out",
        variant: "destructive",
      });
    } finally {
      setClockingOut(false);
    }
  };

  // Update timer for current shift
  useEffect(() => {
    if (status?.isClockedIn && status?.currentShift?.clockIn) {
      const updateTimer = () => {
        const clockInTime = new Date(status.currentShift.clockIn);
        const now = new Date();
        const diffMs = now.getTime() - clockInTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        setCurrentHours(diffHours);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute

      return () => clearInterval(interval);
    } else {
      setCurrentHours(0);
    }
  }, [status]);

  // Load data on mount
  useEffect(() => {
    if (accessToken && userType === 'staff') {
      checkStatus();
      loadTimeLogs();
    }
  }, [accessToken, userType]);

  // Reload time logs when date filters change
  useEffect(() => {
    if (accessToken && userType === 'staff') {
      loadTimeLogs();
    }
  }, [startDate, endDate]);

  // Only show for staff
  if (userType !== 'staff') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">This page is only available for staff members.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-gray-600 mt-1">Manage your clock in/out and view your time logs</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              checkStatus();
              loadTimeLogs();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {status?.isClockedIn ? (
                  <>
                    <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Clocked In
                    </Badge>
                    {status?.currentShift?.clockIn && (
                      <div className="text-sm text-gray-600">
                        Since: {formatDateWithTime(status.currentShift.clockIn)}
                      </div>
                    )}
                    {currentHours > 0 && (
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Timer className="h-4 w-4" />
                        {currentHours.toFixed(2)} hours
                      </div>
                    )}
                  </>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Clocked Out
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {status?.isClockedIn ? (
                  <Button
                    onClick={() => setClockOutDialogOpen(true)}
                    variant="destructive"
                    disabled={clockingOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {clockingOut ? "Clocking Out..." : "Clock Out"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setClockInDialogOpen(true)}
                    disabled={clockingIn}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {clockingIn ? "Clocking In..." : "Clock In"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        {timeLogsSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {timeLogsSummary.totalHours?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <Timer className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Days</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {timeLogsSummary.totalDays || 0}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Hours/Day</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {timeLogsSummary.averageHoursPerDay?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Time Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Time Logs
              </CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : timeLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No time logs found for the selected period
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours Worked</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.date ? new Date(log.date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {log.clockIn ? formatDateWithTime(log.clockIn) : '-'}
                      </TableCell>
                      <TableCell>
                        {log.clockOut ? formatDateWithTime(log.clockOut) : '-'}
                      </TableCell>
                      <TableCell>
                        {log.hoursWorked !== null && log.hoursWorked !== undefined
                          ? `${log.hoursWorked.toFixed(2)} hrs`
                          : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Clock In Dialog */}
        <Dialog open={clockInDialogOpen} onOpenChange={setClockInDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clock In</DialogTitle>
              <DialogDescription>
                Start your work shift. You can add optional notes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clockInNotes">Notes (Optional)</Label>
                <Textarea
                  id="clockInNotes"
                  value={clockInNotes}
                  onChange={(e) => setClockInNotes(e.target.value)}
                  placeholder="e.g., Starting morning shift"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setClockInDialogOpen(false);
                    setClockInNotes("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleClockIn} disabled={clockingIn}>
                  {clockingIn ? "Clocking In..." : "Clock In"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clock Out Dialog */}
        <Dialog open={clockOutDialogOpen} onOpenChange={setClockOutDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clock Out</DialogTitle>
              <DialogDescription>
                End your work shift. You can add optional notes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {status?.currentShift?.clockIn && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Clocked in: {formatDateWithTime(status.currentShift.clockIn)}
                  </p>
                  {currentHours > 0 && (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      Total hours: {currentHours.toFixed(2)} hrs
                    </p>
                  )}
                </div>
              )}
              <div>
                <Label htmlFor="clockOutNotes">Notes (Optional)</Label>
                <Textarea
                  id="clockOutNotes"
                  value={clockOutNotes}
                  onChange={(e) => setClockOutNotes(e.target.value)}
                  placeholder="e.g., Completed all tasks for the day"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setClockOutDialogOpen(false);
                    setClockOutNotes("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleClockOut} disabled={clockingOut} variant="destructive">
                  {clockingOut ? "Clocking Out..." : "Clock Out"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

