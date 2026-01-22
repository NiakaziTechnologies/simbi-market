"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, RefreshCw, Eye, CheckCircle2, XCircle, AlertCircle, Filter } from "lucide-react";

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

const getReturnStatusBadge = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || '';
  switch (normalizedStatus) {
    case "PENDING":
    case "UNDER_REVIEW":
      return <Badge className="border-yellow-500/30 text-yellow-400 bg-yellow-500/5">Under Review</Badge>;
    case "APPROVED":
      return <Badge className="border-blue-500/30 text-blue-400 bg-blue-500/5">Approved</Badge>;
    case "IN_TRANSIT":
      return <Badge className="border-purple-500/30 text-purple-400 bg-purple-500/5">In Transit</Badge>;
    case "RECEIVED":
      return <Badge className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">Received</Badge>;
    case "COMPLETED":
    case "RESOLVED":
      return <Badge className="border-green-500/30 text-green-400 bg-green-500/5">Completed</Badge>;
    case "REJECTED":
    case "DENIED":
      return <Badge className="border-red-500/30 text-red-400 bg-red-500/5">Rejected</Badge>;
    default:
      return <Badge className="border-muted text-muted-foreground bg-muted/30">{status || 'Unknown'}</Badge>;
  }
};

const getFaultBadge = (fault: string) => {
  const normalizedFault = fault?.toUpperCase() || '';
  switch (normalizedFault) {
    case "SELLER_FAULT":
      return <Badge className="border-red-500/30 text-red-400 bg-red-500/5">Seller Fault</Badge>;
    case "BUYER_FAULT":
      return <Badge className="border-blue-500/30 text-blue-400 bg-blue-500/5">Buyer Fault</Badge>;
    case "LOGISTICS_FAULT":
      return <Badge className="border-orange-500/30 text-orange-400 bg-orange-500/5">Logistics Fault</Badge>;
    default:
      return <Badge className="border-muted text-muted-foreground bg-muted/30">{fault || 'Pending'}</Badge>;
  }
};

