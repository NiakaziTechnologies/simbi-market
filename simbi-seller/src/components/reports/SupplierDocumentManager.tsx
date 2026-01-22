// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatUSD } from "@/lib/currency";
import {
  getSupplierDocuments,
  getSupplierDocumentsBySupplier,
  saveSupplierDocument,
  deleteSupplierDocument,
  getSupplierComplianceStatus,
  getDocumentTypes,
  SupplierDocument,
  DocumentType
} from "@/lib/metrics";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Plus,
  Calendar,
  FileCheck
} from "lucide-react";

interface SupplierDocumentManagerProps {
  supplierId: string;
  supplierName: string;
}

export default function SupplierDocumentManager({ supplierId, supplierName }: SupplierDocumentManagerProps) {
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SupplierDocument | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: 'other' as DocumentType['id'],
    documentName: '',
    description: '',
    expiryDate: ''
  });

  const documentTypes = getDocumentTypes();
  const complianceStatus = getSupplierComplianceStatus(supplierId);

  useEffect(() => {
    loadDocuments();
  }, [supplierId]);

  const loadDocuments = () => {
    const supplierDocuments = getSupplierDocumentsBySupplier(supplierId);
    setDocuments(supplierDocuments);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real application, you would upload to a server
    // For now, we'll create a local blob URL for demonstration
    const fileUrl = URL.createObjectURL(file);

    const newDocument: Omit<SupplierDocument, 'id' | 'uploadDate'> = {
      supplierId,
      supplierName,
      documentType: uploadForm.documentType,
      documentName: uploadForm.documentName || file.name,
      fileUrl,
      fileSize: file.size,
      expiryDate: uploadForm.expiryDate || undefined,
      status: uploadForm.expiryDate && new Date(uploadForm.expiryDate) < new Date() ? 'expired' : 'valid',
      description: uploadForm.description
    };

    saveSupplierDocument(newDocument);
    loadDocuments();
    setIsUploadOpen(false);
    resetUploadForm();
  };

  const resetUploadForm = () => {
    setUploadForm({
      documentType: 'other',
      documentName: '',
      description: '',
      expiryDate: ''
    });
  };

  const handleDeleteDocument = (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteSupplierDocument(documentId);
      loadDocuments();
    }
  };

  const getStatusIcon = (status: SupplierDocument['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending_review':
        return <Clock className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getStatusBadge = (status: SupplierDocument['status']) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">Valid</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">Expired</Badge>;
      case 'pending_review':
        return <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">Pending</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Compliance Status Overview */}
      <Card className={`${
        complianceStatus.isCompliant
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
          : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${
            complianceStatus.isCompliant
              ? 'text-blue-800 dark:text-blue-200'
              : 'text-indigo-800 dark:text-indigo-200'
          }`}>
            <FileCheck className="w-5 h-5" />
            ZIMRA Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                complianceStatus.isCompliant ? 'text-blue-600' : 'text-indigo-600'
              }`}>
                {complianceStatus.isCompliant ? '✓' : '!'}
              </div>
              <div className="text-sm font-medium">
                {complianceStatus.isCompliant ? 'Fully Compliant' : 'Action Required'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {documents.length}
              </div>
              <div className="text-sm font-medium">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {complianceStatus.missingDocuments.length}
              </div>
              <div className="text-sm font-medium">Missing Required</div>
            </div>
          </div>

          {complianceStatus.missingDocuments.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                Missing Required Documents:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {complianceStatus.missingDocuments.map((doc, index) => (
                  <li key={index}>• {doc}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Document Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Supplier Documents</h3>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Supplier Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={uploadForm.documentType} onValueChange={(value: DocumentType['id']) => setUploadForm({...uploadForm, documentType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} {type.required && '(Required)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="documentName">Document Name</Label>
                <Input
                  id="documentName"
                  value={uploadForm.documentName}
                  onChange={(e) => setUploadForm({...uploadForm, documentName: e.target.value})}
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={uploadForm.expiryDate}
                  onChange={(e) => setUploadForm({...uploadForm, expiryDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Document description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Upload File</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Supported formats: PDF, Images, Word documents (Max 10MB)
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsUploadOpen(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed border-2 border-slate-300 dark:border-slate-600">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
              No Documents Uploaded
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Upload ZIMRA certificates, business licenses, and other compliance documents.
            </p>
            <Button onClick={() => setIsUploadOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(document.status)}
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                        {document.documentName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {documentTypes.find(t => t.id === document.documentType)?.name}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(document.status)}
                </div>

                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</span>
                  </div>

                  {document.expiryDate && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Expires: {new Date(document.expiryDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDocument(document);
                      setIsViewOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(document.fileUrl)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDocument(document.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getStatusIcon(selectedDocument.status)}
              {selectedDocument?.documentName}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-semibold">Document Type</Label>
                  <p>{documentTypes.find(t => t.id === selectedDocument.documentType)?.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedDocument.status)}
                    {getStatusBadge(selectedDocument.status)}
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Upload Date</Label>
                  <p>{new Date(selectedDocument.uploadDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-semibold">File Size</Label>
                  <p>{formatFileSize(selectedDocument.fileSize)}</p>
                </div>
                {selectedDocument.expiryDate && (
                  <div className="col-span-2">
                    <Label className="font-semibold">Expiry Date</Label>
                    <p className={new Date(selectedDocument.expiryDate) < new Date() ? 'text-red-600' : ''}>
                      {new Date(selectedDocument.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedDocument.description && (
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {selectedDocument.description}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => window.open(selectedDocument.fileUrl)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsViewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}