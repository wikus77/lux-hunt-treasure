"use client";

import React from "react";
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
  // Rimosso effetto parallax

  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{ position: "relative", ...containerStyle }}
    >
      <div>
        <img
          src={src}
          alt={alt}
          className={cn("w-full h-full object-cover", imageClassName)}
          style={imgStyle}
          loading={priority ? "eager" : "lazy"}
        />
      </div>
    </div>
  );
}
