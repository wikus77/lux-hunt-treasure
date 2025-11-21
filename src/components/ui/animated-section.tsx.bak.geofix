
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
}

export const AnimatedSection = ({
  children,
  className,
  delay = 0,
  duration = 0.7,
  direction = "up",
  once = false,
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "0px 0px -100px 0px" });
  
  const getDirectionVariants = () => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: 40 },
          visible: { opacity: 1, y: 0 }
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -40 },
          visible: { opacity: 1, y: 0 }
        };
      case "left":
        return {
          hidden: { opacity: 0, x: 40 },
          visible: { opacity: 1, x: 0 }
        };
      case "right":
        return {
          hidden: { opacity: 0, x: -40 },
          visible: { opacity: 1, x: 0 }
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
    }
  };

  const variants = getDirectionVariants();

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ 
          duration: duration, 
          delay: delay, 
          ease: [0.19, 1, 0.22, 1] // Smooth easing
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
