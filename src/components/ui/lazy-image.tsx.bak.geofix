
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderSrc?: string;
  threshold?: number;
}

export const LazyImage = ({
  src,
  alt,
  className,
  placeholderSrc = "/placeholder.svg",
  threshold = 0.1,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (!imgRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    
    observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [threshold]);
  
  const handleImageLoaded = () => {
    setIsLoaded(true);
  };
  
  return (
    <div className={cn("relative overflow-hidden", className)} style={props.style}>
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900/20 animate-pulse flex items-center justify-center">
          <img 
            src={placeholderSrc} 
            alt="Loading..." 
            className="w-12 h-12 opacity-30" 
          />
        </div>
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : placeholderSrc}
        alt={alt || "Image"}
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={handleImageLoaded}
        {...props}
      />
    </div>
  );
};
