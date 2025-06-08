
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Notification } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown, Clock, Eye, Calendar } from "lucide-react";

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

  const getNotificationTypeInfo = () => {
    switch (notification.type) {
      case 'buzz':
        return { label: 'Buzz Notification', color: 'text-yellow-400' };
      case 'map_buzz':
        return { label: 'Map Update', color: 'text-purple-400' };
      case 'leaderboard_update':
        return { label: 'Leaderboard', color: 'text-green-400' };
      case 'weekly_summary':
        return { label: 'Weekly Summary', color: 'text-blue-400' };
      default:
        return { label: 'General', color: 'text-gray-400' };
    }
  };

  const typeInfo = getNotificationTypeInfo();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={`group p-4 rounded-lg cursor-pointer backdrop-blur-md relative transition-all duration-300 ${
        notification.read 
          ? "bg-[#131524]/30 hover:bg-[#131524]/40" 
          : "bg-gradient-to-r from-[#131524]/40 to-[#0a0a1a]/40 border-l-4 border-[#00D1FF] hover:from-[#131524]/50 hover:to-[#0a0a1a]/50"
      }`}
      style={{
        boxShadow: notification.read 
          ? "0 4px 12px rgba(0, 0, 0, 0.1)" 
          : "0 6px 16px rgba(0, 0, 0, 0.15), 0 0 8px rgba(0, 209, 255, 0.1)"
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 
            className={`text-base font-medium ${notification.read ? "text-white/70" : "text-[#00D1FF]"}`}
            style={!notification.read ? { textShadow: "0 0 5px rgba(0, 209, 255, 0.3)" } : {}}
          >
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
              <div className="p-3 bg-[#0a0a0a]/50 rounded-lg">
                <h4 className="text-sm font-medium text-white/80 mb-2">Contenuto completo</h4>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                  {notification.description}
                </p>
              </div>

              {/* Notification details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-[#0a0a0a]/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-white/60">Data completa</span>
                  </div>
                  <p className="text-sm text-white/80">{fullFormattedDate}</p>
                </div>

                <div className="p-3 bg-[#0a0a0a]/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-medium text-white/60">Stato</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${notification.read ? 'text-green-400' : 'text-yellow-400'}`}>
                      {notification.read ? 'Letta' : 'Non letta'}
                    </span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#0a0a0a]/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium text-white/60">Categoria</span>
                  </div>
                  <span className={`text-sm ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </div>

                <div className="p-3 bg-[#0a0a0a]/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-white/60">ID Notifica</span>
                  </div>
                  <span className="text-xs text-white/50 font-mono">
                    {notification.id.slice(0, 8)}...
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Segna come letta
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={handleDelete}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors group"
                  title="Elimina notifica"
                >
                  <Trash2 size={16} className="text-red-400 hover:text-red-300" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationItem;
