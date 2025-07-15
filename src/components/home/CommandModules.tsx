import React from 'react';
import { motion } from 'framer-motion';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { Map, Zap, Gamepad2, Users, Trophy, Bell } from 'lucide-react';

const modules = [
  {
    id: 'map',
    title: 'MAPPA',
    subtitle: 'Esplora Zone',
    icon: Map,
    route: '/map',
    color: 'cyan',
    description: 'Naviga la città e scopri le aree'
  },
  {
    id: 'buzz',
    title: 'BUZZ',
    subtitle: 'Attiva Area',
    icon: Zap,
    route: '/buzz',
    color: 'yellow',
    description: 'Attiva la tua zona di caccia'
  },
  {
    id: 'games',
    title: 'GIOCHI',
    subtitle: 'Mini Games',
    icon: Gamepad2,
    route: '/games',
    color: 'purple',
    description: 'Gioca e vinci punti extra'
  },
  {
    id: 'leaderboard',
    title: 'CLASSIFICA',
    subtitle: 'Top Hunters',
    icon: Trophy,
    route: '/leaderboard',
    color: 'orange',
    description: 'Scopri chi è il migliore'
  }
];

export const CommandModules: React.FC = () => {
  const { navigate } = useWouterNavigation();

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {modules.map((module, index) => {
        const Icon = module.icon;
        
        return (
          <motion.div
            key={module.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(module.route)}
            className="relative group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-md rounded-xl p-4 border border-gray-800 group-hover:border-cyan-500/40 transition-all duration-300">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg bg-${module.color}-500/20 flex items-center justify-center mb-3 group-hover:bg-${module.color}-500/30 transition-colors`}>
                <Icon className={`w-5 h-5 text-${module.color}-400`} />
              </div>

              {/* Content */}
              <h3 className="text-white font-orbitron font-bold text-sm mb-1">
                {module.title}
              </h3>
              <p className="text-gray-400 text-xs mb-2">
                {module.subtitle}
              </p>
              <p className="text-gray-500 text-xs leading-tight">
                {module.description}
              </p>

              {/* Hover Glow */}
              <div className={`absolute inset-0 bg-${module.color}-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};