// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, RefreshCw, Eye, CheckCircle2, XCircle, AlertCircle, Filter } from "lucide-react";
import { formatDateWithTime } from "@/lib/date";
import { formatUSD } from "@/lib/currency";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

const getReturnStatusBadge = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "PENDING":
    case "UNDER_REVIEW":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Under Review</Badge>;
    case "APPROVED":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
    case "IN_TRANSIT":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">In Transit</Badge>;
    case "RECEIVED":
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Received</Badge>;
    case "COMPLETED":
    case "RESOLVED":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case "REJECTED":
    case "DENIED":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">{status || 'Unknown'}</Badge>;
  }
};

const getFaultBadge = (fault: string) => {
  const normalizedFault = fault?.toUpperCase() || '';
  switch (normalizedFault) {
    case "SELLER_FAULT":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Seller Fault</Badge>;
    case "BUYER_FAULT":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Buyer Fault</Badge>;
    case "LOGISTICS_FAULT":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Logistics Fault</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">{fault || 'Pending'}</Badge>;
  }
};

export default function Page() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [declineExchangeModalOpen, setDeclineExchangeModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState<string | null>(null);
  const [sellerResponse, setSellerResponse] = useState<string>('');
  const [submittingResponse, setSubmittingResponse] = useState<boolean>(false);
  const { accessToken } = useSellerAuth();
  const { toast } = useToast();

  // Load returns
  const loadReturns = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await apiClient.request<{
        success: boolean;
        data?: {
          returns: any[];
          pagination?: any;
        };
      }>(`/api/seller/returns?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.success && response.data) {
        setReturns(response.data.returns || []);
      }
    } catch (err) {
      console.error("Failed to load returns:", err);
      toast({
        title: "Error",
        description: "Failed to load returns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (accessToken) {
      loadReturns();
    }
  }, [accessToken, statusFilter]);


  // Confirm receipt
  const handleConfirmReceipt = async (returnId: string) => {
    if (!accessToken) return;

    if (!confirm(`Are you sure you want to confirm receipt of this returned item? You must confirm within 12 hours of delivery.`)) {
      return;
    }

    try {
      setConfirmingReceipt(returnId);
      const response = await apiClient.request<{
        success: boolean;
        message: string;
        data?: {
          disputeId: string;
          confirmedAt: string;
        };
      }>(`/api/seller/returns/${returnId}/confirm-receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        const confirmedAt = response.data?.confirmedAt || new Date().toISOString();
        
        // Update the selected return with confirmation data
        if (selectedReturn && selectedReturn.id === returnId) {
          setSelectedReturn({
            ...selectedReturn,
            sellerReceiptConfirmed: true,
            sellerReceiptConfirmedAt: confirmedAt,
          });
        }
        
        // Update the returns list in real-time
        setReturns(prevReturns => 
          prevReturns.map(returnItem => 
            returnItem.id === returnId
              ? {
                  ...returnItem,
                  sellerReceiptConfirmed: true,
                  sellerReceiptConfirmedAt: confirmedAt,
                }
              : returnItem
          )
        );
        
        toast({
          title: "Success",
          description: response.message || "Receipt confirmed successfully",
        });
        
        // Refresh the list in the background to ensure data consistency
        loadReturns();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to confirm receipt",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Failed to confirm receipt:", err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to confirm receipt",
        variant: "destructive",
      });
    } finally {
      setConfirmingReceipt(null);
    }
  };

  // Decline exchange
  const handleDeclineExchange = async () => {
    if (!accessToken || !selectedReturn) return;

    try {
      const response = await apiClient.request<{
        success: boolean;
        message: string;
      }>(`/api/seller/returns/${selectedReturn.id}/decline-exchange`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Exchange declined. Tier 1 reroute will be initiated.",
        });
        setDeclineExchangeModalOpen(false);
        setSelectedReturn(null);
        loadReturns();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to decline exchange",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Failed to decline exchange:", err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to decline exchange",
        variant: "destructive",
      });
    }
  };

  // Submit seller response
  const handleSubmitResponse = async () => {
    if (!accessToken || !selectedReturn) return;

    const trimmedResponse = sellerResponse.trim();

    // Validate response
    if (!trimmedResponse) {
      toast({
        title: "Validation Error",
        description: "Response is required",
        variant: "destructive",
      });
      return;
    }

    if (trimmedResponse.length < 10) {
      toast({
        title: "Validation Error",
        description: "Response must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    if (trimmedResponse.length > 2000) {
      toast({
        title: "Validation Error",
        description: "Response must not exceed 2000 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingResponse(true);
      const response = await apiClient.request<{
        success: boolean;
        message: string;
        data?: {
          sellerResponse: string;
        };
      }>(`/api/seller/returns/${selectedReturn.id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: trimmedResponse }),
      });

      if (response.success) {
        // Update the selected return with the new response
        setSelectedReturn({
          ...selectedReturn,
          sellerResponse: trimmedResponse,
        });
        
        // Update the returns list
        setReturns(prevReturns => 
          prevReturns.map(returnItem => 
            returnItem.id === selectedReturn.id
              ? {
                  ...returnItem,
                  sellerResponse: trimmedResponse,
                }
              : returnItem
          )
        );
        
        setSellerResponse('');
        toast({
          title: "Success",
          description: response.message || "Your response has been submitted successfully",
        });
        
        // Refresh the list to ensure data consistency
        loadReturns();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit response",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Failed to submit response:", err);
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to submit response",
        variant: "destructive",
      });
    } finally {
      setSubmittingResponse(false);
    }
  };


  if (loading && returns.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Returns</h1>
                <p className="text-gray-600">Loading returns...</p>
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
        {/* Header Section */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                Returns
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Manage return requests and confirm receipt of returned items
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={loadReturns}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="RECEIVED">Received</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>


        {/* Returns List */}
        <div className="bg-white border border-gray-200 shadow-sm">
          {returns.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <RotateCcw className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-xl font-bold text-gray-900 mb-3">No returns found</div>
              <div className="text-gray-600">
                {statusFilter !== 'all'
                  ? "Try adjusting your filter criteria."
                  : "You don't have any return requests at this time."
                }
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Return ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fault</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {returns.map((returnItem) => (
                    <tr key={returnItem.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">#{returnItem.id?.slice(0, 8)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {returnItem.order?.orderNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {returnItem.order?.totalAmount ? formatUSD(returnItem.order.totalAmount) : ''}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge className={returnItem.requestType === 'EXCHANGE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                          {returnItem.requestType || 'RETURN'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getReturnStatusBadge(returnItem.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getFaultBadge(returnItem.faultClassification)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {returnItem.createdAt ? formatDateWithTime(returnItem.createdAt) : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReturn(returnItem);
                              setSellerResponse('');
                              setViewModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          {returnItem.requestType === 'EXCHANGE' && returnItem.status === 'APPROVED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReturn(returnItem);
                                setDeclineExchangeModalOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                              title="Decline Exchange"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
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
        </div>

        {/* View Return Details Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Return Details</DialogTitle>
            </DialogHeader>
            {selectedReturn && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Return ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-mono font-bold text-gray-900">#{selectedReturn.id?.slice(0, 8)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getReturnStatusBadge(selectedReturn.status)}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Return Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Request Type</div>
                      <div className="text-sm font-medium text-gray-900">{selectedReturn.requestType || 'RETURN'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Dispute Type</div>
                      <div className="text-sm font-medium text-gray-900">{selectedReturn.disputeType || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Return Reason</div>
                      <div className="text-sm font-medium text-gray-900">{selectedReturn.returnReason || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Fault Classification</div>
                      {getFaultBadge(selectedReturn.faultClassification)}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Order Number</div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedReturn.order?.orderNumber || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Order Amount</div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedReturn.order?.totalAmount ? formatUSD(selectedReturn.order.totalAmount) : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      {getReturnStatusBadge(selectedReturn.status)}
                    </div>
                    {selectedReturn.logisticsCostChargedTo && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Logistics Cost Charged To</div>
                        <div className="text-sm font-medium text-gray-900">{selectedReturn.logisticsCostChargedTo}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Created</div>
                      <div className="text-sm text-gray-900">
                        {selectedReturn.createdAt ? formatDateWithTime(selectedReturn.createdAt) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReturn.trackingNumber && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Tracking</h3>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedReturn.trackingNumber}
                    </div>
                  </div>
                )}

                {/* Buyer Evidence Images */}
                {selectedReturn.buyerEvidenceUrls && selectedReturn.buyerEvidenceUrls.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Buyer Evidence Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedReturn.buyerEvidenceUrls.map((url: string, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Buyer evidence ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(url, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Evidence Images */}
                {selectedReturn.sellerEvidenceUrls && selectedReturn.sellerEvidenceUrls.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Seller Evidence Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedReturn.sellerEvidenceUrls.map((url: string, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Seller evidence ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(url, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ECC Baseline Images (Pre-Shipment Evidence) */}
                {(selectedReturn.eccBaseline?.evidenceUrls || selectedReturn.order?.eccBaselineUrls) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Pre-Shipment Evidence (ECC Baseline)</h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Evidence uploaded before shipping to protect against fraudulent claims
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(selectedReturn.eccBaseline?.evidenceUrls || selectedReturn.order?.eccBaselineUrls || []).map((url: string, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`ECC baseline ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(url, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedReturn.eccBaseline?.vinVerifiedLabelUrl && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">VIN Verified Label:</p>
                        <div className="relative group inline-block">
                          <img
                            src={selectedReturn.eccBaseline.vinVerifiedLabelUrl}
                            alt="VIN Verified Label"
                            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(selectedReturn.eccBaseline.vinVerifiedLabelUrl, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Buyer Description */}
                {selectedReturn.buyerDescription && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Buyer Description</h3>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedReturn.buyerDescription}</p>
                    </div>
                  </div>
                )}

                {/* Seller Response Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Seller Response/Comment</h3>
                  {selectedReturn.sellerResponse ? (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedReturn.sellerResponse}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="seller-response" className="text-sm font-medium text-gray-700">
                          Add your response or comment
                        </Label>
                        <Textarea
                          id="seller-response"
                          value={sellerResponse}
                          onChange={(e) => setSellerResponse(e.target.value)}
                          placeholder="I shipped the correct part according to the order. The part number matches the order details. Please check the ECC baseline photos I uploaded."
                          className="mt-2 min-h-[120px]"
                          maxLength={2000}
                        />
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            Minimum 10 characters, maximum 2000 characters
                          </p>
                          <p className={`text-xs ${
                            sellerResponse.length < 10 
                              ? 'text-red-500' 
                              : sellerResponse.length > 2000 
                              ? 'text-red-500' 
                              : 'text-gray-500'
                          }`}>
                            {sellerResponse.length} / 2000
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleSubmitResponse}
                        disabled={submittingResponse || sellerResponse.trim().length < 10 || sellerResponse.trim().length > 2000}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                      >
                        {submittingResponse ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Response
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Confirm Receipt Button */}
                {!selectedReturn.sellerReceiptConfirmed && (selectedReturn.status === 'IN_TRANSIT' || selectedReturn.status === 'APPROVED' || selectedReturn.status === 'UNDER_REVIEW') && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <strong>Important:</strong> Confirm receipt within 12 hours of delivery. After confirmation, admin will perform final inspection and determine fault classification.
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleConfirmReceipt(selectedReturn.id)}
                      disabled={confirmingReceipt === selectedReturn.id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      {confirmingReceipt === selectedReturn.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Confirm Receipt
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Receipt Already Confirmed */}
                {selectedReturn.sellerReceiptConfirmed && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-green-800">Receipt Confirmed</div>
                          {selectedReturn.sellerReceiptConfirmedAt && (
                            <div className="text-xs text-green-700 mt-1">
                              Confirmed on: {formatDateWithTime(selectedReturn.sellerReceiptConfirmedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>


        {/* Decline Exchange Modal */}
        <Dialog open={declineExchangeModalOpen} onOpenChange={setDeclineExchangeModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Decline Exchange Request</DialogTitle>
              <DialogDescription>
                Declining this exchange will trigger Tier 1 Reroute. The system will find the highest-rated seller with the same product to fulfill the exchange.
              </DialogDescription>
            </DialogHeader>
            {selectedReturn && (
              <div className="mt-4">
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-sm font-medium text-gray-700">Return ID:</div>
                  <div className="text-lg font-mono font-bold text-gray-900">#{selectedReturn.id?.slice(0, 8)}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Order: {selectedReturn.order?.orderNumber || 'N/A'}
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-800">
                      <strong>Warning:</strong> You will be charged the cost difference plus a penalty fee. Your SRI may be impacted.
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDeclineExchangeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeclineExchange}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline Exchange
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

