
import React, { useState, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Notification } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [copied, setCopied] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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

  // Long press to copy functionality
  const handleCopyContent = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(notification.description);
      setCopied(true);
      toast({ title: "📋 Contenuto copiato!", description: "Il testo è stato copiato negli appunti." });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "❌ Errore", description: "Impossibile copiare il testo.", variant: "destructive" });
    }
  }, [notification.description, toast]);

  const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    longPressTimerRef.current = setTimeout(() => {
      handleCopyContent();
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 15px 50px rgba(0, 229, 255, 0.25)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="m1-relief-sm cursor-pointer transition-all duration-300 relative overflow-hidden"
      style={{
        borderRadius: '24px'
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
                {/* Full description - READABLE TEXT + LONG PRESS TO COPY */}
                <div 
                  className="p-4 rounded-[16px] relative"
                  style={{ background: 'rgba(60, 60, 70, 0.9)' }}
                  onTouchStart={handleLongPressStart}
                  onTouchEnd={handleLongPressEnd}
                  onTouchCancel={handleLongPressEnd}
                  onMouseDown={handleLongPressStart}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>Contenuto completo</h4>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyContent(); }}
                      style={{
                        padding: '4px 8px', borderRadius: '6px', border: 'none',
                        background: copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        cursor: 'pointer', fontSize: '11px', color: copied ? '#22C55E' : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {copied ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                      {copied ? 'Copiato!' : 'Copia'}
                    </button>
                  </div>
                  <p style={{ 
                    color: '#00D1FF', 
                    fontSize: '14px', 
                    lineHeight: '1.6', 
                    whiteSpace: 'pre-wrap',
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                  }}>
                    {notification.description}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '8px' }}>
                    💡 Tieni premuto per copiare
                  </p>
                </div>

                {/* Notification details - READABLE TEXT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-[16px]" style={{ background: 'rgba(60, 60, 70, 0.9)' }}>
                    <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600 }}>Data completa</span>
                    <p style={{ color: '#FFFFFF', fontSize: '14px', marginTop: '4px' }}>{fullFormattedDate}</p>
                  </div>

                  <div className="p-4 rounded-[16px]" style={{ background: 'rgba(60, 60, 70, 0.9)' }}>
                    <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600 }}>Stato</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span style={{ 
                        color: notification.read ? '#22C55E' : '#FBBF24', 
                        fontSize: '14px', 
                        fontWeight: 500 
                      }}>
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
