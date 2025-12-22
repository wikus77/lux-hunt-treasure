// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SearchLocationPill - Fly to any city/location on the map
import React, { useState, useRef } from 'react';
import { Search, Navigation2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchLocationPillProps {
  map: maplibregl.Map | null;
}

// Get MapTiler key based on environment
const getMapTilerKey = (): string => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isPreview = hostname.includes('lovable') || hostname.includes('pages.dev') || hostname === 'localhost' || hostname === '127.0.0.1';
  return isPreview 
    ? (import.meta.env.VITE_MAPTILER_KEY_DEV || '')
    : (import.meta.env.VITE_MAPTILER_KEY_PROD || '');
};

export const SearchLocationPill: React.FC<SearchLocationPillProps> = ({ map }) => {
  const mapTilerKey = getMapTilerKey();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!query.trim() || !map) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use MapTiler Geocoding API
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `https://api.maptiler.com/geocoding/${encodedQuery}.json?key=${mapTilerKey}&limit=1`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const placeName = data.features[0].place_name || query;
        
        console.log('🗺️ Flying to:', placeName, { lat, lng });
        
        // Fly to the location
        map.flyTo({
          center: [lng, lat],
          zoom: 12,
          pitch: 45,
          bearing: 0,
          essential: true,
          duration: 2500
        });
        
        // Clear and collapse
        setQuery('');
        setIsExpanded(false);
        
      } else {
        setError('Luogo non trovato');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Errore di ricerca');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsExpanded(false);
      setQuery('');
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setError(null);
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ width: isExpanded ? 260 : 48 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div
        className="flex items-center gap-1 rounded-full overflow-visible"
        style={{
          background: 'rgba(10, 15, 25, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 209, 255, 0.4)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 209, 255, 0.15)',
          height: 48,
          padding: isExpanded ? '0 6px 0 8px' : '0',
          width: '100%',
        }}
      >
        {/* Search Icon / Toggle Button */}
        <motion.button
          onClick={toggleExpanded}
          className="flex items-center justify-center flex-shrink-0"
          style={{ 
            width: isExpanded ? 28 : 48, 
            height: 48,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? (
            <X className="w-4 h-4 text-gray-400" />
          ) : (
            <Search className="w-5 h-5 text-cyan-400" />
          )}
        </motion.button>

        {/* Input Field */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex items-center gap-1 flex-1"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ minWidth: 0 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cerca..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-500"
                style={{ minWidth: 80, width: '100%' }}
                disabled={isLoading}
              />
              
              {/* Go Button - Compact for mobile */}
              <motion.button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  background: query.trim() 
                    ? 'linear-gradient(135deg, #00D1FF 0%, #0099CC 100%)' 
                    : 'rgba(255,255,255,0.15)',
                  border: 'none',
                  cursor: query.trim() ? 'pointer' : 'not-allowed',
                  opacity: query.trim() ? 1 : 0.5,
                  boxShadow: query.trim() ? '0 0 10px rgba(0, 209, 255, 0.4)' : 'none'
                }}
                whileHover={query.trim() ? { scale: 1.1 } : {}}
                whileTap={query.trim() ? { scale: 0.9 } : {}}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Navigation2 className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 px-3 py-2 rounded-lg text-xs text-red-400"
            style={{
              background: 'rgba(255, 50, 50, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 50, 50, 0.3)'
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchLocationPill;

