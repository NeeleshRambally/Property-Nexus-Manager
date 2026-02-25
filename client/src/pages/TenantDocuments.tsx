import React from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Download, FileText, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiClient, getApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type DocumentType =
  | "ID_DOCUMENT"
  | "PASSPORT"
  | "PROOF_OF_EMPLOYMENT"
  | "BANK_STATEMENTS"
  | "PROOF_OF_BANK_ACCOUNT";

interface DocumentInfo {
  documentType: DocumentType;
  fileName: string;
  hasDocument: boolean;
}

interface Tenant {
  idNumber: string;
  name?: string;
  surname?: string;
  email?: string;
  cellNumber?: string;
}

const documentLabels: Record<DocumentType, string> = {
  ID_DOCUMENT: "ID Document",
  PASSPORT: "Passport",
  PROOF_OF_EMPLOYMENT: "Proof of Employment",
  BANK_STATEMENTS: "Bank Statements",
  PROOF_OF_BANK_ACCOUNT: "Proof of Bank Account"
};

export default function TenantDocuments() {
  const [, params] = useRoute("/tenants/:idNumber/documents");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tenant, setTenant] = React.useState<Tenant | null>(null);
  const [documents, setDocuments] = React.useState<DocumentInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);
  const [activeDocType, setActiveDocType] = React.useState<DocumentType | null>(null);
  const [documentUrls, setDocumentUrls] = React.useState<Map<DocumentType, string>>(new Map());

  React.useEffect(() => {
    if (!params?.idNumber) return;

    const fetchTenantAndDocuments = async () => {
      try {
        // Fetch tenant details
        const tenantResponse = await apiClient.get(`/api/tenants/${params.idNumber}`);
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json();
          setTenant(tenantData);
        }

        // Fetch document list
        const docsResponse = await apiClient.get(`/api/tenants/${params.idNumber}/documents`);
        if (docsResponse.ok) {
          const data = await docsResponse.json();
          // Backend returns: { documents: ["ID_DOCUMENT.jpeg", "PASSPORT.png"], count: 2 }
          // Parse the filenames to extract document types
          const documentList = (data.documents || []).map((fileName: string) => {
            // Extract document type from filename (e.g., "ID_DOCUMENT.jpeg" -> "ID_DOCUMENT")
            const docType = fileName.split('.')[0] as DocumentType;
            return {
              documentType: docType,
              fileName: fileName,
              hasDocument: true
            };
          });

          // Create a complete list with all document types
          const allDocTypes: DocumentType[] = [
            "ID_DOCUMENT",
            "PASSPORT",
            "PROOF_OF_EMPLOYMENT",
            "BANK_STATEMENTS",
            "PROOF_OF_BANK_ACCOUNT"
          ];

          const completeList = allDocTypes.map(docType => {
            const found = documentList.find((d: DocumentInfo) => d.documentType === docType);
            return found || { documentType: docType, fileName: "", hasDocument: false };
          });

          setDocuments(completeList);
        }
      } catch (error) {
        console.error("Failed to fetch tenant documents:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tenant documents.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantAndDocuments();
  }, [params?.idNumber, toast]);

  const openViewer = (documentType?: DocumentType) => {
    // If a specific document type is provided, open that one
    // Otherwise, set the first available document as active
    const docToOpen = documentType || documents.find(d => d.hasDocument)?.documentType;
    if (docToOpen) {
      setActiveDocType(docToOpen);
      setIsViewerOpen(true);
    }
  };

  const loadDocumentUrl = async (documentType: DocumentType) => {
    if (!params?.idNumber || documentUrls.has(documentType)) return;

    try {
      const response = await fetch(
        getApiUrl(`/api/tenants/${params.idNumber}/download?documentType=${documentType}`)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDocumentUrls(prev => new Map(prev).set(documentType, url));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load ${documentLabels[documentType]}.`,
      });
    }
  };

  // Load document URL when active document changes
  React.useEffect(() => {
    if (activeDocType && isViewerOpen) {
      loadDocumentUrl(activeDocType);
    }
  }, [activeDocType, isViewerOpen]);

  const handleDownloadDocument = async (documentType: DocumentType) => {
    if (!params?.idNumber) return;

    try {
      const response = await fetch(
        getApiUrl(`/api/tenants/${params.idNumber}/download?documentType=${documentType}`)
      );

      if (!response.ok) {
        throw new Error("Failed to download document");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentLabels[documentType]}_${params.idNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download document.",
      });
    }
  };

  const closeViewer = () => {
    // Clean up all URLs
    documentUrls.forEach(url => URL.revokeObjectURL(url));
    setDocumentUrls(new Map());
    setIsViewerOpen(false);
    setActiveDocType(null);
  };

  const navigateDocument = (direction: 'prev' | 'next') => {
    const availableDocs = documents.filter(d => d.hasDocument);
    const currentIndex = availableDocs.findIndex(d => d.documentType === activeDocType);

    if (direction === 'prev' && currentIndex > 0) {
      setActiveDocType(availableDocs[currentIndex - 1].documentType);
    } else if (direction === 'next' && currentIndex < availableDocs.length - 1) {
      setActiveDocType(availableDocs[currentIndex + 1].documentType);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        Loading documents...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Tenant Documents</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            {tenant?.name && tenant?.surname ? `${tenant.name} ${tenant.surname}` : `Tenant ${params?.idNumber}`}
          </h1>
          {tenant?.email && (
            <p className="text-sm text-muted-foreground mt-1">{tenant.email}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge className="rounded-full">
            {documents.filter(d => d.hasDocument).length} / {documents.length} Documents
          </Badge>
          {documents.some(d => d.hasDocument) && (
            <Button
              variant="default"
              className="rounded-full"
              onClick={openViewer}
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Documents
            </Button>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {isViewerOpen && activeDocType && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">{tenant?.name && tenant?.surname ? `${tenant.name} ${tenant.surname}` : 'Tenant Documents'}</h2>
                <Badge className="rounded-full">
                  {documents.filter(d => d.hasDocument).length} Documents
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleDownloadDocument(activeDocType)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={closeViewer}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-black/5 dark:border-white/5">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => navigateDocument('prev')}
                disabled={documents.filter(d => d.hasDocument).findIndex(d => d.documentType === activeDocType) === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Tabs */}
              <Tabs value={activeDocType} onValueChange={(value) => setActiveDocType(value as DocumentType)} className="flex-1">
                <TabsList className="w-full flex justify-start overflow-x-auto bg-transparent gap-2">
                  {documents.filter(d => d.hasDocument).map((doc) => (
                    <TabsTrigger
                      key={doc.documentType}
                      value={doc.documentType}
                      className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {documentLabels[doc.documentType]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => navigateDocument('next')}
                disabled={documents.filter(d => d.hasDocument).findIndex(d => d.documentType === activeDocType) === documents.filter(d => d.hasDocument).length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-hidden p-4 bg-gray-50 dark:bg-[#141414]">
              {documentUrls.has(activeDocType) ? (
                <iframe
                  src={documentUrls.get(activeDocType)}
                  className="w-full h-full rounded-2xl bg-white"
                  title={documentLabels[activeDocType]}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading document...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <Card
            key={doc.documentType}
            className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden"
          >
            <CardHeader className="px-6 py-5 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {documentLabels[doc.documentType]}
                </CardTitle>
                <Badge className={`rounded-full ${
                  doc.hasDocument
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}>
                  {doc.hasDocument ? 'Available' : 'Not Available'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {doc.hasDocument ? (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="rounded-full flex-1"
                    onClick={() => openViewer(doc.documentType)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => handleDownloadDocument(doc.documentType)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  This document has not been uploaded yet.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm mt-1">No documents are available for this tenant</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
