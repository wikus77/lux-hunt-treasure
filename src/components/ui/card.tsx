import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  interactive?: boolean;
}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, gradient = false, interactive = false, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn(
      "m1ssion-glass-card overflow-hidden transition-all duration-300 card-hover-effect relative rounded-[24px]",
      className
    )}
    whileHover={interactive ? { 
      scale: 1.03,
      boxShadow: "0 0 25px rgba(0, 209, 255, 0.4), 0 0 50px rgba(123, 46, 255, 0.2)"
    } : {}}
    whileTap={interactive ? { scale: 0.97 } : {}}
    transition={{ duration: 0.3, ease: "easeOut" }}
    {...(props as any)}
  >
    {gradient && (
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
    )}
    <motion.div
      className="relative"
      whileHover={interactive ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  </motion.div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight gradient-text-cyan glow-text",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-white/70", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