// Mock returns data
const mockReturns = [
  {
    id: "RET-001",
    order: { orderNumber: "ORD-001", totalAmount: 1250 },
    requestType: "RETURN",
    disputeType: "DEFECTIVE_PRODUCT",
    returnReason: "Product arrived damaged",
    status: "UNDER_REVIEW",
    faultClassification: "LOGISTICS_FAULT",
    createdAt: "2024-01-18T10:30:00Z",
    buyerDescription: "The brake pads arrived with damaged packaging and one pad was cracked.",
    sellerResponse: null,
    buyerEvidenceUrls: ["/placeholder.jpg", "/placeholder.jpg"],
    sellerEvidenceUrls: [],
    eccBaseline: {
      evidenceUrls: ["/placeholder.jpg"],
      vinVerifiedLabelUrl: "/placeholder.jpg"
    },
    trackingNumber: "TRK123456789",
    logisticsCostChargedTo: "SELLER",
    sellerReceiptConfirmed: false
  },
  {
    id: "RET-002",
    order: { orderNumber: "ORD-002", totalAmount: 890 },
    requestType: "EXCHANGE",
    disputeType: "WRONG_ITEM",
    returnReason: "Received wrong air filter",
    status: "APPROVED",
    faultClassification: "SELLER_FAULT",
    createdAt: "2024-01-17T14:20:00Z",
    buyerDescription: "Ordered Honda Civic filter but received Toyota Camry filter.",
    sellerResponse: "I apologize for the error. I will ship the correct filter immediately.",
    buyerEvidenceUrls: ["/placeholder.jpg"],
    sellerEvidenceUrls: ["/placeholder.jpg"],
    eccBaseline: null,
    trackingNumber: null,
    logisticsCostChargedTo: null,
    sellerReceiptConfirmed: false
  },
  {
    id: "RET-003",
    order: { orderNumber: "ORD-003", totalAmount: 2100 },
    requestType: "RETURN",
    disputeType: "CHANGED_MIND",
    returnReason: "Changed mind about purchase",
    status: "REJECTED",
    faultClassification: "BUYER_FAULT",
    createdAt: "2024-01-16T09:15:00Z",
    buyerDescription: "No longer need these spark plugs.",
    sellerResponse: "According to our return policy, returns are only accepted for defective products within 30 days.",
    buyerEvidenceUrls: [],
    sellerEvidenceUrls: [],
    eccBaseline: null,
    trackingNumber: null,
    logisticsCostChargedTo: null,
    sellerReceiptConfirmed: false
  }
];

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

  // Load returns
  const loadReturns = async () => {
    setLoading(true);
    setTimeout(() => {
      setReturns(mockReturns);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // Confirm receipt
  const handleConfirmReceipt = async (returnId: string) => {
    if (!confirm(`Are you sure you want to confirm receipt of this returned item? You must confirm within 12 hours of delivery.`)) {
      return;
    }

    setConfirmingReceipt(returnId);
    setTimeout(() => {
      const confirmedAt = new Date().toISOString();

      if (selectedReturn && selectedReturn.id === returnId) {
        setSelectedReturn({
          ...selectedReturn,
          sellerReceiptConfirmed: true,
          sellerReceiptConfirmedAt: confirmedAt,
        });
      }

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

      setConfirmingReceipt(null);
    }, 1000);
  };

  // Decline exchange
  const handleDeclineExchange = async () => {
    setTimeout(() => {
      setDeclineExchangeModalOpen(false);
      setSelectedReturn(null);
      loadReturns();
    }, 500);
  };

  // Submit seller response
  const handleSubmitResponse = async () => {
    const trimmedResponse = sellerResponse.trim();

    if (!trimmedResponse) {
      alert("Response is required");
      return;
    }

    if (trimmedResponse.length < 10) {
      alert("Response must be at least 10 characters long");
      return;
    }

    if (trimmedResponse.length > 2000) {
      alert("Response must not exceed 2000 characters");
      return;
    }

    setSubmittingResponse(true);
    setTimeout(() => {
      setSubmittingResponse(false);
      setSelectedReturn({
        ...selectedReturn,
        sellerResponse: trimmedResponse,
      });

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
    }, 1000);
  };

  if (loading && returns.length === 0) {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Returns</h1>
              <p className="text-muted-foreground">Loading returns...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-4">
              <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              Returns
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Manage return requests and confirm receipt of returned items
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadReturns}
              className="border-border text-foreground hover:bg-accent/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
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
      <div className="glass-card border border-border">
        {returns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <RotateCcw className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold text-foreground mb-3">No returns found</div>
            <div className="text-muted-foreground">
              {statusFilter !== 'all'
                ? "Try adjusting your filter criteria."
                : "You don't have any return requests at this time."
              }
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Return ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fault</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {returns.map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-foreground">#{returnItem.id?.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {returnItem.order?.orderNumber || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {returnItem.order?.totalAmount ? formatUSD(returnItem.order.totalAmount) : ''}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge className={returnItem.requestType === 'EXCHANGE' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-gray-500/30 text-gray-400 bg-gray-500/5'}>
                        {returnItem.requestType || 'RETURN'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getReturnStatusBadge(returnItem.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getFaultBadge(returnItem.faultClassification)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
                          className="h-8 w-8 p-0 hover:bg-accent/10"
                        >
                          <Eye className="h-4 w-4 text-accent" />
                        </Button>
                        {returnItem.requestType === 'EXCHANGE' && returnItem.status === 'APPROVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReturn(returnItem);
                              setDeclineExchangeModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 hover:bg-red-500/10"
                            title="Decline Exchange"
                          >
                            <XCircle className="h-4 w-4 text-red-400" />
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Return Details</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Return ID</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-mono font-bold text-foreground">#{selectedReturn.id?.slice(0, 8)}</div>
                  </CardContent>
                </Card>
                <Card className="glass-card border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getReturnStatusBadge(selectedReturn.status)}
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Return Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Request Type</div>
                    <div className="text-sm font-medium text-foreground">{selectedReturn.requestType || 'RETURN'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Dispute Type</div>
                    <div className="text-sm font-medium text-foreground">{selectedReturn.disputeType || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Return Reason</div>
                    <div className="text-sm font-medium text-foreground">{selectedReturn.returnReason || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Fault Classification</div>
                    {getFaultBadge(selectedReturn.faultClassification)}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Order Number</div>
                    <div className="text-sm font-medium text-foreground">
                      {selectedReturn.order?.orderNumber || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Order Amount</div>
                    <div className="text-sm font-medium text-foreground">
                      {selectedReturn.order?.totalAmount ? formatUSD(selectedReturn.order.totalAmount) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    {getReturnStatusBadge(selectedReturn.status)}
                  </div>
                  {selectedReturn.logisticsCostChargedTo && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Logistics Cost Charged To</div>
                      <div className="text-sm font-medium text-foreground">{selectedReturn.logisticsCostChargedTo}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Created</div>
                    <div className="text-sm text-foreground">
                      {selectedReturn.createdAt ? formatDateWithTime(selectedReturn.createdAt) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {selectedReturn.trackingNumber && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Tracking</h3>
                  <div className="text-sm font-medium text-foreground">
                    {selectedReturn.trackingNumber}
                  </div>
                </div>
              )}

              {/* Buyer Evidence Images */}
              {selectedReturn.buyerEvidenceUrls && selectedReturn.buyerEvidenceUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Buyer Evidence Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReturn.buyerEvidenceUrls.map((url: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Buyer evidence ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
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
                  <h3 className="text-sm font-semibold text-foreground mb-3">Seller Evidence Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReturn.sellerEvidenceUrls.map((url: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Seller evidence ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
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

              {/* ECC Baseline Images */}
              {(selectedReturn.eccBaseline?.evidenceUrls) && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Pre-Shipment Evidence (ECC Baseline)</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Evidence uploaded before shipping to protect against fraudulent claims
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(selectedReturn.eccBaseline?.evidenceUrls || []).map((url: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`ECC baseline ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
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
                      <p className="text-xs text-muted-foreground mb-2">VIN Verified Label:</p>
                      <div className="relative group inline-block">
                        <img
                          src={selectedReturn.eccBaseline.vinVerifiedLabelUrl}
                          alt="VIN Verified Label"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
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
                  <h3 className="text-sm font-semibold text-foreground mb-3">Buyer Description</h3>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedReturn.buyerDescription}</p>
                  </div>
                </div>
              )}

              {/* Seller Response Section */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Seller Response/Comment</h3>
                {selectedReturn.sellerResponse ? (
                  <div className="bg-accent/10 rounded-lg p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedReturn.sellerResponse}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="seller-response" className="text-sm font-medium text-foreground">
                        Add your response or comment
                      </Label>
                      <Textarea
                        id="seller-response"
                        value={sellerResponse}
                        onChange={(e) => setSellerResponse(e.target.value)}
                        placeholder="I shipped the correct part according to the order. The part number matches the order details. Please check the ECC baseline photos I uploaded."
                        className="mt-2 min-h-[120px] bg-background border-border"
                        maxLength={2000}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          Minimum 10 characters, maximum 2000 characters
                        </p>
                        <p className={`text-xs ${
                          sellerResponse.length < 10
                            ? 'text-red-400'
                            : sellerResponse.length > 2000
                            ? 'text-red-400'
                            : 'text-muted-foreground'
                        }`}>
                          {sellerResponse.length} / 2000
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleSubmitResponse}
                      disabled={submittingResponse || sellerResponse.trim().length < 10 || sellerResponse.trim().length > 2000}
                      className="w-full bg-accent hover:bg-accent/90 text-white disabled:opacity-50"
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
                <div className="pt-4 border-t border-border">
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-accent mt-0.5" />
                      <div className="text-sm text-accent">
                        <strong>Important:</strong> Confirm receipt within 12 hours of delivery. After confirmation, admin will perform final inspection and determine fault classification.
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConfirmReceipt(selectedReturn.id)}
                    disabled={confirmingReceipt === selectedReturn.id}
                    className="w-full bg-accent hover:bg-accent/90 text-white disabled:opacity-50"
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
                <div className="pt-4 border-t border-border">
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <div>
                        <div className="text-sm font-medium text-accent">Receipt Confirmed</div>
                        {selectedReturn.sellerReceiptConfirmedAt && (
                          <div className="text-xs text-accent/80 mt-1">
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
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Decline Exchange Request</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Declining this exchange will trigger Tier 1 Reroute. The system will find the highest-rated seller with the same product to fulfill the exchange.
            </DialogDescription>
          </DialogHeader>
          {selectedReturn && (
            <div className="mt-4">
              <div className="bg-muted/30 p-3 rounded-lg mb-4">
                <div className="text-sm font-medium text-foreground mb-1">Return ID:</div>
                <div className="text-lg font-mono font-bold text-foreground">#{selectedReturn.id?.slice(0, 8)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Order: {selectedReturn.order?.orderNumber || 'N/A'}
                </div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5" />
                  <div className="text-sm text-orange-400">
                    <strong>Warning:</strong> You will be charged the cost difference plus a penalty fee. Your SRI may be impacted.
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeclineExchangeModalOpen(false)} className="border-border text-foreground">
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
  );
}