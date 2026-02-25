import React from "react";
import { X, Upload, Camera, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api";

type DocumentType =
  | "ID_DOCUMENT"
  | "PASSPORT"
  | "PROOF_OF_EMPLOYMENT"
  | "BANK_STATEMENTS"
  | "PROOF_OF_BANK_ACCOUNT";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  documentLabel: string;
  tenantIdNumber: string;
  onUploadSuccess: () => void;
}

const documentLabels: Record<DocumentType, string> = {
  ID_DOCUMENT: "ID Document",
  PASSPORT: "Passport",
  PROOF_OF_EMPLOYMENT: "Proof of Employment",
  BANK_STATEMENTS: "Bank Statements",
  PROOF_OF_BANK_ACCOUNT: "Proof of Bank Account"
};

export default function DocumentUploadModal({
  isOpen,
  onClose,
  documentType,
  documentLabel,
  tenantIdNumber,
  onUploadSuccess,
}: DocumentUploadModalProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreview(null);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size must be less than 10MB",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(
        getApiUrl(`/api/tenants/${tenantIdNumber}/upload?documentType=${documentType}`),
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to upload document');
      }

      toast({
        title: "Success",
        description: `${documentLabel} uploaded successfully!`,
      });

      onUploadSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
          <div>
            <h2 className="text-xl font-bold">Upload Document</h2>
            <p className="text-sm text-muted-foreground mt-1">{documentLabel}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={onClose}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Preview or Upload Area */}
          {selectedFile ? (
            <div className="space-y-4">
              <div className="border-2 border-black/5 dark:border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center">
                      <File className="w-10 h-10 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-2xl p-8 transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-black/10 dark:border-white/10'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-base font-medium mb-2">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, JPG, JPEG, PNG (Max 10MB)
                  </p>
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-black/5 dark:border-white/5">
          <Button
            variant="outline"
            className="rounded-full flex-1"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="rounded-full flex-1"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
