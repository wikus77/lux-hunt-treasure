// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { toast } from "sonner";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connessione ripristinata", {
        description: "Sei di nuovo online"
      });
      setShowIndicator(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Connessione persa", {
        description: "Modalità offline attiva"
      });
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator if already offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
          role="alert"
          aria-live="polite"
        >
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Modalità Offline</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}