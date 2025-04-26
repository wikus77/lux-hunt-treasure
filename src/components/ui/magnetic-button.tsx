
"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

export function MagneticButton({
  children,
  className,
  strength = 40,
  onClick,
  ...props
}: MagneticButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    
    // Calculate center of the button
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate distance from center
    const distanceX = e.clientX - rect.left - centerX;
    const distanceY = e.clientY - rect.top - centerY;
    
    // Apply strength factor
    const magneticX = (distanceX / centerX) * strength;
    const magneticY = (distanceY / centerY) * strength;

    setPosition({ x: magneticX, y: magneticY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      className={cn("transition-transform duration-300", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)",
      }}
      {...props}
    >
      {children}
    </button>
  );
}
