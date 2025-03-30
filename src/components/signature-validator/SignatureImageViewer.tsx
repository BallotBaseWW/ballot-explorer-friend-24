
import { useState, useRef, useEffect } from "react";
import { SignatureValidation } from "./types";
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SignatureImageViewerProps {
  imageUrl: string;
  signatures: SignatureValidation[];
  selectedSignatureId?: string | number | null;
  onSignatureClick?: (signature: SignatureValidation) => void;
}

export function SignatureImageViewer({ 
  imageUrl, 
  signatures, 
  selectedSignatureId = null,
  onSignatureClick 
}: SignatureImageViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [highlightedSignature, setHighlightedSignature] = useState<SignatureValidation | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isLoaded && containerRef.current && imageRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const imageWidth = imageRef.current.naturalWidth;
      
      if (imageWidth > containerWidth) {
        setScale(containerWidth / imageWidth);
      }
    }
  }, [isLoaded]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": return "green";
      case "invalid": return "red";
      case "uncertain": return "orange";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string, size = 16) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "invalid":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "uncertain":
        return <HelpCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "valid": return "success";
      case "invalid": return "destructive";
      case "uncertain": return "warning";
      default: return "default";
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative border rounded-md overflow-hidden" ref={containerRef}>
        <img 
          ref={imageRef}
          src={imageUrl} 
          alt="Petition Document" 
          className="w-full h-auto"
          onLoad={handleImageLoad}
        />
        
        {isLoaded && signatures.map((sig) => (
          sig.image_region && (
            <div
              key={sig.id}
              className={`absolute cursor-pointer border-2 transition-all ${
                selectedSignatureId === sig.id 
                  ? 'border-blue-500 shadow-lg' 
                  : `border-${getStatusColor(sig.status)}-500 border-opacity-70`
              }`}
              style={{
                left: `${sig.image_region.x * scale}px`,
                top: `${sig.image_region.y * scale}px`,
                width: `${sig.image_region.width * scale}px`,
                height: `${sig.image_region.height * scale}px`,
                backgroundColor: `${getStatusColor(sig.status)}`,
                opacity: highlightedSignature === sig || selectedSignatureId === sig.id ? 0.35 : 0.15,
              }}
              onClick={() => onSignatureClick && onSignatureClick(sig)}
              onMouseEnter={() => setHighlightedSignature(sig)}
              onMouseLeave={() => setHighlightedSignature(null)}
            >
              <div 
                className="absolute -top-6 left-0 transform -translate-y-2 whitespace-nowrap"
                style={{ display: highlightedSignature === sig || selectedSignatureId === sig.id ? 'block' : 'none' }}
              >
                <Badge 
                  variant={getStatusBadgeVariant(sig.status)}
                  className="flex items-center gap-1 text-xs"
                >
                  {getStatusIcon(sig.status)}
                  {sig.name}
                </Badge>
              </div>
            </div>
          )
        ))}
      </div>
      
      {highlightedSignature && (
        <div className="p-3 bg-gray-50 rounded-md text-sm">
          <div className="font-medium">{highlightedSignature.name}</div>
          <div className="text-muted-foreground text-xs">{highlightedSignature.address}</div>
          {highlightedSignature.reason && (
            <div className="text-xs mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {highlightedSignature.reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
