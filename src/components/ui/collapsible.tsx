// © 2025 Joseph MULÉ – M1SSION™
import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Collapsible = ({ open, onOpenChange, children, className, ...props }: CollapsibleProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleToggle = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            onToggle: handleToggle,
          });
        }
        return child;
      })}
    </div>
  );
};

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

const CollapsibleTrigger = ({ isOpen, onToggle, children, asChild, ...props }: CollapsibleTriggerProps) => {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      onClick={() => onToggle?.(!isOpen)}
      {...props}
    >
      {children}
    </Comp>
  );
};

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleContent = ({ isOpen, children, className, ...props }: CollapsibleContentProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn("overflow-hidden transition-all duration-200", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };