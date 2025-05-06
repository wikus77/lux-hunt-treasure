
"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  speed?: number;
  imgStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  priority?: boolean;
}

export function ParallaxImage({
  src,
  alt,
  className,
  imageClassName,
  speed = 0.5,
  imgStyle,
  containerStyle,
  priority = false,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Set up Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
      },
      {
        rootMargin: "200px 0px",
        threshold: 0.01,
      }
    );
    
    observer.observe(container);
    
    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, []);
  
  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    
    if (!container || !img) return;
    
    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        const scrollPos = window.scrollY;
        const offset = scrollPos - (rect.top + scrollPos - window.innerHeight / 2);
        const parallaxOffset = offset * speed * 0.1;
        
        img.style.transform = `translateY(${parallaxOffset}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, isLoaded]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      style={{ position: "relative", ...containerStyle }}
      data-parallax="container"
    >
      <div className="h-full w-full">
        {(isInView || priority) && (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-700",
              isLoaded ? "opacity-100" : "opacity-0",
              imageClassName
            )}
            style={imgStyle}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setIsLoaded(true)}
            data-parallax="image"
            data-parallax-speed={speed.toString()}
          />
        )}
        {!isLoaded && (
          <div className="absolute inset-0 bg-black/20 animate-pulse" />
        )}
      </div>
    </div>
  );
}
