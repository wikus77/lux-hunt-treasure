import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, MapPin } from 'lucide-react';

interface Clue {
  id: string;
  title: string;
  description?: string;
  foundAt: Date;
  location: {
    lat: number;
    lng: number;
  };
  type: 'location' | 'item' | 'code' | 'riddle';
}

interface ClueOverlayProps {
  clues?: Clue[];
  isVisible?: boolean;
  className?: string;
}

// Dati finti per demo
const mockClues: Clue[] = [
  {
    id: '1',
    title: 'Fontana di Trevi',
    description: 'Moneta nel desiderio',
    foundAt: new Date('2025-01-15T14:30:00'),
    location: { lat: 41.9009, lng: 12.4833 },
    type: 'location'
  },
  {
    id: '2', 
    title: 'Codice Segreto #A4',
    description: 'Sequenza numerica nascosta',
    foundAt: new Date('2025-01-14T16:45:00'),
    location: { lat: 41.8986, lng: 12.4768 },
    type: 'code'
  },
  {
    id: '3',
    title: 'Chiave Antica',
    description: 'Reliquia del passato',
    foundAt: new Date('2025-01-13T11:20:00'),
    location: { lat: 41.9028, lng: 12.4964 },
    type: 'item'
  }
];

const ClueOverlay: React.FC<ClueOverlayProps> = ({ 
  clues = mockClues, 
  isVisible = true,
  className = '' 
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getClueIcon = (type: Clue['type']) => {
    switch (type) {
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'code':
        return <Search className="w-4 h-4" />;
      case 'item':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`absolute top-4 left-4 z-[1000] w-80 max-w-[calc(100vw-2rem)] ${className}`}
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 209, 255, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 0 20px rgba(0, 209, 255, 0.2), 0 4px 16px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-[#00D1FF] font-semibold text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              Indizi Trovati
            </h3>
          </div>

          {/* Clues List */}
          <div className="max-h-64 overflow-y-auto">
            {clues.length > 0 ? (
              <div className="space-y-2 p-4">
                {clues.map((clue, index) => (
                  <motion.div
                    key={clue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div 
                      className="p-3 rounded-lg transition-all duration-200 hover:bg-white/5 cursor-pointer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div 
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                          style={{
                            background: 'linear-gradient(135deg, #00D1FF, #7B2EFF)',
                            boxShadow: '0 0 12px rgba(0, 209, 255, 0.4)'
                          }}
                        >
                          {getClueIcon(clue.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">
                            {clue.title}
                          </h4>
                          {clue.description && (
                            <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                              {clue.description}
                            </p>
                          )}
                          
                          {/* Date */}
                          <div className="flex items-center gap-1 mt-2">
                            <Calendar className="w-3 h-3 text-[#00D1FF]" />
                            <span className="text-[#00D1FF] text-xs font-medium">
                              {formatDate(clue.foundAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Glow effect on hover */}
                      <div 
                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.1), rgba(123, 46, 255, 0.1))',
                          boxShadow: '0 0 20px rgba(0, 209, 255, 0.2)'
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="p-6 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400 text-sm">
                  Nessun indizio trovato
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Esplora la mappa per scoprire nuovi segreti
                </p>
              </div>
            )}
          </div>

          {/* Neon border glow */}
          <div 
            className="absolute inset-0 rounded-16px pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent, rgba(0, 209, 255, 0.1), transparent)',
              filter: 'blur(1px)'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClueOverlay;