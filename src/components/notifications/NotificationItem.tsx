
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Notification } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  onSelect: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onSelect, 
  onDelete 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = formatDistanceToNow(new Date(notification.date), {
    addSuffix: true,
    locale: it,
  });

  const fullFormattedDate = new Date(notification.date).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    if (!notification.read) {
      onSelect();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 15px 50px rgba(0, 229, 255, 0.25)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="m1ssion-glass-card cursor-pointer transition-all duration-300 relative overflow-hidden"
      style={{
        background: notification.read 
          ? 'rgba(0, 0, 0, 0.05)'
          : 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Animated glow strip like header */}
      <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
          style={{
            animation: 'slideGlowNotif 3s ease-in-out infinite',
            width: '200%',
            left: '-100%'
          }}
        />
      </div>
      <style>{`
        @keyframes slideGlowNotif {
          0% { transform: translateX(0); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-medium font-orbitron ${notification.read ? "text-white/70" : "text-white"}`}>
              {notification.title}
            </h3>
            
            {!isExpanded && (
              <p className="mt-2 text-sm text-white/60 line-clamp-2">{notification.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-xs text-white/40">{formattedDate}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4 text-white/60" />
            </motion.div>
          </div>
        </div>
        
        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden mt-4"
            >
              <div className="space-y-4">
                {/* Full description */}
                <div className="p-4 rounded-[16px] bg-[#0a0a0a]/50">
                  <h4 className="text-sm font-medium text-white/80 mb-2 font-orbitron">Contenuto completo</h4>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {notification.description}
                  </p>
                </div>

                {/* Notification details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-[16px] bg-[#0a0a0a]/30">
                    <span className="text-xs font-medium text-white/60 font-orbitron">Data completa</span>
                    <p className="text-sm text-white/80 mt-1">{fullFormattedDate}</p>
                  </div>

                  <div className="p-4 rounded-[16px] bg-[#0a0a0a]/30">
                    <span className="text-xs font-medium text-white/60 font-orbitron">Stato</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-sm ${notification.read ? 'text-green-400' : 'text-yellow-400'}`}>
                        {notification.read ? 'Letta' : 'Non letta'}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect();
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-[#365EFF] to-[#FC1EFF] text-white rounded-full text-xs hover:shadow-lg transition-all font-orbitron"
                      >
                        Segna come letta
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleDelete}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Elimina notifica"
                  >
                    <Trash2 size={16} className="text-red-400 hover:text-red-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationItem;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
