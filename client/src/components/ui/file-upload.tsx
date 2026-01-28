import { useState } from "react";
import { Upload, X, FileCheck } from "lucide-react";
import { Button } from "./button";

interface FileUploadProps {
  onUpload: (file: File, preview?: string) => void | Promise<void>;
  accept?: string;
  label?: string;
  maxSize?: number; // in MB
}

export function FileUpload({ onUpload, accept = "image/*", label = "Upload File", maxSize = 10 }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`File must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setFileName(file.name);
      onUpload(file, result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div
        onDragOver={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary/80 bg-primary/10"
            : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/[0.07]"
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        
        {preview ? (
          <div className="space-y-3">
            <div className="relative w-24 h-24 mx-auto rounded-lg overflow-hidden border border-white/10">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium text-white flex items-center justify-center gap-2">
                <FileCheck className="h-4 w-4 text-green-500" />
                {fileName}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setPreview(null);
                  setFileName(null);
                }}
              >
                <X className="h-4 w-4" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-white font-medium">Drag & drop your file here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
          </div>
        )}
      </div>
    </div>
  );
}
