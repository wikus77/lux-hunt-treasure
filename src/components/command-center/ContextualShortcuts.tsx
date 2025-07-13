
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Map, Search, Award, Bell, Zap } from "lucide-react";

interface Shortcut {
  icon: React.FC<{ className?: string }>;
  label: string;
  path: string;
  color: string;
  highlightColor: string;
  highlight?: boolean;
}

interface ContextualShortcutsProps {
  buzzActive?: boolean;
  mapActivity?: boolean;
  leaderboardChange?: boolean;
}

export const ContextualShortcuts: React.FC<ContextualShortcutsProps> = ({
  buzzActive = false,
  mapActivity = false,
  leaderboardChange = false
}) => {
  const navigate = useNavigate();
  
  const shortcuts: Shortcut[] = [
    {
      icon: Map,
      label: "Mappa",
      path: "/map",
      color: "bg-green-900/30",
      highlightColor: "bg-green-500",
      highlight: mapActivity
    },
    {
      icon: Zap,
      label: "Indizi",
      path: "/buzz",
      color: "bg-amber-900/30",
      highlightColor: "bg-amber-500",
      highlight: buzzActive
    },
    {
      icon: Award,
      label: "Classifica",
      path: "/leaderboard",
      color: "bg-purple-900/30",
      highlightColor: "bg-purple-500",
      highlight: leaderboardChange
    },
    {
      icon: Bell,
      label: "Comunicazioni",
      path: "/notifications",
      color: "bg-cyan-900/30", 
      highlightColor: "bg-cyan-500",
      highlight: false
    }
  ];

  return (
    <motion.div 
      className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex justify-around">
        {shortcuts.map((shortcut) => (
          <motion.div
            key={shortcut.label}
            className="flex flex-col items-center cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(shortcut.path)}
          >
            <motion.div 
              className={`w-12 h-12 rounded-full flex items-center justify-center ${shortcut.color} relative`}
              animate={{ 
                boxShadow: shortcut.highlight 
                  ? ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.5)", "0 0 0px rgba(255,255,255,0)"] 
                  : "none" 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity
              }}
            >
              <shortcut.icon className={`w-5 h-5 ${shortcut.highlight ? 'text-white' : 'text-white/70'}`} />
              {shortcut.highlight && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity
                  }}
                  style={{ 
                    background: `radial-gradient(circle, ${shortcut.highlightColor}50 0%, transparent 70%)` 
                  }}
                />
              )}
            </motion.div>
            <span className="text-xs text-white/80 mt-1">{shortcut.label}</span>
            {shortcut.highlight && (
              <motion.div
                className={`h-1 w-1 rounded-full ${shortcut.highlightColor}`}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
