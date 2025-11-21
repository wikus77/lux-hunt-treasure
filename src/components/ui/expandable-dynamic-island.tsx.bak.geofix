
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
}

interface ExpandableDynamicIslandProps {
  hasNewNotification?: boolean;
  latestNotification?: Notification;
  className?: string;
}

export const ExpandableDynamicIsland: React.FC<ExpandableDynamicIslandProps> = ({
  hasNewNotification = false,
  latestNotification,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (hasNewNotification && latestNotification) {
      setIsExpanded(true);
      
      // Auto-collapse after 5 seconds
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [hasNewNotification, latestNotification]);

  const handleClose = () => {
    setIsExpanded(false);
  };

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <motion.div
        initial={{ clipPath: "circle(24px at center)" }}
        animate={{
          clipPath: isExpanded ? "circle(140px at center)" : "circle(24px at center)",
        }}
        transition={{
          type: "spring",
          damping: 18,
          stiffness: 250,
          duration: 0.6
        }}
        className="bg-black/90 backdrop-blur-xl border border-white/10 overflow-hidden"
        style={{
          borderRadius: isExpanded ? "24px" : "9999px",
          width: isExpanded ? "320px" : "48px",
          height: isExpanded ? "auto" : "48px",
          minHeight: isExpanded ? "80px" : "48px"
        }}
      >
        <AnimatePresence>
          {!isExpanded ? (
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <motion.div
                animate={hasNewNotification ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Bell className="w-5 h-5 text-white" />
                {hasNewNotification && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.2 }}
              className="p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Nuova notifica</span>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {latestNotification && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    {latestNotification.title}
                  </h4>
                  <p className="text-xs text-gray-300 line-clamp-2">
                    {latestNotification.body}
                  </p>
                  <p className="text-xs text-gray-500">
                    {latestNotification.timestamp.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
