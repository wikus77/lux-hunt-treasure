
import React from 'react';
import { cn } from "@/lib/utils";

interface M1ssionBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'large' | 'small' | 'success' | 'warning' | 'error' | 'info';
  interactive?: boolean;
  children: React.ReactNode;
}

/**
 * COMPONENTE BOX UFFICIALE M1SSION™
 * 
 * Questo componente implementa lo stile glassmorphism approvato per M1SSION™.
 * DEVE essere usato per tutte le box, container, alert e sezioni dell'app.
 * 
 * Design System Specs:
 * - Glassmorphism con blur effect
 * - Angoli arrotondati
 * - Bordi semitrasparenti 
 * - Shadow interna
 * - Transizioni fluide
 * - Responsive design
 */
const M1ssionBox = React.forwardRef<HTMLDivElement, M1ssionBoxProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const baseClasses = "m1ssion-box";
    
    const variantClasses = {
      default: "m1ssion-box",
      large: "m1ssion-box-large", 
      small: "m1ssion-box-small",
      success: "m1ssion-alert-success",
      warning: "m1ssion-alert-warning", 
      error: "m1ssion-alert-error",
      info: "m1ssion-alert-info"
    };

    const interactiveClasses = interactive ? "m1ssion-box-interactive" : "";

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          interactiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

M1ssionBox.displayName = "M1ssionBox";

export { M1ssionBox };

// Utility Components per uso specifico
export const M1ssionSection = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <M1ssionBox variant="large" className={cn("m1ssion-section", className)} {...props}>
    {children}
  </M1ssionBox>
);

export const M1ssionAlert = ({ 
  children, 
  variant = 'info', 
  className, 
  ...props 
}: M1ssionBoxProps) => (
  <M1ssionBox variant={variant} className={className} {...props}>
    {children}
  </M1ssionBox>
);
