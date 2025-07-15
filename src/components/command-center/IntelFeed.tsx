
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Map, Search, Info, Clock } from "lucide-react";
import { IntelFeed as IntelFeedType } from "@/data/commandCenterData";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface IntelFeedProps {
  intel: IntelFeedType[];
}

export const IntelFeed: React.FC<IntelFeedProps> = ({ intel }) => {
  const navigate = useNavigate();
  const [displayedIntel, setDisplayedIntel] = useState<IntelFeedType[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    // Start with one intelligence item
    if (intel.length > 0) {
      setDisplayedIntel([intel[0]]);
    }
    
    // Add a new intel item every few seconds (staggered)
    const interval = setInterval(() => {
      setDisplayedIntel(current => {
        if (current.length < intel.length) {
          return [...current, intel[current.length]];
        }
        return current;
      });
    }, 3000);
    
    // Auto-rotate active intel item
    const rotateInterval = setInterval(() => {
      setActiveIndex(current => (current + 1) % displayedIntel.length);
    }, 7000);
    
    return () => {
      clearInterval(interval);
      clearInterval(rotateInterval);
    };
  }, [intel]);
  
  const getIntelIcon = (type: string) => {
    switch (type) {
      case 'map': return <Map className="h-5 w-5" />;
      case 'buzz': return <Search className="h-5 w-5" />;
      case 'notification': return <Bell className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };
  
  const getIntelRoute = (type: string) => {
    switch (type) {
      case 'map': return '/map';
      case 'buzz': return '/buzz';
      case 'notification': return '/notifications';
      default: return '/home';
    }
  };
  
  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'border-l-4 border-amber-500';
      case 'critical': return 'border-l-4 border-red-500';
      default: return 'border-l-4 border-cyan-500';
    }
  };

  return (
    <motion.div 
      className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-cyan-300 flex items-center">
          <Bell className="inline mr-2 h-5 w-5" />
          Feed Operativo
        </h2>
        <span className="text-xs text-cyan-400">
          <Clock className="inline mr-1 h-3 w-3" /> LIVE
        </span>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {displayedIntel.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: index === activeIndex ? 1.03 : 1,
                boxShadow: index === activeIndex ? "0 0 15px rgba(0, 229, 255, 0.3)" : "none"
              }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`p-3 bg-black/60 ${getUrgencyClass(item.urgency)} rounded-lg cursor-pointer hover:bg-black/80 transition-colors`}
              onClick={() => navigate(getIntelRoute(item.type))}
            >
              <div className="flex">
                <div className={`p-2 rounded-full mr-3 ${
                  item.urgency === 'critical' ? 'bg-red-900/30 text-red-400' : 
                  item.urgency === 'urgent' ? 'bg-amber-900/30 text-amber-400' : 
                  'bg-cyan-900/30 text-cyan-400'
                }`}>
                  {getIntelIcon(item.type)}
                </div>
                <div>
                  <p className="text-sm text-white">{item.message}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(item.timestamp), {
                        addSuffix: true,
                        locale: it
                      })}
                    </span>
                    {item.location && (
                      <span className="text-xs text-cyan-400">{item.location}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
