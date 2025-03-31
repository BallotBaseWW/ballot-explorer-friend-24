
import { useState, useRef, useEffect } from "react";
import { SignatureValidation } from "./types";
import { CheckCircle, AlertCircle, HelpCircle, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SignatureImageViewerProps {
  imageUrl?: string;
  signatures: SignatureValidation[];
  selectedSignatureId?: string | number | null;
  onSignatureClick?: (signature: SignatureValidation) => void;
  height?: number;
}

export function SignatureImageViewer({ 
  imageUrl, 
  signatures, 
  selectedSignatureId = null,
  onSignatureClick,
  height = 500
}: SignatureImageViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [highlightedSignature, setHighlightedSignature] = useState<SignatureValidation | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

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
      case "uncertain": return "yellow";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
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
      case "valid": return "outline";
      case "invalid": return "destructive";
      case "uncertain": return "outline";
      default: return "default";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "valid": return "bg-green-100 text-green-800 border-green-200";
      case "invalid": return "";
      case "uncertain": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "";
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 2) {
      setZoomLevel(prevZoom => prevZoom + 0.25);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(prevZoom => prevZoom - 0.25);
    }
  };

  // Handle the case where we get passed a single signature (for backward compatibility)
  const singleSignature = signatures.length === 1 && signatures[0];

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2 mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleZoomIn}
          disabled={zoomLevel >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        className="relative border rounded-md overflow-auto" 
        ref={containerRef}
        style={{ maxWidth: '100%', maxHeight: `${height}px` }}
      >
        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
          {imageUrl ? (
            <img 
              ref={imageRef}
              src={imageUrl} 
              alt="Petition Document" 
              className="w-full h-auto"
              onLoad={handleImageLoad}
            />
          ) : singleSignature?.image_region ? (
            <div className="bg-gray-100 flex items-center justify-center p-4" style={{ height: '100px' }}>
              {singleSignature.name}'s signature
            </div>
          ) : (
            <div className="bg-gray-100 flex items-center justify-center p-4" style={{ height: '100px' }}>
              No image available
            </div>
          )}
          
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
                  className="absolute -top-6 left-0 transform -translate-y-2 whitespace-nowrap z-10"
                  style={{ display: highlightedSignature === sig || selectedSignatureId === sig.id ? 'block' : 'none' }}
                >
                  <Badge 
                    variant={getStatusBadgeVariant(sig.status)}
                    className={`flex items-center gap-1 text-xs ${getStatusBadgeClass(sig.status)}`}
                  >
                    {getStatusIcon(sig.status)}
                    {sig.name}
                  </Badge>
                </div>
              </div>
            )
          ))}
        </div>
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
