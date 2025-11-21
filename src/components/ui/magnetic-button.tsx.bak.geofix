
import React, { useState, useRef, MouseEvent } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps 
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<"button">> {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const MagneticButton = ({ 
  children, 
  className, 
  strength = 25, 
  onClick,
  type = "button",
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

  const motionProps: HTMLMotionProps<"button"> = {
    animate: { x: position.x, y: position.y },
    transition: { type: "spring", stiffness: 150, damping: 15, mass: 0.1 },
    whileTap: { scale: 0.97 }
  };

  return (
    <motion.button
      ref={ref}
      className={cn("relative inline-block", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      type={type}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
};
