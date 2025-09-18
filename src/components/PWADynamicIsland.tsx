// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - PWA Dynamic Island Alternative
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PWANotificationProps {
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const PWADynamicIsland: React.FC<PWANotificationProps> = ({
  title,
  message,
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          style={{ zIndex: 10001 }}
        >
          <div className="bg-black/90 backdrop-blur-lg border border-[#00D1FF]/30 rounded-full px-6 py-3 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#00D1FF] rounded-full animate-pulse" />
              <div>
                <div className="text-white font-semibold text-sm">{title}</div>
                <div className="text-gray-300 text-xs">{message}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook per gestire le notifiche PWA
export const usePWADynamicIsland = () => {
  const [notifications, setNotifications] = useState<PWANotificationProps[]>([]);

  const showNotification = (notification: Omit<PWANotificationProps, 'onClose'>) => {
    const id = Date.now();
    const newNotification = {
      ...notification,
      onClose: () => {
        setNotifications(prev => prev.filter(n => n !== newNotification));
      }
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  return {
    notifications,
    showNotification
  };
};