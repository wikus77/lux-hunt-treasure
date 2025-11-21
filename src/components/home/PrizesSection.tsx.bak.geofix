import React from 'react';
import { motion } from 'framer-motion';
import { Gift, MapPin, Calendar } from 'lucide-react';

interface Prize {
  id: string;
  title: string;
  description: string;
  location: string;
  deadline: string;
  type: 'physical' | 'digital' | 'experience';
  status: 'active' | 'completed' | 'locked';
}

interface PrizesSectionProps {
  prizes: Prize[];
}

const typeColors = {
  physical: 'green',
  digital: 'blue',
  experience: 'purple'
};

const statusColors = {
  active: 'cyan',
  completed: 'green',
  locked: 'gray'
};

export const PrizesSection: React.FC<PrizesSectionProps> = ({ prizes }) => {
  return (
    <div className="mb-8">
      {/* Header */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center space-x-3 mb-4"
      >
        <Gift className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-orbitron font-bold text-white">
          PREMI ATTIVI
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
      </motion.div>

      {/* Prizes List */}
      <div className="space-y-4">
        {prizes.slice(0, 4).map((prize, index) => (
          <motion.div
            key={prize.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="relative group cursor-pointer"
          >
            <div className="bg-gradient-to-r from-gray-900/80 to-black/60 backdrop-blur-md rounded-xl p-4 border border-gray-800 group-hover:border-cyan-500/40 transition-all duration-300">
              <div className="flex items-start space-x-4">
                {/* Prize Icon */}
                <div className={`w-12 h-12 rounded-lg bg-${typeColors[prize.type]}-500/20 flex items-center justify-center flex-shrink-0`}>
                  <Gift className={`w-6 h-6 text-${typeColors[prize.type]}-400`} />
                </div>

                {/* Prize Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold text-lg truncate">
                      {prize.title}
                    </h3>
                    <div className={`bg-${statusColors[prize.status]}-500/20 px-2 py-1 rounded-full`}>
                      <span className={`text-${statusColors[prize.status]}-400 text-xs font-bold uppercase`}>
                        {prize.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {prize.description}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{prize.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{prize.deadline}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar (se attivo) */}
              {prize.status === 'active' && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-cyan-400">72%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1">
                    <div className="bg-cyan-500 h-1 rounded-full w-3/4"></div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};