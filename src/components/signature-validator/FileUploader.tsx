
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setError(null);
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isValid = file.type === 'application/pdf' || 
                        file.type === 'image/jpeg' || 
                        file.type === 'image/png';
        if (!isValid) {
          toast.error(`File ${file.name} is not a supported format (PDF, JPG, PNG)`, {
            description: "Please upload only supported file formats",
          });
        }
        return isValid;
      });
      
      // Check if files are too large (max 10MB per file)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const validSizeFiles = validFiles.filter(file => {
        const isValidSize = file.size <= MAX_FILE_SIZE;
        if (!isValidSize) {
          toast.error(`File ${file.name} exceeds the maximum size of 10MB`, {
            description: "Please upload smaller files or reduce file size",
          });
        }
        return isValidSize;
      });
      
      if (validSizeFiles.length === 0) {
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...validSizeFiles]);
      onFilesSelected(validSizeFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesSelected(updated);
      return updated;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) {
        input.files = e.dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium">Upload Petition Pages</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop PDF, JPG, or PNG files, or click to browse
        </p>
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button asChild className="mt-2">
          <label htmlFor="file-upload" className="cursor-pointer">
            Select Files
          </label>
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Maximum file size: 10MB per file
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2">Uploaded Files</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div className="flex items-center truncate mr-2">
                  <FileCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
