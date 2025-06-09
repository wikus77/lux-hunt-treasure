
import React from 'react';
import { CircleIcon } from 'lucide-react';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useAuth } from '@/hooks/useAuth';

const InterestAreasCounter: React.FC = () => {
  const { user } = useAuth();
  const { currentWeekAreas } = useBuzzMapLogic();

  if (!user?.id) {
    return (
      <div>
        <h3 className="text-xl font-bold text-[#00D1FF] mb-4 flex items-center gap-2">
          <CircleIcon className="w-5 h-5" />
          Aree di interesse (0)
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
        Aree di interesse ({currentWeekAreas.length})
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
  );
};

export default InterestAreasCounter;
