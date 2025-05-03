
import React, { useState, useRef, MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticButton = ({ 
  children, 
  className, 
  strength = 25, 
  ...props 
}: MagneticButtonProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);
  
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    const x = (clientX - left - width / 2) / (width / 2) * strength;
    const y = (clientY - top - height / 2) / (height / 2) * strength;
    
    setPosition({ x, y });
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  // Extract motionProps for framer-motion and remove HTML button event handlers that conflict
  const extractSafeProps = () => {
    // List of props that should be excluded due to type conflicts
    const excludedProps = [
      'onDrag', 
      'onAnimationStart', 
      'onDragStart', 
      'onDragEnd', 
      'onDragEnter', 
      'onDragExit', 
      'onDragLeave', 
      'onDragOver', 
      'onAnimationEnd', 
      'onAnimationIteration'
    ];
    
    // Create a new object without the excluded properties
    const safeProps: any = {};
    
    Object.keys(props).forEach(key => {
      if (!excludedProps.includes(key)) {
        safeProps[key] = (props as any)[key];
      }
    });
    
    return safeProps;
  };

  return (
    <motion.button
      ref={ref}
      className={cn("relative inline-block", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      whileTap={{ scale: 0.97 }}
      {...extractSafeProps()}
    >
      {children}
    </motion.button>
  );
};
