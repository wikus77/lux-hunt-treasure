
// © 2025 Joseph MULÉ – M1SSION™ – UNIFIED TOAST SYSTEM
// DEPRECATED: Use 'toast' from 'sonner' directly instead
import { toast } from "sonner";

// Legacy compatibility - redirect to sonner
export const useToast = () => {
  console.warn("🚨 DEPRECATED: useToast() - Use 'toast' from 'sonner' directly");
  return { 
    toast: (options: any) => {
      toast(options.title || options.description || "Notification", {
        description: options.title ? options.description : undefined
      });
    }
  };
};

export { toast };
