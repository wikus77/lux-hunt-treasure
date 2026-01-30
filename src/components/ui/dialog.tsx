// © 2025 Joseph MULÉ – M1SSION™
// 🎬 Native Feel: Spring animations for dialogs
import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { hapticLight } from "@/utils/haptics"

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            onOpenChange: handleOpenChange,
          });
        }
        return child;
      })}
    </>
  );
};

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

const DialogTrigger = ({ onOpenChange, children, asChild, ...props }: DialogTriggerProps) => {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      {...props}
      onClick={() => onOpenChange?.(true)}
    >
      {children}
    </Comp>
  );
};

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, isOpen, onOpenChange, children, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    // 🎬 Native Feel: Haptic on open
    React.useEffect(() => {
      if (isOpen) {
        hapticLight();
      }
    }, [isOpen]);

    if (!mounted) return null;

    // 🎬 Native Feel: iOS-style spring animation
    const overlayVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    };

    const contentVariants = {
      hidden: { opacity: 0, scale: 0.95, y: 20 },
      visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: {
          type: "spring" as const,
          damping: 25,
          stiffness: 300
        }
      },
      exit: { 
        opacity: 0, 
        scale: 0.95, 
        y: 10,
        transition: { duration: 0.15 }
      }
    };

    const handleClose = () => {
      hapticLight();
      onOpenChange?.(false);
    };

    const content = (
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              // Chiudi cliccando sullo sfondo
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <motion.div
              ref={ref}
              className={cn(
                "relative bg-background rounded-lg shadow-lg max-w-lg w-full max-h-[85vh] overflow-y-auto m1ssion-glass-card",
                className
              )}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={props.style}
            >
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white hover:text-[#00D1FF] z-10 active:scale-95"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );

    // Usa Portal per renderizzare direttamente nel body
    return createPortal(content, document.body);
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left p-6", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight gradient-text-cyan", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, asChild, children, ...props }, ref) => {
  const Comp = asChild ? "div" : "p";
  return (
    <Comp
      ref={ref}
      className={cn("text-sm text-white/70", className)}
      {...props}
    >
      {children}
    </Comp>
  );
});
DialogDescription.displayName = "DialogDescription";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogClose = ({ asChild, children, ...props }: DialogCloseProps) => {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp {...props}>
      {children}
    </Comp>
  );
};
DialogClose.displayName = "DialogClose";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};