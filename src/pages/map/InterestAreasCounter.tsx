
import React from 'react';
import { CircleIcon } from 'lucide-react';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useAuth } from '@/hooks/useAuth';

const InterestAreasCounter: React.FC = () => {
  const { user } = useAuth();
  const { currentWeekAreas } = useBuzzMapLogic();

  if (!user?.id) {
    return (
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <CircleIcon className="w-4 h-4" />
            M1SSION AREA
          </h3>
          <div className="text-white/60 text-sm">
            Accedi per visualizzare le tue aree BUZZ
          </div>
        </div>
        <div className="text-white/40 text-right">
          <span className="text-2xl font-bold">0</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <CircleIcon className="w-4 h-4" />
          M1SSION AREA
        </h3>
        <div className="text-white/60 text-sm">
          {currentWeekAreas.length === 0 ? (
            <>
              Nessuna area BUZZ MAPPA attiva.
              <br />
              Clicca su "BUZZ MAPPA" per generarne una.
            </>
          ) : (
            `Hai ${currentWeekAreas.length} area${currentWeekAreas.length > 1 ? 'e' : ''} attiv${currentWeekAreas.length > 1 ? 'e' : 'a'} questa settimana.`
          )}
        </div>
      </div>
      <div className="text-white/90 text-right">
        <span className="text-2xl font-bold">{currentWeekAreas.length}</span>
      </div>
    </div>
  );
};

export default InterestAreasCounter;
