
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  const [elementTop, setElementTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  
  const { scrollY } = useScroll();
  
  // Calculate the Y offset for the parallax effect
  const y = useTransform(
    scrollY,
    [elementTop - clientHeight, elementTop + clientHeight],
    [-clientHeight * speed, clientHeight * speed]
  );

  useEffect(() => {
    const element = containerRef.current;
    const handleResize = () => {
      if (element) {
        setElementTop(element.getBoundingClientRect().top + window.scrollY || window.pageYOffset);
        setClientHeight(window.innerHeight);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      style={{ position: "relative", ...containerStyle }}
    >
      <motion.div style={{ y }} className="will-change-transform">
        <img
          src={src}
          alt={alt}
          className={cn("w-full h-full object-cover", imageClassName)}
          style={imgStyle}
          loading={priority ? "eager" : "lazy"}
        />
      </motion.div>
    </div>
  );
}
