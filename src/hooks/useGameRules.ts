
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
    Free: 1,
    Silver: 7,
    Gold: 14,
    Black: 999, // Illimitato per Black
  },
  mapRadiusProgression: {
    week1: { 
      generation1: 500, // km - REGOLA CORRETTA
      generation2: 400, 
      maxGenerations: 2 
    },
    week2: { 
      generation1: 350, 
      generation2: 300, 
      generation3: 250, 
      maxGenerations: 3 
    },
    week3: { 
      generation1: 250, 
      generation2: 200, 
      generation3: 150, 
      maxGenerations: 3 
    },
    week4: { 
      generation1: 100, 
      generation2: 50, 
      generation3: 15, 
      generation4: 5, 
      maxGenerations: 4 
    },
  },
  clueRules: {
    noCityNames: true, // IMPERATIVO: Mai nomi di città
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
    // Simula che oggi sia 19 luglio - settimana 1
    return 1;
  };

  const getMapRadius = (week: number, generation: number): number => {
    const weekKey = `week${Math.min(week, 4)}` as keyof typeof MISSION_GAME_RULES.mapRadiusProgression;
    const weekRules = MISSION_GAME_RULES.mapRadiusProgression[weekKey];
    
    if (generation === 1) return weekRules.generation1;
    if (generation === 2) return weekRules.generation2;
    if (generation === 3 && 'generation3' in weekRules) return weekRules.generation3;
    if (generation === 4 && 'generation4' in weekRules) return weekRules.generation4;
    
    return weekRules.generation1; // Default
  };

  const getBuzzLimit = (tier: string): number => {
    return MISSION_GAME_RULES.weeklyBuzzLimits[tier as keyof typeof MISSION_GAME_RULES.weeklyBuzzLimits] || 1;
  };

  const validateClueContent = (clueText: string): boolean => {
    if (!MISSION_GAME_RULES.clueRules.noCityNames) return true;
    
    // Lista città da bannare negli indizi
    const forbiddenCities = ['ventimiglia', 'sanremo', 'imperia', 'genova', 'milano', 'torino', 'roma'];
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
