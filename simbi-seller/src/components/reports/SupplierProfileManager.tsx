// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { formatUSD } from "@/lib/currency";
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
  FileCheck,
  User,
  Image,
  FileImage,
  X
} from "lucide-react";

interface ProfileDocument {
  id: string;
  supplierId: string;
  supplierName: string;
  documentType: 'zimra_tax_clearance' | 'council_merchant_license' | 'national_id' | 'proof_of_address' | 'business_registration' | 'other_business';
  documentName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
  status: 'valid' | 'expired' | 'pending_review';
  description?: string;
  isPrimary?: boolean;
}

interface ProfileDocumentType {
  id: ProfileDocument['documentType'];
  name: string;
  description: string;
  required: boolean;
  accept: string;
  maxSize: number; // in MB
  icon: React.ReactNode;
}

interface SupplierProfileManagerProps {
  supplierId: string;
  supplierName: string;
}

export default function SupplierProfileManager({ supplierId, supplierName }: SupplierProfileManagerProps) {
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ProfileDocument | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    documentType: 'other_profile' as ProfileDocument['documentType'],
    documentName: '',
    description: '',
    isPrimary: false
  });

  const documentTypes: ProfileDocumentType[] = [
    {
      id: 'zimra_tax_clearance',
      name: 'ZIMRA Tax Clearance',
      description: 'Zimbabwe Revenue Authority tax clearance certificate (PDF preferred)',
      required: true,
      accept: '.pdf,image/*',
      maxSize: 10,
      icon: <FileCheck className="w-4 h-4" />
    },
    {
      id: 'council_merchant_license',
      name: 'Council Merchant License',
      description: 'Local council merchant or trading license',
      required: true,
      accept: '.pdf,image/*',
      maxSize: 10,
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: 'national_id',
      name: 'National ID',
      description: 'National identification document or passport',
      required: true,
      accept: 'image/*,.pdf',
      maxSize: 10,
      icon: <User className="w-4 h-4" />
    },
    {
      id: 'proof_of_address',
      name: 'Proof of Address',
      description: 'Utility bill, bank statement, or lease agreement',
      required: true,
      accept: '.pdf,image/*',
      maxSize: 10,
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'business_registration',
      name: 'Business Registration',
      description: 'Company registration certificate or business license',
      required: false,
      accept: '.pdf,image/*',
      maxSize: 10,
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: 'other_business',
      name: 'Other Business Document',
      description: 'Additional business-related documents',
      required: false,
      accept: '*/*',
      maxSize: 10,
      icon: <FileText className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    loadDocuments();
  }, [supplierId]);

  const loadDocuments = () => {
    const supplierDocuments = getSupplierProfileDocumentsBySupplier(supplierId);
    setDocuments(supplierDocuments);
  };

  const getSupplierProfileDocumentsBySupplier = (supplierId: string): ProfileDocument[] => {
    try {
      const raw = localStorage.getItem('simbi_supplier_profile_documents');
      const allDocuments: ProfileDocument[] = raw ? JSON.parse(raw) : [];
      return allDocuments.filter(doc => doc.supplierId === supplierId);
    } catch {
      return [];
    }
  };

  const saveSupplierProfileDocument = (document: Omit<ProfileDocument, 'id' | 'uploadDate'>): ProfileDocument => {
    const newDocument: ProfileDocument = {
      ...document,
      id: `profile_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadDate: new Date().toISOString()
    };

    const existing = getAllSupplierProfileDocuments();
    const updated = [newDocument, ...existing];
    localStorage.setItem('simbi_supplier_profile_documents', JSON.stringify(updated));

    return newDocument;
  };

  const getAllSupplierProfileDocuments = (): ProfileDocument[] => {
    try {
      const raw = localStorage.getItem('simbi_supplier_profile_documents');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const deleteSupplierProfileDocument = (documentId: string): boolean => {
    try {
      const documents = getAllSupplierProfileDocuments();
      const filtered = documents.filter(doc => doc.id !== documentId);
      localStorage.setItem('simbi_supplier_profile_documents', JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  };

  const simulateFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setIsUploading(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress(100);
              setIsUploading(false);
              resolve(URL.createObjectURL(file));
            }, 500);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const selectedType = documentTypes.find(type => type.id === uploadForm.documentType);
    if (!selectedType) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > selectedType.maxSize) {
      alert(`File size exceeds maximum allowed size of ${selectedType.maxSize}MB`);
      return;
    }

    try {
      const fileUrl = await simulateFileUpload(file);

      const newDocument: Omit<ProfileDocument, 'id' | 'uploadDate'> = {
        supplierId,
        supplierName,
        documentType: uploadForm.documentType,
        documentName: uploadForm.documentName || file.name,
        fileUrl,
        fileSize: file.size,
        status: 'valid',
        description: uploadForm.description,
        isPrimary: uploadForm.isPrimary
      };

      saveSupplierProfileDocument(newDocument);
      loadDocuments();
      setIsUploadOpen(false);
      resetUploadForm();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      documentType: 'other_business',
      documentName: '',
      description: '',
      isPrimary: false
    });
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteSupplierProfileDocument(documentId);
      loadDocuments();
    }
  };

  const getStatusIcon = (status: ProfileDocument['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending_review':
        return <Clock className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getStatusBadge = (status: ProfileDocument['status']) => {
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

  const getDocumentIcon = (documentType: ProfileDocument['documentType']) => {
    const type = documentTypes.find(t => t.id === documentType);
    return type?.icon || <FileText className="w-4 h-4" />;
  };

  const getPrimaryBadge = (isPrimary?: boolean) => {
    if (isPrimary) {
      return <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">Primary</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Building2 className="w-5 h-5" />
            Business Registration Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {documents.length}
              </div>
              <div className="text-sm font-medium">Total Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {documents.filter(doc => doc.status === 'valid').length}
              </div>
              <div className="text-sm font-medium">Valid Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {documents.filter(doc => doc.isPrimary).length}
              </div>
              <div className="text-sm font-medium">Primary Documents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Document Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Business Documents</h3>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload Business Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Profile Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <select
                  id="documentType"
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm({...uploadForm, documentType: e.target.value as ProfileDocument['documentType']})}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} {type.required && '(Required)'}
                      {type.id === 'zimra_tax_clearance' && ' - PDF Preferred'}
                    </option>
                  ))}
                </select>
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Document description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={uploadForm.isPrimary}
                  onChange={(e) => setUploadForm({...uploadForm, isPrimary: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPrimary">Set as primary document</Label>
              </div>

              <div>
                <Label>Upload File</Label>
                <Input
                  type="file"
                  accept={documentTypes.find(t => t.id === uploadForm.documentType)?.accept || '*/*'}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {documentTypes.find(t => t.id === uploadForm.documentType) &&
                    `Supported formats: ${documentTypes.find(t => t.id === uploadForm.documentType)?.accept}, Max ${documentTypes.find(t => t.id === uploadForm.documentType)?.maxSize}MB` +
                    (uploadForm.documentType === 'zimra_tax_clearance' ? ' (PDF preferred for official documents)' : '')
                  }
                </p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

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
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
              No Business Documents Uploaded
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Upload your ZIMRA tax clearance, council merchant license, and other required business documents.
            </p>
            <Button onClick={() => setIsUploadOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getDocumentIcon(document.documentType)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        {document.documentName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {documentTypes.find(t => t.id === document.documentType)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(document.status)}
                    {getPrimaryBadge(document.isPrimary)}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                </div>

                {document.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {document.description}
                  </p>
                )}

                <div className="flex gap-1 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDocument(document);
                      setIsViewOpen(true);
                    }}
                    className="flex-1 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(document.fileUrl)}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDocument(document.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
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
              {selectedDocument && getDocumentIcon(selectedDocument.documentType)}
              {selectedDocument?.documentName}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                {selectedDocument.documentType.includes('image') ? (
                  <img
                    src={selectedDocument.fileUrl}
                    alt={selectedDocument.documentName}
                    className="max-w-full h-auto max-h-96 mx-auto rounded"
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-300">
                      Document preview not available
                    </p>
                    <Button
                      onClick={() => window.open(selectedDocument.fileUrl)}
                      className="mt-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download to View
                    </Button>
                  </div>
                )}
              </div>

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
                {selectedDocument.isPrimary && (
                  <div className="col-span-2">
                    <Label className="font-semibold">Special Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">Primary Document</Badge>
                    </div>
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