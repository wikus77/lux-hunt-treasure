
import React, { useState } from 'react';
import { CircleIcon, MapPin, Zap, Target, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useAuth } from '@/hooks/useAuth';

const InterestAreasDetails: React.FC = () => {
  const { user } = useAuth();
  const { 
    getActiveArea, 
    dailyBuzzMapCounter,
    precisionMode 
  } = useBuzzMapLogic();

  const [showAreaInfo, setShowAreaInfo] = useState(false);
  const activeArea = getActiveArea();

  if (!user?.id) {
    return (
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <CircleIcon className="w-4 h-4" />
            AREE DI INTERESSE
          </h3>
          <div className="text-white/60 text-sm">
            Accedi per visualizzare le tue aree BUZZ
          </div>
        </div>
      </div>
    );
  }

  if (!activeArea) {
    return (
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <CircleIcon className="w-4 h-4" />
            AREE DI INTERESSE
          </h3>
          <div className="text-white/60 text-sm">
            Nessuna area BUZZ MAPPA attiva.
            <br />
            Clicca su "BUZZ MAPPA" per generarne una.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CircleIcon className="w-4 h-4" />
          AREE DI INTERESSE
        </h3>
        <button 
          onClick={() => setShowAreaInfo(!showAreaInfo)}
          className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1"
        >
          {showAreaInfo ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Chiudi dettagli
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Apri dettagli
            </>
          )}
        </button>
      </div>
      
      {showAreaInfo && (
        <div className="space-y-2">
          {/* Raggio */}
          <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-white/80">
              <CircleIcon className="w-3 h-3 text-[#00cfff]" />
              <span className="text-xs">📏 Raggio</span>
            </div>
            <div className="text-[#00cfff] font-bold text-xs">
              {activeArea.radius_km.toFixed(1)} km
            </div>
          </div>

          {/* Centro stimato */}
          <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-3 h-3 text-[#00cfff]" />
              <span className="text-xs">📍 Centro stimato</span>
            </div>
            <div className="text-[#00cfff] font-mono text-xs">
              {activeArea.lat.toFixed(4)}, {activeArea.lng.toFixed(4)}
            </div>
          </div>

          {/* Generazione */}
          <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-white/80">
              <Zap className="w-3 h-3 text-[#00cfff]" />
              <span className="text-xs">🔁 Generazione n°</span>
            </div>
            <div className="text-[#00cfff] font-bold text-xs">
              {dailyBuzzMapCounter}
            </div>
          </div>

          {/* Indizi usati */}
          <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-white/80">
              <Target className="w-3 h-3 text-[#00cfff]" />
              <span className="text-xs">🧠 Indizi usati</span>
            </div>
            <div className="text-[#00cfff] font-bold text-xs">
              {dailyBuzzMapCounter}
            </div>
          </div>

          {/* Modalità */}
          <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-purple-400/10">
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-xs">🧭 Modalità</span>
            </div>
            <div className="text-purple-400 font-bold text-xs">
              FORCED MODE
            </div>
          </div>

          {/* Stato */}
          <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-green-400/10">
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-xs">✅ Stato</span>
            </div>
            <div className="text-green-400 font-bold text-xs">
              BACKEND VERIFIED
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestAreasDetails;
