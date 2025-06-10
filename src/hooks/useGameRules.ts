
export interface GameRules {
  weeklyBuzzLimits: {
    Free: number;
    Silver: number;
    Gold: number;
    Black: number;
  };
  mapRadiusProgression: {
    week1: { generation1: number; generation2: number; maxGenerations: number };
    week2: { generation1: number; generation2: number; generation3: number; maxGenerations: number };
    week3: { generation1: number; generation2: number; generation3: number; maxGenerations: number };
    week4: { generation1: number; generation2: number; generation3: number; generation4: number; maxGenerations: number };
  };
  clueRules: {
    noCityNames: boolean;
    useGenericLocations: boolean;
    maxCluesPerBuzz: number;
  };
  paymentRules: {
    requireVerificationBeforeAccess: boolean;
    blockUnpaidUsers: boolean;
    fakePaymentForDeveloper: boolean;
  };
}

export const MISSION_GAME_RULES: GameRules = {
  weeklyBuzzLimits: {
    Free: 1,        // CORRETTO: 1 BUZZ settimanale per Free
    Silver: 3,      // CORRETTO: 3 BUZZ settimanali per Silver
    Gold: 7,        // CORRETTO: 7 BUZZ settimanali per Gold  
    Black: 999,     // Illimitato per Black (solo developer)
  },
  mapRadiusProgression: {
    week1: { 
      generation1: 500, // CORRETTO: 500km iniziale - SETTIMANA 1
      generation2: 475, // -5% riduzione
      maxGenerations: 2 
    },
    week2: { 
      generation1: 350, 
      generation2: 332.5, 
      generation3: 315.875, 
      maxGenerations: 3 
    },
    week3: { 
      generation1: 250, 
      generation2: 237.5, 
      generation3: 225.625, 
      maxGenerations: 3 
    },
    week4: { 
      generation1: 100, 
      generation2: 95, 
      generation3: 90.25, 
      generation4: 85.7375, 
      maxGenerations: 4 
    },
  },
  clueRules: {
    noCityNames: true, // SEVERO: Mai nomi di città negli indizi
    useGenericLocations: true,
    maxCluesPerBuzz: 1,
  },
  paymentRules: {
    requireVerificationBeforeAccess: true,
    blockUnpaidUsers: true,
    fakePaymentForDeveloper: true, // Solo per test developer
  },
};

export const useGameRules = () => {
  const getCurrentWeek = (): number => {
    // LANCIO UFFICIALE: 19 luglio = settimana 1
    return 1;
  };

  const getMapRadius = (week: number, generation: number): number => {
    const weekKey = `week${Math.min(week, 4)}` as keyof typeof MISSION_GAME_RULES.mapRadiusProgression;
    const weekRules = MISSION_GAME_RULES.mapRadiusProgression[weekKey];
    
    if (generation === 1) return weekRules.generation1;
    if (generation === 2) return weekRules.generation2;
    if (generation === 3 && 'generation3' in weekRules) return weekRules.generation3;
    if (generation === 4 && 'generation4' in weekRules) return weekRules.generation4;
    
    return weekRules.generation1; // Default alla prima generazione
  };

  const getBuzzLimit = (tier: string): number => {
    return MISSION_GAME_RULES.weeklyBuzzLimits[tier as keyof typeof MISSION_GAME_RULES.weeklyBuzzLimits] || 1;
  };

  const validateClueContent = (clueText: string): boolean => {
    if (!MISSION_GAME_RULES.clueRules.noCityNames) return true;
    
    // LISTA SEVERA: tutte le città da bannare negli indizi
    const forbiddenCities = [
      'ventimiglia', 'sanremo', 'imperia', 'genova', 'milano', 
      'torino', 'roma', 'napoli', 'palermo', 'catania', 'bari',
      'firenze', 'bologna', 'venezia', 'verona', 'padova',
      'nice', 'cannes', 'monaco', 'montecarlo', 'nizza'
    ];
    
    const lowerClue = clueText.toLowerCase();
    
    return !forbiddenCities.some(city => lowerClue.includes(city));
  };

  return {
    getCurrentWeek,
    getMapRadius,
    getBuzzLimit,
    validateClueContent,
    gameRules: MISSION_GAME_RULES,
  };
};
