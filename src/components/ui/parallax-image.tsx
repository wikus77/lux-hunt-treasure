
"use client";

import React, { useEffect, useRef } from "react";
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

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    
    if (!container || !img) return;
    
    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInView) {
        const scrollPos = window.scrollY;
        const offset = scrollPos - (rect.top + scrollPos - window.innerHeight / 2);
        const parallaxOffset = offset * speed * 0.1;
        
        img.style.transform = `translateY(${parallaxOffset}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial position
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      style={{ position: "relative", ...containerStyle }}
      data-parallax="container"
    >
      <div className="h-full w-full">
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn("w-full h-full object-cover", imageClassName)}
          style={imgStyle}
          loading={priority ? "eager" : "lazy"}
          data-parallax="image"
          data-parallax-speed={speed.toString()}
        />
      </div>
    </div>
  );
}
