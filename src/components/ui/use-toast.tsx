// © 2025 Joseph MULÉ – M1SSION™
import * as React from "react";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Simple toast implementation using browser notifications or custom UI
export const useToast = () => {
  const toast = React.useCallback((props: ToastProps) => {
    // For now, use browser alert as fallback
    // In a full implementation, you'd show a toast component
    const message = props.title ? `${props.title}: ${props.description}` : props.description;
    if (message) {
      alert(message);
    }
  }, []);

  return { toast };
};

// Toaster rimosso per evitare conflitti con sonner
// export const Toaster = () => {
//   return null; // Placeholder for toast container
// };