
import { useState, useRef, useEffect } from "react";
import { SignatureValidation } from "./types";

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

  return (
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
              opacity: 0.2,
            }}
            onClick={() => onSignatureClick && onSignatureClick(sig)}
          />
        )
      ))}
    </div>
  );
}
