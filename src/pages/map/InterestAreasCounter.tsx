
import React from 'react';
import { CircleIcon } from 'lucide-react';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useAuth } from '@/hooks/useAuth';

const InterestAreasCounter: React.FC = () => {
  const { user } = useAuth();
  const { currentWeekAreas } = useBuzzMapLogic();

  if (!user?.id) {
    return (
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">
            AREE DI INTERESSE
          </h3>
          <div className="text-gray-400 text-sm">
            Accedi per visualizzare le tue aree BUZZ
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-gray-500">0</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">
          AREE DI INTERESSE
        </h3>
        <div className="text-gray-400 text-sm">
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
      <div className="text-right">
        <span className="text-4xl font-bold text-white">{currentWeekAreas.length}</span>
      </div>
    </div>
  );
};

export default InterestAreasCounter;
