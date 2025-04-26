
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  direction?: "up" | "down" | "left" | "right";
}

const directions = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  duration = 0.7,
  once = true,
  direction = "up",
}: AnimatedSectionProps) {
  return (
    <motion.div 
      initial={{ 
        opacity: 0, 
        ...directions[direction],
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0,
        transition: {
          duration: duration,
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1],
        }
      }}
      viewport={{ once }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
