
import React from 'react';
import { CircleIcon, MapPin, Zap, CreditCard, Target, Shield } from 'lucide-react';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useAuth } from '@/hooks/useAuth';

const InterestAreasSection: React.FC = () => {
  const { user } = useAuth();
  const { 
    getActiveArea, 
    dailyBuzzMapCounter,
    precisionMode 
  } = useBuzzMapLogic();

  const activeArea = getActiveArea();

  if (!user?.id) {
    return (
      <div>
        <h3 className="text-xl font-bold text-[#00D1FF] mb-4 flex items-center gap-2">
          <CircleIcon className="w-5 h-5" />
          Aree di interesse
        </h3>
        <div className="text-white/60 text-sm">
          Accedi per visualizzare le tue aree BUZZ
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-[#00D1FF] mb-4 flex items-center gap-2">
        <CircleIcon className="w-5 h-5" />
        Aree di interesse
      </h3>
      
      {!activeArea ? (
        <div className="text-white/60 text-sm">
          Nessuna area BUZZ MAPPA attiva.
          <br />
          Clicca su "BUZZ MAPPA" per generarne una.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Raggio */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-[#00D1FF]/20">
            <div className="flex items-center gap-2 text-white/80">
              <CircleIcon className="w-4 h-4 text-[#00D1FF]" />
              <span className="text-sm">📏 Raggio</span>
            </div>
            <div className="text-[#00D1FF] font-bold">
              {activeArea.radius_km.toFixed(1)} km
            </div>
          </div>

          {/* Centro stimato */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-[#00D1FF]/20">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4 text-[#00D1FF]" />
              <span className="text-sm">📍 Centro stimato</span>
            </div>
            <div className="text-[#00D1FF] font-mono text-xs">
              {activeArea.lat.toFixed(4)}, {activeArea.lng.toFixed(4)}
            </div>
          </div>

          {/* Generazione */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-[#00D1FF]/20">
            <div className="flex items-center gap-2 text-white/80">
              <Zap className="w-4 h-4 text-[#00D1FF]" />
              <span className="text-sm">🔁 Generazione n°</span>
            </div>
            <div className="text-[#00D1FF] font-bold">
              {dailyBuzzMapCounter}
            </div>
          </div>

          {/* Indizi usati */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-[#00D1FF]/20">
            <div className="flex items-center gap-2 text-white/80">
              <Target className="w-4 h-4 text-[#00D1FF]" />
              <span className="text-sm">🧠 Indizi usati</span>
            </div>
            <div className="text-[#00D1FF] font-bold">
              {dailyBuzzMapCounter}
            </div>
          </div>

          {/* Modalità */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm">🧭 Modalità</span>
            </div>
            <div className="text-purple-400 font-bold text-xs">
              FORCED MODE
            </div>
          </div>

          {/* Stato */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm">✅ Stato</span>
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

export default InterestAreasSection;
