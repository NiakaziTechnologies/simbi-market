// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Banknote,
  Plus,
  TrendingUp,
  Calculator,
  Building,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Send,
  DollarSign,
  Package,
  AlertCircle
} from "lucide-react";
import { formatUSD } from "@/lib/currency";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";

type LoanOffering = {
  id: string;
  institution: string;
  institutionLogo: string;
  loanType: string;
  interestRate: number;
  maxAmount: number;
  minAmount: number;
  term: string;
  requirements: string[];
  features: string[];
};

type LoanApplication = {
  id: string;
  institution: string;
  amount: number;
  purpose: string;
  inventoryType: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedDate?: string;
  responseDate?: string;
  approvedAmount?: number;
  interestRate?: number;
  term?: string;
};

export default function FinancingPage() {
  const [loanOfferings, setLoanOfferings] = useState<LoanOffering[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loanFormOpen, setLoanFormOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<LoanOffering | null>(null);
  const [newApplication, setNewApplication] = useState({
    amount: 0,
    purpose: "",
    inventoryType: ""
  });
  const { accessToken } = useSellerAuth();

  // Load financing data from API
  useEffect(() => {
    const loadFinancingData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load loan partners from API
        const partnersData = await apiClient.request<{ success: boolean; message: string; data: any[] }>(
          '/loans/partners',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (partnersData.success && partnersData.data) {
          // Transform API response to match LoanOffering type
          const offerings: LoanOffering[] = partnersData.data.map((partner: any) => ({
            id: partner.id,
            institution: partner.name,
            institutionLogo: "🏦",
            loanType: "Business Loan",
            interestRate: partner.interestRate,
            maxAmount: partner.maxAmount,
            minAmount: partner.minAmount,
            term: `${partner.termMonths} months`,
            requirements: ["Business registration", "Financial statements", "Good credit history"],
            features: ["Quick approval", "Flexible terms", "No collateral required"]
          }));
          setLoanOfferings(offerings);
        }

        // Load loan applications from API
        const applicationsData = await apiClient.request<{ success: boolean; message: string; data?: { applications: any[] } }>(
          '/loans/applications',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (applicationsData.success && applicationsData.data?.applications) {
          setApplications(applicationsData.data.applications || []);
        }

      } catch (err) {
        console.error('Financing data loading error:', err);
        setError('Failed to load financing data');
      } finally {
        setLoading(false);
      }
    };

    loadFinancingData();
  }, [accessToken]);

  // Calculate financing metrics
  const financingMetrics = useMemo(() => {
    const totalApplied = applications
      .filter(app => app.status !== "DRAFT")
      .reduce((sum, app) => sum + app.amount, 0);

    const approvedAmount = applications
      .filter(app => app.status === "APPROVED")
      .reduce((sum, app) => sum + (app.approvedAmount || 0), 0);

    const pendingApplications = applications.filter(app =>
      app.status === "SUBMITTED" || app.status === "UNDER_REVIEW"
    ).length;

    return {
      totalApplied,
      approvedAmount,
      pendingApplications,
      averageRate: loanOfferings.reduce((sum, offering) => sum + offering.interestRate, 0) / loanOfferings.length
    };
  }, [applications, loanOfferings]);

  // Submit loan application - US-S-309 & US-S-310
  const submitLoanApplication = async () => {
    if (!selectedOffering || !newApplication.amount || !newApplication.purpose) {
      alert("Please fill in all required fields");
      return;
    }

    if (newApplication.amount < selectedOffering.minAmount || newApplication.amount > selectedOffering.maxAmount) {
      alert(`Amount must be between ${formatUSD(selectedOffering.minAmount)} and ${formatUSD(selectedOffering.maxAmount)}`);
      return;
    }

    try {
      const data = await apiClient.post<{ success: boolean; message: string }>(
        '/loans/applications',
        {
          partnerId: selectedOffering.id,
          requestedAmount: newApplication.amount,
          purpose: newApplication.purpose,
          businessRevenue: 150000, // This would come from dashboard data
          businessExpenses: 85000, // This would come from dashboard data
          collateralDescription: newApplication.inventoryType,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (data.success) {
        // Refresh the applications list
        window.location.reload();
      } else {
        alert(`Failed to submit application: ${data.message}`);
      }
    } catch (error) {
      console.error("Loan application error:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "UNDER_REVIEW":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "UNDER_REVIEW":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-[#F39C12] rounded-2xl flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                Business Financing
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Access capital from trusted financial partners for inventory and growth
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setLoanFormOpen(true)}
                className="bg-[#F39C12] hover:bg-[#E67E22] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Apply for Loan
              </Button>
            </div>
          </div>
        </div>

        {/* Financing Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applied</p>
                  <p className="text-2xl font-bold text-gray-900">{formatUSD(financingMetrics.totalApplied)}</p>
                  <p className="text-sm text-blue-600">All applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{formatUSD(financingMetrics.approvedAmount)}</p>
                  <p className="text-sm text-green-600">Total approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{financingMetrics.pendingApplications}</p>
                  <p className="text-sm text-orange-600">Under review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Interest</p>
                  <p className="text-2xl font-bold text-gray-900">{financingMetrics.averageRate.toFixed(1)}%</p>
                  <p className="text-sm text-purple-600">Partner rates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Institutions & Loan Offerings - US-S-308 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Offerings */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#3498DB]" />
                Partner Loan Offerings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading loan offerings...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-3">Error Loading Loan Offerings</div>
                  <div className="text-gray-600 mb-8 max-w-md mx-auto">{error}</div>
                  <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {loanOfferings.map((offering) => (
                  <div key={offering.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{offering.institutionLogo}</div>
                        <div>
                          <p className="font-bold text-gray-900">{offering.institution}</p>
                          <p className="text-sm text-gray-600">{offering.loanType}</p>
                        </div>
                      </div>
                      <Badge className="bg-[#3498DB] text-white">
                        {offering.interestRate}% APR
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Amount Range</p>
                        <p className="font-semibold text-gray-900">
                          {formatUSD(offering.minAmount)} - {formatUSD(offering.maxAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Term</p>
                        <p className="font-semibold text-gray-900">{offering.term}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Key Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {offering.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedOffering(offering);
                        setLoanFormOpen(true);
                      }}
                      className="w-full bg-[#3498DB] hover:bg-[#2980B9] text-white"
                    >
                      Apply Now
                    </Button>
                  </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Applications */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3498DB]" />
                My Loan Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Banknote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No applications yet</p>
                    <p className="text-sm text-gray-400">
                      Apply for your first loan to get started
                    </p>
                  </div>
                ) : (
                  applications.map((application) => (
                    <div key={application.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(application.status)}
                          <div>
                            <p className="font-bold text-gray-900">{application.institution}</p>
                            <p className="text-sm text-gray-600">
                              {formatUSD(application.amount)} for {application.inventoryType}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{application.purpose}</p>

                      {application.submittedDate && (
                        <p className="text-xs text-gray-500">
                          Submitted: {new Date(application.submittedDate).toLocaleDateString()}
                        </p>
                      )}

                      {application.status === "APPROVED" && application.approvedAmount && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-800">
                            🎉 Approved: {formatUSD(application.approvedAmount)} at {application.interestRate}% for {application.term}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Application Dialog - US-S-309 */}
        <Dialog open={loanFormOpen} onOpenChange={setLoanFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#3498DB]" />
                Loan Application - {selectedOffering?.institution}
              </DialogTitle>
            </DialogHeader>

            {selectedOffering && (
              <div className="space-y-6">
                {/* Loan Details Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Interest Rate</p>
                      <p className="text-blue-900 font-bold">{selectedOffering.interestRate}% APR</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Amount Range</p>
                      <p className="text-blue-900 font-bold">
                        {formatUSD(selectedOffering.minAmount)} - {formatUSD(selectedOffering.maxAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Term</p>
                      <p className="text-blue-900 font-bold">{selectedOffering.term}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Loan Type</p>
                      <p className="text-blue-900 font-bold">{selectedOffering.loanType}</p>
                    </div>
                  </div>
                </div>

                {/* Application Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount (USD) *
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={newApplication.amount || ""}
                      onChange={(e) => setNewApplication({...newApplication, amount: parseFloat(e.target.value) || 0})}
                      className="border-gray-300 focus:ring-[#3498DB] focus:border-[#3498DB]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Min: {formatUSD(selectedOffering.minAmount)} • Max: {formatUSD(selectedOffering.maxAmount)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose *
                    </label>
                    <select
                      value={newApplication.purpose}
                      onChange={(e) => setNewApplication({...newApplication, purpose: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#3498DB] focus:border-[#3498DB]"
                    >
                      <option value="">Select purpose</option>
                      <option value="Inventory replenishment">Inventory replenishment</option>
                      <option value="Working capital">Working capital</option>
                      <option value="Equipment purchase">Equipment purchase</option>
                      <option value="Business expansion">Business expansion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inventory Type to Replenish *
                    </label>
                    <select
                      value={newApplication.inventoryType}
                      onChange={(e) => setNewApplication({...newApplication, inventoryType: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#3498DB] focus:border-[#3498DB]"
                    >
                      <option value="">Select inventory type</option>
                      <option value="Engine parts">Engine parts</option>
                      <option value="Brake systems">Brake systems</option>
                      <option value="Electrical components">Electrical components</option>
                      <option value="Suspension parts">Suspension parts</option>
                      <option value="General inventory">General inventory</option>
                    </select>
                  </div>
                </div>

                {/* Business Information Sharing Notice - US-S-310 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800 mb-2">Secure Data Sharing</p>
                      <p className="text-green-700">
                        Upon submission, your verified sales history, inventory value, and store health score
                        will be automatically shared with {selectedOffering.institution} via secure API.
                        No bank credentials or private login information will be transmitted.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-800 mb-3">Requirements Checklist:</p>
                  <div className="space-y-2">
                    {selectedOffering.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLoanFormOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitLoanApplication}
                    className="bg-[#3498DB] hover:bg-[#2980B9] text-white"
                  >
                    Submit Application
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}